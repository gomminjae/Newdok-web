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
      <div className="min-h-screen">
        <Sidebar />
        <main className="p-4 pb-[calc(72px+env(safe-area-inset-bottom))] xl:ml-[120px] xl:pb-4">
          {children}
        </main>
      </div>
    </>
  );
}
