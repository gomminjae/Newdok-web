'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '@/shared/api/endpoints';
import { useAuth } from '@/shared/hooks';
import type { BrandDetail, BrandArticle } from '@/shared/api/types';
import styles from './brandDetail.module.scss';

export function BrandDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const { data: brand, isLoading } = useQuery({
    queryKey: ['newsletter', 'brand', id, isLoggedIn],
    queryFn: () =>
      isLoggedIn
        ? newsletterApi.fetchNewsletterBrand(id)
        : newsletterApi.fetchGuestNewsletterBrand(id),
  });

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!brand) {
    return <div className={styles.loading}>뉴스레터를 찾을 수 없습니다.</div>;
  }

  const handleSubscribeClick = () => {
    if (!isLoggedIn) {
      setShowGuestAlert(true);
      return;
    }
    if (brand.subscribeUrl) {
      window.open(brand.subscribeUrl, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <button className={styles.backButton} type="button" onClick={() => router.back()}>
          <Image src="/images/Line left.svg" alt="뒤로" width={24} height={24} />
        </button>
      </div>

      <div className={styles.heroSection}>
        {brand.imageUrl ? (
          <img src={brand.imageUrl} alt={brand.brandName} className={styles.heroImage} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <span className={styles.heroPlaceholderText}>{brand.brandName}</span>
          </div>
        )}
        <div className={styles.heroGradient} />

        {brand.interests.length > 0 && (
          <div className={styles.heroTags}>
            {brand.interests.slice(0, 3).map((interest) => (
              <span key={interest.id} className={styles.heroTag}>
                {interest.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.brandInfo}>
        <h1 className={styles.brandName}>{brand.brandName}</h1>
        <div className={styles.publicationCycle}>
          <Image src="/images/Line Clock.svg" alt="" width={16} height={16} />
          <span>{brand.publicationCycle}</span>
        </div>
        <button
          type="button"
          className={styles.subscribeButton}
          onClick={handleSubscribeClick}
        >
          {brand.subscribeCheck ? '구독 중' : '구독하기'}
        </button>
      </div>

      {brand.detailDescription && (
        <div className={styles.descriptionSection}>
          <p className={styles.descriptionText}>{brand.detailDescription}</p>
        </div>
      )}

      {brand.brandArticleList.length > 0 && (
        <div className={styles.articlesSection}>
          <div className={styles.articlesSectionHeader}>
            <span className={styles.articlesSectionTitle}>지난 아티클 보기</span>
            <span className={styles.articlesSectionCount}>{brand.brandArticleList.length}개</span>
          </div>
          <div className={styles.articleList}>
            {brand.brandArticleList.map((article) => (
              <BrandArticleRow key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* 비회원 구독 알림 팝업 */}
      {showGuestAlert && (
        <div className={styles.alertOverlay} onClick={() => setShowGuestAlert(false)}>
          <div className={styles.alertBox} onClick={(e) => e.stopPropagation()}>
            <p className={styles.alertTitle}>구독 신청은 회원가입이 필요해요.</p>
            <p className={styles.alertDescription}>회원가입 후 간편하게 뉴스레터를 받아보세요!</p>
            <Link href="/signup" className={styles.alertButton}>회원가입</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandArticleRow({ article }: { article: BrandArticle }) {
  return (
    <Link href={`/articles/${article.id}`} className={styles.articleRow}>
      <div className={styles.articleRowInfo}>
        <p className={styles.articleRowTitle}>{article.title}</p>
        <span className={styles.articleRowDate}>{article.date}</span>
      </div>
      <Image src="/images/Line right.svg" alt="" width={20} height={20} className={styles.articleRowArrow} />
    </Link>
  );
}
