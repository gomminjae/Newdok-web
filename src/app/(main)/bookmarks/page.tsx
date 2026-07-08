'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { bookmarkQueries, type Bookmark } from '@/entities/article';
import { useAuth } from '@/shared/hooks';

const SORT_BY_MAP: Record<string, string> = {
  추가순: 'bookmarkDate',
  '최근 아티클 순': 'recent',
  '오래된 아티클 순': 'oldest',
};

export default function BookmarksPage() {
  const { isLoggedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedInterestId, setSelectedInterestId] = useState<number | undefined>();
  const [sortOrder] = useState('추가순');

  const { data: interests = [] } = useQuery({
    ...bookmarkQueries.interests(),
    enabled: isLoggedIn,
  });

  const { data: bookmarkData, isLoading } = useQuery({
    ...bookmarkQueries.list(selectedInterestId, SORT_BY_MAP[sortOrder]),
    enabled: isLoggedIn,
  });

  const categories: { id: number | undefined; name: string }[] = [
    { id: undefined, name: '전체' },
    ...interests.map((i) => ({ id: i.id, name: i.name })),
  ];

  if (!isLoggedIn) {
    return (
      <div className="bg-bg-system min-h-[calc(100vh-49px)] flex flex-col items-center justify-center text-center px-6 py-10">
        <p className="text-base font-bold text-caption-heavy mb-2">
          저장한 아티클이 없어요.
        </p>
        <p className="text-sm font-medium text-caption-neutral mb-6">
          로그인 후 다시 보고 싶은 아티클을 저장해보세요.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full max-w-[320px] h-12 px-6 bg-primary text-white rounded font-bold hover:bg-primary-strong transition-colors"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-[calc(100vh-49px)] flex flex-col">
      {/* 카테고리 필터 */}
      <div className="flex gap-1 py-2 px-4 overflow-x-auto bg-bg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.name);
              setSelectedInterestId(cat.id);
            }}
            className={clsx(
              'px-3.5 py-1.5 bg-bg border rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
              selectedCategory === cat.name
                ? 'border-primary text-primary'
                : 'border-neutral-150 text-caption-strong',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 정렬 정보 */}
      <div className="flex items-center justify-between pt-5 px-6 pb-3 bg-bg-system">
        <span className="text-xl font-bold text-primary">
          총 {bookmarkData?.totalAmount ?? 0}개
        </span>
        <button
          type="button"
          className="flex items-center bg-transparent text-[13px] font-medium text-caption-strong"
        >
          {sortOrder}
          <Image src="/images/Line Down.svg" alt="" width={20} height={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 bg-bg-system flex items-center justify-center text-caption-neutral">
          로딩 중...
        </div>
      ) : !bookmarkData || bookmarkData.totalAmount === 0 ? (
        <div className="flex-1 bg-bg-system flex flex-col items-center justify-center text-center px-6 py-16">
          <p className="text-base font-bold text-caption-heavy mb-2">
            아직 북마크한 아티클이 없어요.
          </p>
          <p className="text-sm font-medium text-caption-neutral">
            마음에 드는 아티클을 북마크해보세요.
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-bg-system px-6 pb-5">
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

function BookmarkCard({ article }: { article: Bookmark }) {
  return (
    <Link
      href={`/articles/${article.articleId}`}
      className="block bg-bg rounded-lg border border-neutral-150 p-4 px-4 py-5 mb-2 transition-colors hover:bg-neutral-50"
    >
      <p className="text-base font-bold text-caption-strong line-clamp-2 mb-2">
        {article.articleTitle}
      </p>
      <p className="text-sm font-normal text-caption-neutral line-clamp-2 mb-3">
        {article.sampleText}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {article.imageURL ? (
            <Image
              src={article.imageURL}
              alt={article.brandName}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover border border-neutral-150"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-neutral-200/40" />
          )}
          <span className="text-xs font-medium text-caption-assistive">
            {article.brandName}
          </span>
        </div>
        <span className="text-xs font-medium text-caption-assistive">
          {article.date.slice(0, 10)}
        </span>
      </div>
    </Link>
  );
}
