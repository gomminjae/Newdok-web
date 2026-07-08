'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi } from './newsletter.api';
import { subscriptionKeys } from './newsletter.queries';

export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: number) =>
      newsletterApi.pauseSubscription({ newsletterId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: number) =>
      newsletterApi.resumeSubscription({ newsletterId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
}
