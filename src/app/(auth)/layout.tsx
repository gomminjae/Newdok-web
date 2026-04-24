import type { Metadata } from 'next';

// 인증 페이지: 검색 엔진 색인 제외
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* TODO: 인증 페이지 공통 레이아웃 */}
      {children}
    </>
  );
}
