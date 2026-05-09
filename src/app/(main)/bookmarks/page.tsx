'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { articleApi } from '@/shared/api/endpoints';
import { useAuth } from '@/shared/hooks';
import type { Bookmark, BookmarkInterest } from '@/shared/api/types';
import styles from './bookmarks.module.scss';

export default function BookmarksPage() {
  const { isLoggedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedInterestId, setSelectedInterestId] = useState<number | undefined>();
  const [sortOrder, setSortOrder] = useState('추가순');
  const queryClient = useQueryClient();

  const sortByMap: Record<string, string> = {
    '추가순': 'bookmarkDate',
    '최근 아티클 순': 'recent',
    '오래된 아티클 순': 'oldest',
  };

  const { data: interests = [] } = useQuery({
    queryKey: ['bookmark', 'interests'],
    queryFn: async () => {
      const res = await articleApi.fetchBookmarkedInterest();
      return res.data;
    },
    enabled: isLoggedIn,
  });

  const { data: bookmarkData, isLoading } = useQuery({
    queryKey: ['bookmarks', selectedInterestId, sortOrder],
    queryFn: async () => {
      const res = await articleApi.fetchBookmarkArticles(selectedInterestId, sortByMap[sortOrder]);
      return res.data;
    },
    enabled: isLoggedIn,
  });

  const categories: { id: number | undefined; name: string }[] = [
    { id: undefined, name: '전체' },
    ...interests.map((i) => ({ id: i.id, name: i.name })),
  ];

  const handleCategoryClick = (id: number | undefined, name: string) => {
    setSelectedCategory(name);
    setSelectedInterestId(id);
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.guestState}>
          <p className={styles.guestTitle}>저장한 아티클이 없어요.</p>
          <p className={styles.guestDescription}>로그인 후 다시 보고 싶은 아티클을 저장해보세요.</p>
          <Link href="/login" className={styles.guestLoginLink}>로그인</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.categoryFilter}>
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`${styles.categoryChip} ${selectedCategory === cat.name ? styles.active : ''}`}
            onClick={() => handleCategoryClick(cat.id, cat.name)}
            type="button"
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className={styles.sortInfo}>
        <span className={styles.totalCount}>총 {bookmarkData?.totalAmount ?? 0}개</span>
        <button className={styles.sortButton} type="button">
          {sortOrder}
          <Image src="/images/Line Down.svg" alt="" width={20} height={20} />
        </button>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>로딩 중...</div>
      ) : !bookmarkData || bookmarkData.totalAmount === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>아직 북마크한 아티클이 없어요.</p>
          <p className={styles.emptyDescription}>마음에 드는 아티클을 북마크해보세요.</p>
        </div>
      ) : (
        <div className={styles.bookmarkList}>
          {bookmarkData.bookmarkForMonth.map((section) => (
            <div key={section.month} className={styles.monthSection}>
              <p className={styles.monthTitle}>{section.month}</p>
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
    <Link href={`/articles/${article.articleId}`} className={styles.bookmarkCard}>
      <p className={styles.cardTitle}>{article.articleTitle}</p>
      <p className={styles.cardSample}>{article.sampleText}</p>
      <div className={styles.cardFooter}>
        <div className={styles.cardBrand}>
          {article.imageURL ? (
            <img src={article.imageURL} alt={article.brandName} className={styles.cardBrandImage} />
          ) : (
            <div className={styles.cardBrandImagePlaceholder} />
          )}
          <span className={styles.cardBrandName}>{article.brandName}</span>
        </div>
        <span className={styles.cardDate}>{article.date.slice(0, 10)}</span>
      </div>
    </Link>
  );
}
