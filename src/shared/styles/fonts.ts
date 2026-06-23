import localFont from 'next/font/local';

export const spoqa = localFont({
  src: [
    { path: '../../../public/fonts/SpoqaHanSansNeo-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../../public/fonts/SpoqaHanSansNeo-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/SpoqaHanSansNeo-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/SpoqaHanSansNeo-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-spoqa',
});
