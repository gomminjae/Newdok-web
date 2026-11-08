'use client';

import Link from 'next/link';
import { memo, useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { articleApi, articleKeys, articleQueries, type Article } from '@/entities/article';
import { subscriptionQueries } from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';
import { AppImage, Button, ButtonLink, Icon, LoadingState } from '@/shared/ui';
import { CalendarPopup } from '@/widgets/calendar';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const EMPTY_ARTICLES: Article[] = [];
const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function today() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  return <HomeContent key={isLoggedIn ? 'member' : 'guest'} isLoggedIn={isLoggedIn} />;
}

function HomeContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  // 정적 HTML에 빌드 시점의 날짜가 남지 않도록 브라우저 날짜가 준비되면 표시한다.
  const isHydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [selectedDate, setSelectedDate] = useState(today);
  const [displayedMonth, setDisplayedMonth] = useState(today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshAngle, setRefreshAngle] = useState(0);
  const queryClient = useQueryClient();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  const dayQuery = useQuery({
    ...articleQueries.day(year, month, day),
    enabled: isLoggedIn,
    staleTime: 30_000,
  });
  const subscriptions = useQuery({ ...subscriptionQueries.active(), enabled: isLoggedIn, staleTime: 30_000 });
  const monthlyQuery = useQuery({
    ...articleQueries.monthly(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1),
    enabled: isLoggedIn && showCalendar,
    staleTime: 60_000,
  });
  const articles = dayQuery.data ?? EMPTY_ARTICLES;
  const calendarDataDays = useMemo(
    () => new Set(monthlyQuery.data?.filter((date) => date.hasArticles).map((date) => date.publishDate)),
    [monthlyQuery.data],
  );

  const refresh = useMutation({
    mutationFn: async () => {
      const date = today();
      if (isLoggedIn) {
        await articleApi.refresh();
        const daily = articleQueries.day(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const monthly = articleQueries.monthly(date.getFullYear(), date.getMonth() + 1);
        const active = subscriptionQueries.active();
        await Promise.all([daily, monthly, active].map(({ queryKey }) =>
          queryClient.invalidateQueries({ queryKey, refetchType: 'none' }),
        ));
        await Promise.all([
          queryClient.fetchQuery(daily),
          queryClient.fetchQuery(monthly),
          queryClient.fetchQuery(active),
        ]);
      }
      return date;
    },
    onMutate: () => setRefreshAngle((angle) => angle + 360),
    onSuccess: (date) => {
      setSelectedDate(date);
      setDisplayedMonth(date);
    },
  });

  const markAsRead = useCallback((id: number) => {
    queryClient.setQueryData<Article[]>(articleKeys.day(year, month, day), (previous) =>
      previous?.map((article) => article.id === id && article.status !== 'Read' ? { ...article, status: 'Read' } : article),
    );
  }, [queryClient, year, month, day]);

  const isLoading = !isHydrated || (isLoggedIn && (dayQuery.isPending || (articles.length === 0 && subscriptions.isPending)));
  const isError = isLoggedIn && (dayQuery.isError || (subscriptions.isError && articles.length === 0));
  const refreshButton = <Button variant="ghost" size="compact" disabledTone="preserve" disabled={refresh.isPending}
    aria-busy={refresh.isPending} onClick={() => refresh.mutate()}>
    <span aria-hidden="true" className="inline-flex transition-transform duration-800 ease-linear" style={{ transform: `rotate(${refreshAngle}deg)` }}>
      <Icon name="Line Reload" size={20} />
    </span>
    새로고침
  </Button>;

  return (
    <section aria-label="홈" className="home-page -mx-4 -mb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] flex min-h-[calc(100dvh-var(--header-height))] flex-col bg-bg-system pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] md:-mx-6 md:-mb-8 md:pb-8 xl:-mx-10">
      {isLoading ? (
        <LoadingState label="홈을 불러오는 중이에요." className="flex-1" />
      ) : <>
        <div className="mx-2 mb-2 flex h-[52px] shrink-0 items-center justify-between rounded-lg bg-bg px-6">
          <span className="text-base font-bold text-caption-strong">
            {month}월 {day}일({WEEKDAYS[selectedDate.getDay()]})
          </span>
          <button type="button" aria-label="캘린더" aria-haspopup="dialog" aria-expanded={showCalendar}
            className="-mr-2.5 flex h-11 w-11 items-center justify-center rounded-sm text-caption-heavy"
            onClick={() => { setDisplayedMonth(selectedDate); setShowCalendar(true); }}>
            <Icon name="Line Calendar" />
          </button>
        </div>

        {refresh.isError && <p role="alert" className="px-6 py-3 text-center text-sm text-error">새로고침하지 못했어요. 잠시 후 다시 시도해주세요.</p>}
        {isError ? (
          <div role="alert" className="flex flex-col items-center px-6 py-20 text-center">
            <p className="text-base font-bold text-caption-heavy">홈을 불러오지 못했어요.</p>
            <Button variant="ghost" size="compact" className="mt-4" onClick={() => {
              void dayQuery.refetch();
              void subscriptions.refetch();
            }}>다시 시도</Button>
          </div>
        ) : isLoggedIn && articles.length > 0 ? (
          <div className="mx-2 mb-2 rounded-lg bg-bg pb-4">
            <div className="flex items-center justify-between gap-2 pt-5 pl-7 pr-6">
              <h2 className="min-w-0 text-lg leading-[22px] font-bold break-keep text-caption-heavy">{articles.length}개의 아티클이 도착했어요.</h2>
              <div className="-my-2.5 shrink-0">{refreshButton}</div>
            </div>
            <ArticleList articles={articles} onOpen={markAsRead} />
          </div>
        ) : (
          <HomeEmptyState type={!isLoggedIn ? 'guest' : subscriptions.data?.length === 0 ? 'noSubscriptions' : 'noArticles'}
            selectedDate={selectedDate} refreshButton={refreshButton} />
        )}
      </>}

      {showCalendar && <CalendarPopup selectedDate={selectedDate} displayedMonth={displayedMonth}
        onMonthChanged={setDisplayedMonth} dataDays={calendarDataDays} isLoading={monthlyQuery.isFetching}
        onDateSelected={setSelectedDate} onClose={() => setShowCalendar(false)} />}
    </section>
  );
}

