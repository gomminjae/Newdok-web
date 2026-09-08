import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-sm font-bold text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold">페이지를 찾을 수 없어요.</h1>
      <p className="mt-3 text-sm text-caption-neutral">주소가 바뀌었거나 더 이상 공개되지 않는 콘텐츠예요.</p>
      <Link href="/search" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-primary px-6 font-bold text-white">뉴스레터 둘러보기</Link>
    </div>
  );
}
