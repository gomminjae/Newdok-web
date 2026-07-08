'use client';

import { proxyImage } from '@/shared/lib';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsletterQueries, type BrandArticle } from '@/entities/newsletter';
import { useAuth } from '@/shared/hooks';

export function BrandDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const { data: brand, isLoading } = useQuery(
    newsletterQueries.brand(id, isLoggedIn),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-primary text-base">
        로딩 중...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex items-center justify-center min-h-screen text-caption-neutral text-base">
        뉴스레터를 찾을 수 없습니다.
      </div>
    );
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
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center h-14 px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full"
        >
          <img src="/images/Line left.svg" alt="뒤로" width={24} height={24} />
        </button>
      </div>

      <div className="relative w-full h-[260px] overflow-hidden">
        {brand.imageUrl ? (
          <img
            src={proxyImage(brand.imageUrl)}
            alt={brand.brandName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-tint-50 to-tint-200">
            <span className="text-[32px] font-bold text-primary opacity-50">
              {brand.brandName}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-b from-transparent to-black/40" />

        {brand.interests.length > 0 && (
          <div className="absolute top-[68px] left-4 flex gap-1.5">
            {brand.interests.slice(0, 3).map((interest) => (
              <span
                key={interest.id}
                className="px-2.5 py-1 bg-white/85 backdrop-blur-sm rounded-xl text-xs font-semibold text-caption-strong"
              >
                {interest.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-2 px-6 py-5 border-b border-neutral-150">
        <h1 className="text-[22px] font-bold text-caption-heavy">{brand.brandName}</h1>
        <div className="flex items-center gap-1 text-sm font-medium text-caption-assistive">
          <img src="/images/Line Clock.svg" alt="" width={16} height={16} />
          <span>{brand.publicationCycle}</span>
        </div>
        <button
          type="button"
          onClick={handleSubscribeClick}
          className="mt-1 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-strong transition-colors"
        >
          {brand.subscribeCheck ? '구독 중' : '구독하기'}
        </button>
      </div>

      {brand.detailDescription && (
        <div className="px-6 py-5 border-b-8 border-bg-system">
          <p className="text-sm font-medium text-caption-neutral leading-relaxed whitespace-pre-line">
            {brand.detailDescription}
          </p>
        </div>
      )}

      {brand.brandArticleList.length > 0 && (
        <div className="flex-1 bg-bg-system">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <span className="text-base font-bold text-caption-heavy">
              지난 아티클 보기
            </span>
            <span className="text-sm font-medium text-caption-assistive">
              {brand.brandArticleList.length}개
            </span>
          </div>
          <div className="flex flex-col gap-2 px-5 pb-20">
            {brand.brandArticleList.map((article) => (
              <BrandArticleRow key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {showGuestAlert && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-5"
          onClick={() => setShowGuestAlert(false)}
        >
          <div
            className="bg-bg rounded-2xl px-6 pt-8 pb-6 max-w-[320px] w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-caption-heavy mb-2">
              구독 신청은 회원가입이 필요해요.
            </p>
            <p className="text-sm font-medium text-caption-neutral mb-6">
              회원가입 후 간편하게 뉴스레터를 받아보세요!
            </p>
            <Link
              href="/signup"
              className="block w-full h-12 leading-[48px] bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-strong transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandArticleRow({ article }: { article: BrandArticle }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="flex items-center gap-3 px-5 py-4 bg-bg rounded-[10px] border border-neutral-150 transition-colors hover:bg-neutral-50"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-caption-heavy mb-1 line-clamp-2">
          {article.title}
        </p>
        <span className="text-[13px] font-medium text-caption-assistive">
          {article.date}
        </span>
      </div>
      <img
        src="/images/Line right.svg"
        alt=""
        width={20}
        height={20}
        className="flex-shrink-0 opacity-40"
      />
    </Link>
  );
}
