import localFont from 'next/font/local';

export const spoqa = localFont({
  src: [
    { path: '../../../public/fonts/SpoqaHanSansNeo-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/SpoqaHanSansNeo-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/SpoqaHanSansNeo-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  // Let CSS request the weights a screen actually uses instead of eagerly fetching all three.
  preload: false,
  variable: '--font-spoqa',
});
