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
    <>
      <Header />
      <div className="min-h-[calc(100dvh-var(--header-height))]">
        <Sidebar />
        <main id="main-content" className="min-w-0 px-4 pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] sm:px-6 xl:ml-[var(--sidebar-width)] xl:px-10 xl:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </>
  );
}
