import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/shared/lib/query-provider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/shared/config/site";
import { spoqa } from "@/shared/styles/fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 뉴스레터 구독 플랫폼`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "뉴스레터",
    "뉴스레터 추천",
    "뉴스레터 구독",
    "콘텐츠 큐레이션",
    "Newdok",
    "뉴독",
  ],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - 뉴스레터 구독 플랫폼`,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "지금 내게 필요한 뉴스레터, 가장 빠르게 찾는 방법 - Newdok",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 뉴스레터 구독 플랫폼`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={spoqa.variable}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
