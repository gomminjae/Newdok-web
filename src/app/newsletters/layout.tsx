import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';

export default function NewslettersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main id="main-content" className="min-h-[calc(100dvh-var(--header-height))] min-w-0 px-4 pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] sm:px-6 xl:ml-[var(--sidebar-width)] xl:px-10 xl:pb-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </>
  );
}
