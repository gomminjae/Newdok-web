import { parseOrigin } from './environment';

export function getSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  let value = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value && env.VERCEL_ENV === 'preview') {
    const host = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
    if (host) value = `https://${host}`;
  }
  if (!value && env.VERCEL_ENV === 'production') {
    throw new Error('Set NEXT_PUBLIC_SITE_URL for Vercel Production.');
  }
  const url = parseOrigin(value || 'http://localhost:3000', 'NEXT_PUBLIC_SITE_URL');
  if (env.VERCEL_ENV && url.protocol !== 'https:') {
    throw new Error('Vercel deployments require an HTTPS NEXT_PUBLIC_SITE_URL.');
  }
  return url.origin;
}

export const SITE_URL = getSiteUrl();

export const SITE_NAME = 'Newdok';
export const SITE_DESCRIPTION =
  '관심사에 맞는 뉴스레터를 발견하고, 매일 도착하는 뉴스레터를 한곳에서 관리하세요.';
