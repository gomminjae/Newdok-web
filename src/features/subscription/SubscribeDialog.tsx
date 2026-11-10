'use client';

import { useAuth } from '@/shared/hooks';
import { Button, ButtonLink, Dialog } from '@/shared/ui';

export function SubscribeDialog({ checking = false, onClose, onHideForToday }: {
  checking?: boolean;
  onClose: () => void;
  onHideForToday: () => void;
}) {
  const { isLoggedIn } = useAuth();
  const title = !isLoggedIn ? '로그인 필요' : checking ? '구독 확인 필요' : '구독 상태 안내';

  return <Dialog title={title} variant="notice" onClose={onClose}>
    {!isLoggedIn ? <div className="space-y-4">
      <p className="text-base font-normal leading-6 text-caption-body">로그인하면 뉴스레터 수신 전용 이메일이 발급돼요. 이 주소로 신청한 아티클을 뉴독에서 받아보세요.</p>
      <ButtonLink href="/login" radius="xl" fullWidth>로그인하고 구독하기</ButtonLink>
    </div> : <>
      <p className="text-base font-normal leading-6 text-caption-body">{checking ? <>
        구독 신청을 완료하기 위해<br />구독확인 메일의 확인 버튼을 눌러주세요.
      </> : <>
        구독을 신청하셨다면 첫 아티클 수신 후<br />구독 상태가 자동으로 변경돼요.
      </>}</p>
      <p className="my-4 rounded-sm bg-bg-secondary px-4 py-2 text-sm font-normal leading-5 text-primary">{checking
        ? '구독 확인 메일은 홈에서 확인할 수 있어요.'
        : <>일부 뉴스레터는 구독 확인메일의 ‘확인’을<br />눌러야 구독 신청이 완료돼요.</>}</p>
      {checking ? <ButtonLink href="/home" radius="xl" fullWidth>메일 확인하기</ButtonLink> : <div className="flex gap-2">
        <Button variant="neutral-outline" radius="xl" className="flex-1" onClick={onHideForToday}>오늘 하루 보지 않기</Button>
        <Button radius="xl" className="flex-1" onClick={onClose}>확인</Button>
      </div>}
    </>}
  </Dialog>;
}
