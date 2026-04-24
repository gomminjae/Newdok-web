import type { Metadata } from 'next';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import styles from './layout.module.scss';

// 로그인 영역: 검색 엔진 색인 제외
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
      <div className={styles.wrapper}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </>
  );
}
