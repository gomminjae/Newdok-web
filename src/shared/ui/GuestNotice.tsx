import Link from 'next/link';
import { clsx } from 'clsx';

type Props = {
  title?: string;
  className?: string;
};

export function GuestNotice({
  title = '회원이 되면 뉴스레터를\n간편하게 모아볼 수 있어요!',
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      <p className="text-base font-bold text-caption-heavy whitespace-pre-line mb-6">
        {title}
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-white font-bold mb-3 hover:bg-primary-strong transition-colors"
      >
        회원가입
      </Link>
      <p className="text-sm text-caption-alternative">
        이미 계정이 있나요?{' '}
        <Link
          href="/login"
          className="text-primary font-medium underline-offset-2 hover:underline"
        >
          로그인
        </Link>
      </p>
      <Link href="/search" className="mt-6 inline-flex min-h-11 items-center px-4 text-sm font-bold text-primary">로그인 없이 뉴스레터 둘러보기 →</Link>
    </div>
  );
}
