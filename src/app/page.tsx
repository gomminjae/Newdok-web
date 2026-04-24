import type { Metadata } from 'next';
import { Sidebar } from '@/widgets/sidebar';
import { Header } from '@/widgets/header';
import {
  HeroSection,
  PopularNewsletters,
  FeatureSections,
  DiscoverSection,
  TodayNewsletters,
  BottomCta,
  LandingFooter,
} from '@/widgets/landing';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Newdok - 뉴스레터 구독 플랫폼',
  description:
    '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요. 관심사에 맞는 뉴스레터를 추천받고 북마크하세요.',
  keywords: ['뉴스레터', '구독', '뉴스레터 추천', '뉴스레터 구독', 'Newdok', '뉴독'],
  openGraph: {
    title: 'Newdok - 뉴스레터 구독 플랫폼',
    description:
      '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Newdok',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newdok - 뉴스레터 구독 플랫폼',
    description:
      '매일 받아보는 뉴스레터를 한 곳에서 관리하고, 새로운 뉴스레터를 발견하세요.',
  },
};

export default function LandingPage() {
  return (
    <>
      <Header />
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.main}>
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
