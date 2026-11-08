import { newsletterImagePattern } from '@/shared/config/images';

export function proxyImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') {
      return `/api/backend${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return url;
  }
}


export function canOptimizeNewsletterImage(src: string): boolean {
  if (/\.(?:svg|gif)(?:\?|$)/i.test(src)) return false;
  if (src.startsWith('/api/backend/public/')) return true;
  try {
    const url = new URL(src);
    return url.protocol === `${newsletterImagePattern.protocol}:` && url.hostname === newsletterImagePattern.hostname && url.pathname.startsWith('/public/');
  } catch { return false; }
}
