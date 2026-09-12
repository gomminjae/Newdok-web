'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi } from './newsletter.api';
import { newsletterKeys, subscriptionKeys } from './newsletter.queries';
import type { BrandDetail } from '../model/schema';

export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: number) =>
      newsletterApi.pauseSubscription({ newsletterId }),
    onSuccess: (_, newsletterId) => {
      queryClient.setQueryData<BrandDetail>(newsletterKeys.brand(newsletterId, true), (brand) =>
        brand ? { ...brand, isSubscribed: 'PAUSED' } : undefined,
      );
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        queryClient.invalidateQueries({ queryKey: newsletterKeys.all }),
      ]);
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: number) =>
      newsletterApi.resumeSubscription({ newsletterId }),
    onSuccess: (_, newsletterId) => {
      queryClient.setQueryData<BrandDetail>(newsletterKeys.brand(newsletterId, true), (brand) =>
        brand ? { ...brand, isSubscribed: 'CONFIRMED' } : undefined,
      );
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        queryClient.invalidateQueries({ queryKey: newsletterKeys.all }),
      ]);
    },
  });
}