function HomeEmptyState({ type, selectedDate, refreshButton }: {
  type: 'guest' | 'noSubscriptions' | 'noArticles';
  selectedDate: Date;
  refreshButton: ReactNode;
}) {
  const weekday = `${WEEKDAYS[selectedDate.getDay()]}요일`;
  const dayId = selectedDate.getDay() || 7;
  const content = {
    guest: { image: 'nologin' as const, title: '회원이 되면 뉴스레터를\n간편하게 모아볼 수 있어요!', subtitle: '', button: '회원가입', href: '/intro' },
    noSubscriptions: { image: 'nosubscribe' as const, title: '구독 중인 뉴스레터가 없어요.', subtitle: '뉴스레터를 구독하면\n발행일에 맞춰 여기에 배달해드려요.', button: '내게 필요한 뉴스레터 추천받기', href: '/search?tab=recommend' },
    noArticles: { image: 'nodata' as const, title: '오늘 도착한 아티클이 없어요.', subtitle: '구독 신청 이후 수신된 아티클만 볼 수 있어요.', button: `${weekday}에 발행되는 뉴스레터 보기`, href: `/search?tab=all&day=${dayId}` },
  }[type];

  return <div className="flex flex-col items-center pb-8 text-center">
    <div className="mt-0.5 self-end pr-4">{refreshButton}</div>
    <AppImage name={content.image} alt="" width={280} height={280}
      className="mt-3 h-[280px] w-[280px] max-w-full object-contain" />
    <h2 className="mt-6 px-6 text-base font-bold whitespace-pre-line text-caption-heavy">{content.title}</h2>
    {content.subtitle && <p className="mt-1 px-6 text-sm font-medium whitespace-pre-line text-caption-neutral">{content.subtitle}</p>}
    <div className="mt-6 w-full px-6 md:max-w-[528px]">
      <ButtonLink href={content.href} fullWidth>{content.button}</ButtonLink>
    </div>
    {type === 'guest' && <p className="mt-3 flex items-center gap-2 text-sm text-system-gray">
      이미 계정이 있나요?
      <Link href="/login" className="font-bold text-primary underline underline-offset-2">로그인</Link>
    </p>}
  </div>;
}

const ArticleList = memo(function ArticleList({ articles, onOpen }: { articles: Article[]; onOpen: (id: number) => void }) {
  return <ul aria-label="도착한 아티클" className="flex flex-col gap-2 px-5 pt-7">
    {articles.map((article) => <ArticleRow key={article.id} article={article} onOpen={onOpen} />)}
  </ul>;
});

const ArticleRow = memo(function ArticleRow({ article, onOpen }: { article: Article; onOpen: (id: number) => void }) {
  const isRead = article.status === 'Read';
  return <li>
    <Link href={`/articles/${article.id}`} onClick={() => onOpen(article.id)}
      className={clsx('flex h-[88px] items-center gap-3 rounded-lg p-4 inset-ring inset-ring-line-neutral transition-colors duration-250',
        isRead ? 'bg-line-neutral' : 'bg-bg hover:bg-bg-system')}>
      <NewsletterImage name={article.brandName} imageUrl={article.imageUrl} variant="article" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium">
          <span className="truncate text-caption-neutral">{article.brandName}</span>
          <span className={clsx('shrink-0', isRead ? 'text-caption-alternative' : 'text-primary')}>{isRead ? '읽음' : '안읽음'}</span>
        </div>
        <span className="truncate pr-5 text-sm font-medium text-caption-strong">{article.articleTitle}</span>
      </div>
    </Link>
  </li>;
});
