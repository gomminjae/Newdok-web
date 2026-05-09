'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { newsletterApi } from '@/shared/api/endpoints';
import { useAuth } from '@/shared/hooks';
import type { SubscribedNewsletter } from '@/shared/api/types';
import styles from './subscribe.module.scss';

export default function ExplorePage() {
  const { isLoggedIn } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const queryClient = useQueryClient();

  const { data: activeNewsletters = [], isLoading: isActiveLoading } = useQuery({
    queryKey: ['subscription', 'active'],
    queryFn: () => newsletterApi.fetchActiveNewsletters(),
    enabled: isLoggedIn && selectedTab === 0,
  });

  const { data: pausedNewsletters = [], isLoading: isPausedLoading } = useQuery({
    queryKey: ['subscription', 'paused'],
    queryFn: () => newsletterApi.fetchPausedNewsletters(),
    enabled: isLoggedIn && selectedTab === 1,
  });

  const currentList = selectedTab === 0 ? activeNewsletters : pausedNewsletters;
  const isLoading = selectedTab === 0 ? isActiveLoading : isPausedLoading;

  const handlePause = async (id: number) => {
    await newsletterApi.pauseSubscription({ newsletterId: id });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  };

  const handleResume = async (id: number) => {
    await newsletterApi.resumeSubscription({ newsletterId: id });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.segmentPicker}>
          <div className={styles.segmentWrapper}>
            <div className={`${styles.segmentSlider} ${styles.left}`} />
            <button className={`${styles.segmentButton} ${styles.active}`} type="button">구독 중</button>
            <button className={styles.segmentButton} type="button">구독 중지</button>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyImage} />
          <p className={styles.emptyTitle}>구독 중인 뉴스레터가 없어요.</p>
          <p className={styles.emptyDescription}>
            <Link href="/login" className={styles.guestLoginLink}>로그인</Link>
            {' 후 뉴스레터를 구독해 보세요.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.segmentPicker}>
        <div className={styles.segmentWrapper}>
          <div className={`${styles.segmentSlider} ${selectedTab === 0 ? styles.left : styles.right}`} />
          <button
            className={`${styles.segmentButton} ${selectedTab === 0 ? styles.active : ''}`}
            onClick={() => setSelectedTab(0)}
            type="button"
          >
            구독 중
          </button>
          <button
            className={`${styles.segmentButton} ${selectedTab === 1 ? styles.active : ''}`}
            onClick={() => setSelectedTab(1)}
            type="button"
          >
            구독 중지
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : currentList.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyImage} />
          <p className={styles.emptyTitle}>
            {selectedTab === 0 ? '구독 중인 뉴스레터가 없어요.' : '구독을 중지한 뉴스레터가 없어요.'}
          </p>
          <p className={styles.emptyDescription}>
            {selectedTab === 0
              ? '구독신청 후 첫 아티클을 수신받으면 내 구독에 추가돼요.'
              : '구독 중지 후에도 언제든 아티클을 다시 받아볼 수 있어요.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.listHeader}>
            <p className={styles.listTitle}>
              {selectedTab === 0
                ? `총 ${currentList.length}개의 뉴스레터를 구독중이에요.`
                : `${currentList.length}개의 뉴스레터를 구독 중지했어요.`}
            </p>
            <p className={styles.listSubtitle}>
              {selectedTab === 0
                ? '구독신청 후 첫 아티클을 수신받으면 내 구독에 추가돼요.'
                : '구독을 재개하면 다시 아티클을 받아볼 수 있어요.'}
            </p>
          </div>
          <div className={styles.subscriptionList}>
            {currentList.map((nl) => (
              <SubscribeRow
                key={nl.id}
                newsletter={nl}
                isSubscribed={selectedTab === 0}
                onAction={() =>
                  nl.id != null && (selectedTab === 0 ? handlePause(nl.id) : handleResume(nl.id))
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubscribeRow({
  newsletter,
  isSubscribed,
  onAction,
}: {
  newsletter: SubscribedNewsletter;
  isSubscribed: boolean;
  onAction: () => void;
}) {
  return (
    <div className={styles.subscribeRow}>
      <Link href={newsletter.id != null ? `/newsletters/${newsletter.id}` : '#'} className={styles.subscribeLeft}>
        {newsletter.imageUrl ? (
          <img src={newsletter.imageUrl} alt={newsletter.brandName} className={styles.subscribeImage} />
        ) : (
          <div className={styles.subscribeImagePlaceholder} />
        )}
        <div className={styles.subscribeInfo}>
          <span className={styles.subscribeBrand}>{newsletter.brandName}</span>
          <span className={styles.subscribeCycle}>
            <Image src="/images/Line Clock.svg" alt="" width={20} height={20} />
            {newsletter.publicationCycle}
          </span>
        </div>
      </Link>
      <button
        className={`${styles.actionButton} ${isSubscribed ? styles.pause : styles.resume}`}
        onClick={onAction}
        type="button"
      >
        {isSubscribed ? '구독중지' : '구독재개'}
      </button>
    </div>
  );
}
