import { ButtonLink } from '@/shared/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-sm font-bold text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold">페이지를 찾을 수 없어요.</h1>
      <p className="mt-3 text-sm text-caption-neutral">주소가 바뀌었거나 더 이상 공개되지 않는 콘텐츠예요.</p>
      <ButtonLink href="/explore" className="mt-7">뉴스레터 둘러보기</ButtonLink>
    </div>
  );
}
