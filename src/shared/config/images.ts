/** Newsletter artwork is public; authenticated API responses never enter the image optimizer. */
export const newsletterImagePattern = { protocol: 'https', hostname: 'api-dev.newdok.store', pathname: '/public/**' } as const;
