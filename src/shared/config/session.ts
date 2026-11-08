// Derived from APP_ENV by next.config.ts; no second Vercel variable is needed.
export const AUTH_STORAGE_PREFIX = `newdok.${process.env.NEXT_PUBLIC_APP_ENV ?? 'development'}`;
export const ACCESS_TOKEN_STORAGE_KEY = `${AUTH_STORAGE_PREFIX}.accessToken`;
