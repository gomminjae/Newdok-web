'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/shared/api/endpoints';
import { useAuth } from '@/shared/hooks';
import styles from './mypage.module.scss';

export default function MyPage() {
  const { isLoggedIn, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getProfile(),
    enabled: isLoggedIn,
  });

  const nickname = profile?.nickname ?? '';
  const subscribeEmail = profile?.subscribeEmail ?? '';

  const handleCopyEmail = useCallback(() => {
    if (!subscribeEmail) return;
    navigator.clipboard.writeText(subscribeEmail);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2100);
  }, [subscribeEmail]);

  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.guestState}>
          <p className={styles.guestTitle}>{'회원이 되면 뉴스레터를\n간편하게 모아볼 수 있어요!'}</p>
          <Link href="/signup" className={styles.guestSignupButton}>회원가입</Link>
          <p className={styles.guestLogin}>
            이미 계정이 있나요?{' '}
            <Link href="/login" className={styles.guestLoginLink}>로그인</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileSection}>
        <p className={styles.nickname}>{nickname}</p>

        <div className={styles.emailLabel}>
          <span className={styles.emailLabelText}>구독이메일</span>
          <button className={styles.emailTooltip} type="button">
            <Image src="/images/Line Question mark.svg" alt="도움말" width={16} height={16} />
          </button>
        </div>

        <div className={styles.emailRow}>
          <button className={styles.emailCopy} onClick={handleCopyEmail} type="button">
            <Image src="/images/Line Copy.svg" alt="복사" width={24} height={24} />
          </button>
          <span className={styles.emailText}>{subscribeEmail}</span>
        </div>

        <button className={styles.editProfileButton} type="button">
          프로필 편집
        </button>
      </div>

      <div className={styles.menuSection}>
        <p className={styles.sectionHeader}>서비스</p>
        <button className={styles.menuItem} type="button">
          <span className={styles.menuLabel}>계정 관리</span>
          <Image src="/images/Line right.svg" alt="" width={24} height={24} className={styles.menuArrow} />
        </button>
        <button className={styles.menuItem} type="button">
          <span className={styles.menuLabel}>알림 설정</span>
          <Image src="/images/Line right.svg" alt="" width={24} height={24} className={styles.menuArrow} />
        </button>
      </div>

      <div className={styles.menuSection}>
        <p className={styles.sectionHeader}>고객센터</p>
        <button className={styles.menuItem} type="button">
          <span className={styles.menuLabel}>FAQ</span>
          <Image src="/images/Line right.svg" alt="" width={24} height={24} className={styles.menuArrow} />
        </button>
        <button className={styles.menuItem} type="button">
          <span className={styles.menuLabel}>서비스 피드백</span>
          <Image src="/images/Line right.svg" alt="" width={24} height={24} className={styles.menuArrow} />
        </button>
        <button className={styles.menuItem} type="button">
          <span className={styles.menuLabel}>약관 및 정책</span>
          <Image src="/images/Line right.svg" alt="" width={24} height={24} className={styles.menuArrow} />
        </button>
        <div className={styles.versionRow}>
          <span className={styles.versionLabel}>버전</span>
          <span className={styles.versionValue}>1.0.0</span>
        </div>
      </div>

      <button className={styles.logoutButton} type="button" onClick={logout}>
        로그아웃
      </button>

      {showToast && (
        <div className={styles.toast}>
          구독 이메일 주소가 복사되었습니다.
        </div>
      )}
    </div>
  );
}
