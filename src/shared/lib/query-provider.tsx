'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const clearSessionQueries = () => queryClient.clear();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'accessToken' || event.key === null) clearSessionQueries();
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
