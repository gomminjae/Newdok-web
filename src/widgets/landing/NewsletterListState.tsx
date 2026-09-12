'use client';

import { Button } from '@/shared/ui';

export function NewsletterListState({ isPending, isError, isEmpty, retry,
  emptyMessage = '등록된 뉴스레터가 아직 없어요.',
}: {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  retry: () => unknown;
  emptyMessage?: string;
}) {
  if (isPending) {
    return (
      <div role="status" className="flex min-h-28 items-center justify-center rounded-xl bg-bg-system text-sm text-caption-neutral">
        뉴스레터를 불러오는 중이에요.
      </div>
    );
  }
  if (isError) {
    return (
      <div role="alert" className="rounded-xl bg-bg-system px-4 py-8 text-center text-sm text-caption-neutral">
        <p>뉴스레터를 불러오지 못했어요.</p>
        <Button variant="ghost" size="compact" onClick={() => void retry()} className="mt-3">
          다시 시도
        </Button>
      </div>
    );
  }
  if (isEmpty) return <p className="py-8 text-center text-sm text-caption-neutral">{emptyMessage}</p>;
  return null;
}
