'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi, userQueries } from '@/entities/user';
import { articleApi } from '@/entities/article';
import { newsletterApi } from '@/entities/newsletter';
import { ProfileEditor } from '@/features/profile/ProfileEditor';
import { getErrorMessage } from '@/shared/api/client';
import { TERMS_URL, PRIVACY_URL, FEEDBACK_URL } from '@/shared/config/links';
import { useAuth, useToast } from '@/shared/hooks';
import { Button, ButtonLink, Dialog, EmptyState, GuestNotice, Toast } from '@/shared/ui';
import { version } from '../../../../package.json';

type Panel = 'profile' | 'email' | 'notifications' | 'faq' | 'terms' | 'logout' | 'withdraw';
const TITLES: Record<Panel, string> = { profile: '프로필 편집', email: '구독 이메일 안내', notifications: '알림 설정', faq: 'FAQ', terms: '약관 및 정책', logout: '로그아웃', withdraw: '회원 탈퇴' };
const EMAIL_HELP = '회원가입 시 발급된 뉴스레터 수신 전용 주소예요. 발행처의 구독 신청란에 이 주소를 입력하면 뉴독 홈에서 아티클을 받아볼 수 있어요. 개인 메일 발신에는 사용할 수 없어요.';
const FAQS = [
  ['구독 이메일이 뭔가요?', EMAIL_HELP],
  ['뉴스레터는 어떻게 구독하나요?', '뉴스레터 상세 화면의 구독하기를 누르고 구독 이메일을 복사해주세요. 발행처 페이지에서 복사한 이메일을 입력해 신청을 완료해주세요.'],
  ['구독 확인은 어떻게 하나요?', '확인이 필요한 뉴스레터는 신청 후 확인 메일을 보내요. 홈에서 해당 메일을 열고 본문의 구독 확인 버튼을 눌러주세요.'],
  ['신청했는데 내 구독에 보이지 않아요.', '첫 아티클을 수신하면 내 구독에 추가돼요. 뉴스레터마다 발행 일정이 달라 다음 발행일까지 기다려야 할 수 있어요.'],
  ['추천 뉴스레터를 바꾸고 싶어요.', '프로필 편집에서 산업과 관심사를 바꾸면 추천에 반영돼요.'],
  ['아티클 수신을 멈추고 싶어요.', '내 구독에서 구독중지를 누르면 뉴독에서 수신을 중지하고, 구독재개로 다시 받을 수 있어요. 발행처에서의 구독 해지는 해당 뉴스레터의 안내를 따라주세요.'],
  ['문의는 어디에 남기나요?', '서비스 피드백으로 문의를 남겨주세요.'],
];

