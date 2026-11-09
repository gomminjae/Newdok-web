'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clearAccessToken, getAccessToken } from '@/shared/api/client';

function getIsLoggedIn() {
  if (typeof window === 'undefined') return false;
  const token = getAccessToken();
  return !!token && token.length > 0;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

function getServerSnapshot() {
  return false;
}

const subscribeToHydration = () => () => {};
const clientHydrated = () => true;

export function useAuth() {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(subscribe, getIsLoggedIn, getServerSnapshot);
  const isHydrated = useSyncExternalStore(subscribeToHydration, clientHydrated, getServerSnapshot);

  const logout = useCallback(() => {
    clearAccessToken();
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  }, [router]);

  return { isLoggedIn, isHydrated, logout };
}

/** 비회원 → 홈으로 진입 (로그인 없이 앱 이용) */
export function enterAsGuest() {
  clearAccessToken();
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
}
