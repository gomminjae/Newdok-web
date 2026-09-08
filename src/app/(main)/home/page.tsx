'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { articleQueries, articleKeys, type Article } from '@/entities/article';
import { CalendarPopup } from '@/widgets/calendar';
import { useAuth } from '@/shared/hooks';
import { proxyImage } from '@/shared/lib';
import { EmptyState } from '@/shared/ui';
import { NewsletterExplorer } from '@/widgets/newsletter-explorer/NewsletterExplorer';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const queryClient = useQueryClient();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  const { data: articles = [], isLoading } = useQuery({
    ...articleQueries.day(year, month, day),
    enabled: isLoggedIn,
  });

  const { data: monthlyData = [] } = useQuery({
    ...articleQueries.monthly(year, month),
    enabled: isLoggedIn,
  });

  const calendarDataDays = useMemo(() => {
    const days = new Set<number>();
    monthlyData.forEach((d) => {
      if (d.hasArticles) days.add(d.publishDate);
    });
    return days;
  }, [monthlyData]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: articleKeys.day(year, month, day) });
  };

  if (!isLoggedIn) {
    return <NewsletterExplorer />;
  }

  return (
    <div className="bg-bg-system min-h-[calc(100vh-49px)] flex flex-col">
      {/* 날짜 바 */}
      <div className="flex items-center justify-between h-[52px] bg-bg rounded-xl mx-2 mb-2 px-6">
        <span className="text-base font-bold text-caption-strong">
          {formatDate(selectedDate)}
        </span>
        <button
          className="bg-transparent p-1 flex items-center"
          type="button"
          onClick={() => setShowCalendar(true)}
        >
          <img src="/images/Line Calendar.svg" alt="달력" width={24} height={24} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1 text-primary">로딩 중...</div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="아직 도착한 아티클이 없어요."
          description="뉴스레터를 구독하면 아티클을 받아볼 수 있어요."
          cta={
            <Link
              href="/search"
              className="inline-flex items-center justify-center w-full max-w-[320px] h-12 px-6 bg-primary text-white rounded font-bold hover:bg-primary-strong transition-colors"
            >
              뉴스레터 둘러보기
            </Link>
          }
        />
      ) : (
        <div className="bg-bg rounded-xl mx-2 mb-2 pb-4">
          <div className="flex items-center justify-between pt-5 px-7">
            <span className="text-lg font-bold text-caption-strong">
              {articles.length}개의 아티클이 도착했어요.
            </span>
            <button
              className="flex items-center gap-1 bg-transparent text-sm font-medium text-primary"
              type="button"
              onClick={handleRefresh}
            >
              <img src="/images/Line Reload.svg" alt="새로고침" width={20} height={20} />
              새로고침
            </button>
          </div>
          <div className="flex flex-col gap-2 px-5 pt-5">
            {articles.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {showCalendar && (
        <CalendarPopup
          selectedDate={selectedDate}
          dataDays={calendarDataDays}
          onDateSelected={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}

function ArticleRow({ article }: { article: Article }) {
  const isRead = article.status === 'Read';
  return (
    <Link
      href={`/articles/${article.id}`}
      className={clsx(
        'flex items-center gap-3 p-4 rounded-xl border border-neutral-150 transition-colors',
        isRead ? 'bg-neutral-150' : 'hover:bg-neutral-50',
      )}
    >
      {article.imageUrl ? (
        <img
          src={proxyImage(article.imageUrl)}
          alt={article.brandName}
          width={56}
          height={56}
          className="w-14 h-14 rounded-xl object-cover border border-neutral-200/40 flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-neutral-200/40 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-caption-neutral">
            {article.brandName}
          </span>
          <span
            className={clsx(
              'text-[11px] font-medium',
              isRead ? 'text-caption-alternative' : 'text-primary',
            )}
          >
            {isRead ? '읽음' : '안읽음'}
          </span>
        </div>
        <span className="text-sm font-medium text-caption-strong truncate pr-5">
          {article.articleTitle}
        </span>
      </div>
    </Link>
  );
}
