import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_URL } from '@/shared/config/site';
import { Sidebar } from '@/widgets/sidebar';
import {
  LandingHeader,
  HeroSection,
  PopularNewsletters,
  FeatureSections,
  DiscoverSection,
  TodayNewsletters,
  BottomCta,
  LandingFooter,
} from '@/widgets/landing';

export const metadata: Metadata = {
  title: 'Newdok - 지금 내게 필요한 뉴스레터를 찾는 방법',
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Newdok - 지금 내게 필요한 뉴스레터를 찾는 방법',
    description: SITE_DESCRIPTION,
    url: '/',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Newdok',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: '지금 내게 필요한 뉴스레터, 가장 빠르게 찾는 방법 - Newdok',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newdok - 지금 내게 필요한 뉴스레터를 찾는 방법',
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Newdok',
  alternateName: '뉴독',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: 'ko-KR',
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <LandingHeader />
      <div className="min-h-dvh bg-bg">
        <Sidebar />
        <div className="pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] xl:ml-[var(--sidebar-width)] xl:pb-0">
          <main>
            <HeroSection />
            <PopularNewsletters />
            <FeatureSections />
            <DiscoverSection />
            <TodayNewsletters />
            <BottomCta />
          </main>
          <LandingFooter />
        </div>
      </div>
    </>
  );
}
