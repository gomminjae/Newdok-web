import { ApiError } from '@/shared/api/client';

/** A rejected session or invalid request should not keep the user in a retrying spinner. */
export function shouldRetryQuery(failures: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status)) return false;
  return failures < 1;
}
