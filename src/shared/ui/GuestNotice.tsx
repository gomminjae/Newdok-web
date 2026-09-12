import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { ButtonLink } from './Button';

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
        'flex flex-col items-center bg-bg-system pt-5 pb-8 px-6 text-center',
        className,
      )}
    >
      <Image src="/images/app/nologin.png" alt="" width={280} height={280} className="mb-6 h-[280px] w-[280px] max-w-full object-contain" />
      <p className="text-base font-bold text-caption-heavy whitespace-pre-line mb-6">
        {title}
      </p>
      <ButtonLink
        href="/login"
        fullWidth
        className="mb-3 max-w-[480px]"
      >
        회원가입
      </ButtonLink>
      <p className="text-sm font-medium text-caption-body">
        이미 계정이 있나요?{' '}
        <Link
          href="/login"
          className="text-primary font-medium underline underline-offset-2"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
