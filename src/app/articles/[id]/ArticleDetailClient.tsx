'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { articleApi } from '@/shared/api/endpoints';
import { useAuth } from '@/shared/hooks';
import styles from './articleDetail.module.scss';

export function ArticleDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', 'detail', id],
    queryFn: () => articleApi.fetchArticleDetail(id),
  });

  const handleBookmarkToggle = async () => {
    if (!article || !isLoggedIn) return;
    await articleApi.changeBookmarkState({ articleId: id });
    queryClient.invalidateQueries({ queryKey: ['article', 'detail', id] });
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!article) {
    return <div className={styles.loading}>아티클을 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <button className={styles.navButton} type="button" onClick={() => router.back()}>
          <Image src="/images/Line left.svg" alt="뒤로" width={24} height={24} />
        </button>
        <Link href={`/newsletters/${article.brandId}`} className={styles.navBrand}>
          {article.brandImageUrl && (
            <img src={article.brandImageUrl} alt="" className={styles.navBrandImage} />
          )}
          <span className={styles.navBrandName}>{article.brandName}</span>
        </Link>
        {isLoggedIn ? (
          <button
            className={styles.navButton}
            type="button"
            onClick={handleBookmarkToggle}
          >
            <Image
              src={article.isBookmarked ? '/images/Fill Bookmark.svg' : '/images/Line Bookmark.svg'}
              alt="북마크"
              width={24}
              height={24}
            />
          </button>
        ) : (
          <div className={styles.navButton} />
        )}
      </div>

      <div className={styles.articleHeader}>
        <h1 className={styles.articleTitle}>{article.articleTitle}</h1>
        <span className={styles.articleDate}>{article.date}</span>
      </div>

      <div
        ref={contentRef}
        className={styles.articleContent}
        dangerouslySetInnerHTML={{ __html: article.articleHTML }}
      />

      {showScrollTop && (
        <button className={styles.scrollTopButton} type="button" onClick={scrollToTop}>
          <Image src="/images/Line Up.svg" alt="맨 위로" width={24} height={24} />
        </button>
      )}
    </div>
  );
}
