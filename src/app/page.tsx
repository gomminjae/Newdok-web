import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_URL } from '@/shared/config/site';
import { getPublicNewsletters } from '@/entities/newsletter/api/public-newsletter.server';
import { getTomorrowPublicationDay } from '@/entities/newsletter/model/publication';
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

export default async function LandingPage() {
  const tomorrowDay = getTomorrowPublicationDay();
  const [popular, newest, tomorrow] = await Promise.all([
    getPublicNewsletters(),
    getPublicNewsletters('최신순'),
    getPublicNewsletters('인기순', tomorrowDay),
  ]);

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
        <div className="pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] md:ml-[var(--sidebar-width)] md:pb-0">
          <main id="main-content">
            <HeroSection />
            <PopularNewsletters initialNewsletters={popular.slice(0, 6)} />
            <FeatureSections />
            <DiscoverSection />
            <TodayNewsletters initialNewest={newest.slice(0, 4)} initialTomorrow={tomorrow.slice(0, 3)} initialTomorrowDay={tomorrowDay} />
            <BottomCta />
          </main>
          <LandingFooter />
        </div>
      </div>
    </>
  );
}
