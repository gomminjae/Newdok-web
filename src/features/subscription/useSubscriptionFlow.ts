'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { newsletterKeys, subscriptionKeys } from '@/entities/newsletter';
import { articleKeys } from '@/entities/article';
import { AUTH_STORAGE_PREFIX } from '@/shared/config/session';
import { useToast } from '@/shared/hooks';

type Notice = 'guest' | 'state' | 'check';
const today = () => new Date().toLocaleDateString('en-CA');

export function useSubscriptionFlow({ email, userId }: { email?: string | null; userId?: number }) {
  const queryClient = useQueryClient();
  const { message, showToast } = useToast();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [copyError, setCopyError] = useState('');
  const awaitingReturn = useRef(false);
  const preferenceKey = `${AUTH_STORAGE_PREFIX}.subscriptionNotice.${userId ?? 'guest'}`;

  useEffect(() => {
    const onReturn = () => {
      if (!awaitingReturn.current || document.visibilityState === 'hidden') return;
      awaitingReturn.current = false;
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      void queryClient.invalidateQueries({ queryKey: articleKeys.all });
      let hidden = false;
      try { hidden = localStorage.getItem(preferenceKey) === today(); } catch { /* Storage may be unavailable. */ }
      if (!hidden) setNotice('state');
    };
    window.addEventListener('focus', onReturn);
    document.addEventListener('visibilitychange', onReturn);
    return () => {
      window.removeEventListener('focus', onReturn);
      document.removeEventListener('visibilitychange', onReturn);
    };
  }, [preferenceKey, queryClient]);

  async function copyEmail() {
    if (!email) return;
    setCopyError('');
    try {
      await navigator.clipboard.writeText(email);
      showToast('구독 이메일을 복사했어요.');
    } catch {
      setCopyError('이메일을 복사하지 못했어요. 아래 주소를 선택해 직접 복사해주세요.');
    }
  }

  function beginSubscription(event: MouseEvent<HTMLAnchorElement>) {
    if (!email) {
      event.preventDefault();
      setCopyError('구독 이메일을 준비하고 있어요. 잠시 후 다시 시도해주세요.');
      return;
    }
    awaitingReturn.current = true;
    void copyEmail();
  }

  function hideForToday() {
    try { localStorage.setItem(preferenceKey, today()); } catch { /* Closing still works without storage. */ }
    setNotice(null);
  }

  return { notice, setNotice, beginSubscription, hideForToday, copyEmail, copyError, message };
}
