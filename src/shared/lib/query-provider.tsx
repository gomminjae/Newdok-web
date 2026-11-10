'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { shouldRetryQuery } from './query-policy';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/shared/config/session';
import { clearLegacySession } from '@/shared/api/client';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: shouldRetryQuery,
          },
        },
      }),
  );

  useEffect(() => {
    clearLegacySession();
    const clearSessionQueries = () => queryClient.clear();
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_STORAGE_KEY || event.key === null) clearSessionQueries();
    };
    window.addEventListener('auth-change', clearSessionQueries);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth-change', clearSessionQueries);
      window.removeEventListener('storage', onStorage);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
