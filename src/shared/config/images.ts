import { API_BASE_URLS } from './api';

/** Only the two app APIs' public artwork may enter the image optimizer. */
export const newsletterImagePatterns = Object.values(API_BASE_URLS).map((origin) => ({
  protocol: 'https' as const,
  hostname: new URL(origin).hostname,
  pathname: '/public/**',
}));