export default function MyPage() {
  const { isLoggedIn, logout } = useAuth();
  const { message, showToast } = useToast();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [copyError, setCopyError] = useState('');
  const profile = useQuery({ ...userQueries.profile(), enabled: isLoggedIn });
  const subscribeEmail = profile.data?.subscribeEmail ?? '';

  async function copyEmail() {
    setCopyError('');
    try { await navigator.clipboard.writeText(subscribeEmail); showToast('구독 이메일 주소가 복사되었습니다.'); }
    catch { setCopyError('복사하지 못했어요. 이메일 주소를 선택해 직접 복사해주세요.'); }
  }

  if (!isLoggedIn) return <GuestNotice />;
  return <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg pt-5 sm:-mx-6 sm:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
    <div className="flex flex-col gap-4 px-5">
      {profile.isPending ? <p role="status" className="pt-8">프로필을 불러오는 중이에요.</p> : profile.isError ? <div role="alert"><EmptyState title="프로필을 불러오지 못했어요." cta={<Button onClick={() => void profile.refetch()}>다시 시도</Button>} /></div> : <>
        <p className="line-clamp-2 pt-8 text-base font-bold text-caption-heavy">{profile.data.nickname}</p>
        <div className="flex items-center gap-2"><span className="text-sm text-caption-neutral">구독 이메일</span><Button variant="ghost-neutral" size="compact" aria-label="구독 이메일 도움말" onClick={() => setPanel('email')}>ⓘ</Button></div>
        <p className="select-all break-all text-sm text-caption-heavy">{subscribeEmail || '구독 이메일을 준비하고 있어요.'}</p>
        <Button variant="outline" size="compact" disabled={!subscribeEmail} onClick={() => void copyEmail()}>구독 이메일 복사</Button>
        {copyError && <p role="alert" className="text-sm text-error">{copyError}</p>}
        <Button variant="neutral-outline" size="compact" fullWidth onClick={() => setPanel('profile')}>프로필 편집</Button>
      </>}
    </div>
    <div className="mt-6 px-5"><p className="pb-2 text-xs text-caption-assistive">서비스</p><MenuItem label="알림 설정" onClick={() => setPanel('notifications')} /></div>
    <div className="mt-6 border-t border-line-neutral px-5">
      <p className="pt-6 pb-2 text-xs text-caption-assistive">고객센터</p>
      <MenuItem label="FAQ" onClick={() => setPanel('faq')} />
      <ButtonLink href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" variant="ghost-neutral" fullWidth className="justify-between">서비스 피드백 <span aria-hidden="true">↗</span></ButtonLink>
      <MenuItem label="약관 및 정책" onClick={() => setPanel('terms')} />
      <div className="flex h-12 items-center justify-between"><span>웹 버전</span><span className="text-sm text-caption-assistive">{version}</span></div>
    </div>
    <div className="mt-auto border-t border-line-neutral px-5 pb-4"><p className="pt-6 pb-2 text-xs text-caption-assistive">기타</p><MenuItem label="로그아웃" onClick={() => setPanel('logout')} /><MenuItem label="회원탈퇴" onClick={() => setPanel('withdraw')} /></div>
    {panel === 'withdraw' ? <WithdrawDialog onClose={() => setPanel(null)} onWithdrawn={logout} /> : panel && <Dialog title={TITLES[panel]} onClose={() => setPanel(null)}>
      {panel === 'profile' && profile.data && <ProfileEditor profile={profile.data} onSaved={(message) => { setPanel(null); showToast(message); }} />}
      {panel === 'email' && <p className="text-sm leading-7">{EMAIL_HELP}</p>}
      {panel === 'notifications' && <div className="space-y-5"><p className="text-sm leading-7">웹 알림은 아직 지원하지 않아요. 새로 받은 아티클은 홈에서 확인해주세요.</p><ButtonLink href="/home" fullWidth>홈으로 가기</ButtonLink></div>}
      {panel === 'faq' && <div className="space-y-4">{FAQS.map(([question, answer]) => <details key={question} className="border-b border-line-neutral pb-4"><summary className="cursor-pointer font-bold">{question}</summary><p className="mt-3 text-sm leading-7 text-caption-neutral">{answer}</p></details>)}</div>}
      {panel === 'terms' && <div className="flex flex-col gap-3"><ButtonLink href={TERMS_URL} target="_blank" rel="noopener noreferrer" variant="neutral-outline">이용약관 ↗</ButtonLink><ButtonLink href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" variant="neutral-outline">개인정보 처리방침 ↗</ButtonLink></div>}
      {panel === 'logout' && <><p className="mb-6">로그아웃할까요?</p><div className="flex gap-2"><Button variant="neutral-outline" onClick={() => setPanel(null)} className="flex-1">취소</Button><Button onClick={logout} className="flex-1">로그아웃</Button></div></>}
    </Dialog>}
    {message && <Toast message={message} />}
  </div>;
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button variant="ghost-neutral" fullWidth onClick={onClick} className="justify-between">{label}<span aria-hidden="true">›</span></Button>;
}

function WithdrawDialog({ onClose, onWithdrawn }: { onClose: () => void; onWithdrawn: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const subscriptions = useQuery({ queryKey: ['subscription', 'count'], queryFn: newsletterApi.fetchSubscriptionCount });
  const articles = useQuery({ queryKey: ['article', 'received', 'count'], queryFn: articleApi.fetchReceivedArticleCount });
  async function withdraw() {
    if (!agreed || saving) return;
    setSaving(true);
    setError('');
    try { await userApi.withdraw(); onWithdrawn(); }
    catch (error) { setError(getErrorMessage(error, '탈퇴를 완료하지 못했어요. 다시 시도해주세요.')); setSaving(false); }
  }
  return <Dialog title="회원 탈퇴" busy={saving} onClose={onClose}>
    <p className="text-sm leading-7">탈퇴하면 등록 정보와 활동 기록이 삭제되며 복구할 수 없어요.</p>
    <dl className="my-6 space-y-3 text-sm"><div className="flex justify-between"><dt>구독 중인 뉴스레터</dt><dd>{subscriptions.data ? `${subscriptions.data.count}개` : subscriptions.isError ? '조회 실패' : '조회 중…'}</dd></div><div className="flex justify-between"><dt>수신한 아티클</dt><dd>{articles.data ? `${articles.data.count}개` : articles.isError ? '조회 실패' : '조회 중…'}</dd></div></dl>
    <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={agreed} disabled={saving} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" />정보가 삭제되고 복구할 수 없다는 점을 확인했습니다.</label>
    {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
    <div className="mt-6 flex gap-2"><Button variant="neutral-outline" disabled={saving} onClick={onClose} className="flex-1">취소</Button><Button variant="danger" disabled={!agreed || saving} onClick={() => void withdraw()} className="flex-1">{saving ? '탈퇴 처리 중…' : '회원 탈퇴'}</Button></div>
  </Dialog>;
}
