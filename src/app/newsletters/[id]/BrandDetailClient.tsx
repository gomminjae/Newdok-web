'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '@/shared/api/endpoints';
import type { BrandDetail, BrandArticle } from '@/shared/api/types';
import styles from './brandDetail.module.scss';

export function BrandDetailClient({ id }: { id: number }) {
  const router = useRouter();

  const { data: brand, isLoading } = useQuery({
    queryKey: ['newsletter', 'brand', id],
    queryFn: () => newsletterApi.fetchNewsletterBrand(id),
  });

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!brand) {
    return <div className={styles.loading}>뉴스레터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {/* 상단 네비게이션 */}
      <div className={styles.navbar}>
        <button className={styles.backButton} type="button" onClick={() => router.back()}>
          <Image src="/images/Line left.svg" alt="뒤로" width={24} height={24} />
        </button>
      </div>

      {/* 히어로 이미지 */}
      <div className={styles.heroSection}>
        {brand.imageUrl ? (
          <img src={brand.imageUrl} alt={brand.brandName} className={styles.heroImage} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <span className={styles.heroPlaceholderText}>{brand.brandName}</span>
          </div>
        )}
        <div className={styles.heroGradient} />

        {/* 관심사 태그 */}
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

      {/* 브랜드 정보 */}
      <div className={styles.brandInfo}>
        <h1 className={styles.brandName}>{brand.brandName}</h1>
        <div className={styles.publicationCycle}>
          <Image src="/images/Line Clock.svg" alt="" width={16} height={16} />
          <span>{brand.publicationCycle}</span>
        </div>
        {brand.subscribeUrl && (
          <a
            href={brand.subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.subscribeButton}
          >
            {brand.subscribeCheck ? '구독 중' : '구독하기'}
          </a>
        )}
      </div>

      {/* 설명 */}
      {brand.detailDescription && (
        <div className={styles.descriptionSection}>
          <p className={styles.descriptionText}>{brand.detailDescription}</p>
        </div>
      )}

      {/* 지난 아티클 */}
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
