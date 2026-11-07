'use client';

import { Button, Chip, Dialog, EmptyState } from '@/shared/ui';

import Link from 'next/link';
import { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { bookmarkQueries, type Bookmark, type BookmarkSort } from '@/entities/article';
import { useAuth } from '@/shared/hooks';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';

const SORT_BY_MAP: Record<string, BookmarkSort> = {
  추가순: 'bookmark_date',
  '최근 아티클 순': 'article_date_desc',
  '오래된 아티클 순': 'article_date_asc',
};

export default function BookmarksPage() {
  const { isLoggedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedInterestId, setSelectedInterestId] = useState<number | undefined>();
  const [sortOrder, setSortOrder] = useState('추가순');
  const [showSort, setShowSort] = useState(false);

  const { data: interests = [], isError: interestsError, refetch: refetchInterests } = useQuery({
    ...bookmarkQueries.interests(),
    enabled: isLoggedIn,
  });

  const { data: bookmarkData, isLoading, isError, refetch } = useQuery({
    ...bookmarkQueries.list(selectedInterestId, SORT_BY_MAP[sortOrder]),
    enabled: isLoggedIn,
  });

  const categories: { id: number | undefined; name: string }[] = [
    { id: undefined, name: '전체' },
    ...interests.map((i) => ({ id: i.id, name: i.name })),
  ];

  return (
    <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg sm:-mx-6 sm:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
      {/* 카테고리 필터 */}
      <div className="flex gap-1 py-2 px-4 overflow-x-auto bg-bg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(isLoggedIn ? categories : [{ id: undefined, name: '전체' }]).map((cat) => (
          <Chip
            key={cat.id ?? 'all'}
            as="button"
            active={selectedCategory === cat.name}
            onClick={() => {
              setSelectedCategory(cat.name);
              setSelectedInterestId(cat.id);
            }}
          >
            {cat.name}
          </Chip>
        ))}
      </div>

      {interestsError && <div role="alert" className="px-6 text-sm"><p>관심사 필터를 불러오지 못했어요.</p><Button variant="ghost" size="compact" onClick={() => void refetchInterests()}>다시 시도</Button></div>}
      {showSort && <Dialog title="북마크 정렬" onClose={() => setShowSort(false)}><div className="flex flex-col items-start gap-3">{Object.keys(SORT_BY_MAP).map((order) => <Chip key={order} as="button" active={sortOrder === order} onClick={() => { setSortOrder(order); setShowSort(false); }}>{order}</Chip>)}</div></Dialog>}
      {/* 정렬 정보 */}
      <div className="flex items-center justify-between bg-bg px-6 pb-3 pt-5">
        <span className="text-xl font-bold text-primary">
          총 {isLoggedIn ? bookmarkData?.totalAmount ?? 0 : 0}개
        </span>
        <Chip as="button" aria-label={`정렬: ${sortOrder}`} aria-haspopup="dialog" onClick={() => setShowSort(true)}>
          {sortOrder}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 12V3m0 0L2.5 5.5M5 3l2.5 2.5M11 4v9m0 0-2.5-2.5M11 13l2.5-2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Chip>
      </div>

      {!isLoggedIn ? (
        <BookmarkEmpty guest />
      ) : isLoading ? (
        <div className="flex-1 bg-bg-system flex items-center justify-center text-caption-neutral">
          로딩 중...
        </div>
      ) : isError ? (
        <div role="alert"><EmptyState title="북마크를 불러오지 못했어요." cta={<Button onClick={() => void refetch()}>다시 시도</Button>} /></div>
      ) : !bookmarkData || bookmarkData.totalAmount === 0 ? (
        <BookmarkEmpty />
      ) : (
        <div className="flex-1 bg-bg-system px-6 py-5">
          {bookmarkData.bookmarkForMonth.map((section, i) => (
            <div key={section.month} className={clsx(i > 0 && 'mt-8')}>
              <p className="text-lg font-bold text-caption-strong mb-3">
                {section.month}
              </p>
              {section.bookmark.map((article) => (
                <BookmarkCard key={article.articleId} article={article} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkEmpty({ guest = false }: { guest?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center bg-bg-system px-6 pb-8 text-center">
      <img src="/images/app/emptybookmark.png" alt="" width={280} height={280} className="mb-6 mt-5 h-[280px] w-[280px] max-w-full object-contain" />
      <p className="mb-1 text-base font-bold text-caption-heavy">저장한 아티클이 없어요.</p>
      <p className="text-sm font-medium text-caption-neutral">
        {guest ? <><Link href="/login" className="text-primary underline underline-offset-2">로그인</Link> 후 다시 보고 싶은 아티클을 저장해보세요.</>
          : '북마크를 눌러 다시 보고싶은 아티클을 저장해보세요.'}
      </p>
    </div>
  );
}

const BookmarkCard = memo(function BookmarkCard({ article }: { article: Bookmark }) {
  return (
    <Link
      href={`/articles/${article.articleId}`}
      className="mb-2 block rounded-md border border-line-neutral bg-bg px-4 py-5 transition-colors hover:bg-neutral-50"
    >
      <p className="text-base font-bold text-caption-strong line-clamp-2 mb-2">
        {article.articleTitle}
      </p>
      <p className="text-sm font-normal text-caption-neutral line-clamp-2 mb-3">
        {article.sampleText}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <NewsletterImage name={article.brandName} imageUrl={article.imageURL} variant="bookmark" />
          <span className="text-xs font-medium text-[#808080]">
            {article.brandName}
          </span>
        </div>
        <span className="text-xs font-medium text-caption-assistive">
          {article.date.slice(0, 10)}
        </span>
      </div>
    </Link>
  );
});
