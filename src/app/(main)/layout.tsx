import type { Metadata } from 'next';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="contents has-[.home-page]:[--header-height:66px] sm:has-[.home-page]:[--header-height:56px]">
      <Header />
      <div className="min-h-[calc(100dvh-var(--header-height))]">
        <Sidebar />
        <main id="main-content" className="min-w-0 px-4 pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] has-[.home-page]:bg-bg-system sm:px-6 sm:ml-[var(--sidebar-width)] xl:px-10 sm:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
