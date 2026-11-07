import { clsx } from 'clsx';

export function SubscriptionBadge({ status, size = 'default' }: {
  status: 'CONFIRMED' | 'PAUSED';
  size?: 'default' | 'compact';
}) {
  return <span className={clsx(
    'inline-flex shrink-0 items-center justify-center rounded-full border text-[11px] leading-4 font-medium whitespace-nowrap',
    size === 'compact' ? 'h-[26px] w-[50px]' : 'px-3 py-1.5',
    status === 'CONFIRMED' ? 'border-primary bg-primary-light text-white' : 'border-caption-disabled bg-bg text-gray-light',
  )}>{status === 'CONFIRMED' ? '구독중' : '구독중지'}</span>;
}
