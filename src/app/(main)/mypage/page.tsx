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
import { Button, ButtonLink, Checkbox, Dialog, EmptyState, GuestNotice, Icon, Toast } from '@/shared/ui';
import { version } from '../../../../package.json';

type Panel = 'profile' | 'email' | 'notifications' | 'faq' | 'terms' | 'logout' | 'withdraw' | 'account' | 'version';
const TITLES: Record<Panel, string> = { profile: '프로필 편집', email: '구독 이메일 안내', notifications: '알림 설정', faq: 'FAQ', terms: '약관 및 정책', logout: '로그아웃', withdraw: '회원 탈퇴', account: '계정 관리', version: '버전' };
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
  return <div className="-mx-4 flex min-h-[calc(100dvh-var(--header-height)-var(--tabbar-height))] flex-col bg-bg md:-mx-6 md:min-h-[calc(100dvh-var(--header-height))] xl:-mx-10">
    <div className="px-5 pt-8 pb-6 md:px-7 xl:px-10">
      {profile.isPending ? <p role="status">프로필을 불러오는 중이에요.</p> : profile.isError ? <div role="alert"><EmptyState title="프로필을 불러오지 못했어요." cta={<Button onClick={() => void profile.refetch()}>다시 시도</Button>} /></div> : <>
        <div className="md:flex md:items-center md:justify-between md:gap-6"><div className="min-w-0"><p className="text-base font-bold text-caption-heavy">{profile.data.nickname}</p>
        <div className="mt-4 space-y-4 md:flex md:items-center md:gap-3 md:space-y-0"><div className="flex items-center gap-1"><span className="text-sm font-medium text-caption-neutral">구독이메일</span><Button variant="ghost-neutral" size="icon" aria-label="구독 이메일 도움말" onClick={() => setPanel('email')}><Icon name="Line Question mark" size={20} /></Button></div>
        <div className="flex min-h-6 items-center gap-1.5"><Button variant="ghost" size="icon" aria-label="구독 이메일 복사" disabled={!subscribeEmail} onClick={() => void copyEmail()}><Icon name="Line Copy" size={24} /></Button><p className="select-all break-all text-sm text-caption-heavy">{subscribeEmail || '구독 이메일을 준비하고 있어요.'}</p></div></div>
        {copyError && <p role="alert" className="mt-2 text-sm text-error">{copyError}</p>}
        </div><Button variant="neutral-outline" size="compact" className="mt-7 w-full md:mt-0 md:w-[144px]" onClick={() => setPanel('profile')}>프로필 편집</Button></div>
      </>}
    </div>
    <div className="mt-6 px-5 pb-2 md:px-7 xl:px-10"><p className="mb-2 text-sm text-caption-neutral">서비스</p><MenuItem label="계정 관리" onClick={() => setPanel('account')} /></div>
    <div className="mt-6 px-5 pb-6 md:px-7 xl:px-10">
      <p className="mb-2 text-sm text-caption-neutral">고객센터</p>
      <MenuItem label="FAQ" onClick={() => setPanel('faq')} />
      <ButtonLink href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" variant="menu" size="lg" fullWidth>서비스 피드백<Icon name="Line right" /></ButtonLink>
      <MenuItem label="약관 및 정책" onClick={() => setPanel('terms')} />
      <MenuItem label="버전" onClick={() => setPanel('version')} />
    </div>
    {panel === 'profile' && profile.data ? <ProfileEditor profile={profile.data} onClose={() => setPanel(null)} /> : panel === 'withdraw' ? <WithdrawDialog nickname={profile.data?.nickname ?? ''} onClose={() => setPanel('account')} onWithdrawn={logout} /> : panel && <Dialog title={TITLES[panel]} presentation={['account', 'faq', 'terms', 'notifications', 'version'].includes(panel) ? 'page' : 'dialog'} onClose={() => setPanel(null)}>
      {panel === 'account' && <div><MenuItem label="로그아웃" onClick={() => setPanel('logout')} /><MenuItem label="회원탈퇴" onClick={() => setPanel('withdraw')} /><MenuItem label="알림 설정" onClick={() => setPanel('notifications')} /></div>}
      {panel === 'version' && <p className="text-sm text-caption-neutral">Newdok 웹 {version}</p>}
      {panel === 'email' && <p className="text-sm leading-7">{EMAIL_HELP}</p>}
      {panel === 'notifications' && <div className="space-y-5"><p className="text-sm leading-7">웹 알림은 아직 지원하지 않아요. 새로 받은 아티클은 홈에서 확인해주세요.</p><ButtonLink href="/home" fullWidth>홈으로 가기</ButtonLink></div>}
      {panel === 'faq' && <div className="space-y-3">{FAQS.map(([question, answer]) => <details key={question} className="rounded-xl border border-line-neutral bg-bg p-5"><summary className="cursor-pointer text-sm font-medium">{question}</summary><p className="mt-3 text-sm leading-7 text-caption-neutral">{answer}</p></details>)}</div>}
      {panel === 'terms' && <div className="flex flex-col gap-3"><ButtonLink href={TERMS_URL} target="_blank" rel="noopener noreferrer" variant="menu" size="lg">서비스 이용약관 ↗</ButtonLink><ButtonLink href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" variant="menu" size="lg">개인정보 처리방침 ↗</ButtonLink></div>}
      {panel === 'logout' && <><p className="mb-6">로그아웃할까요?</p><div className="flex gap-2"><Button variant="neutral-outline" onClick={() => setPanel('account')} className="flex-1">취소</Button><Button onClick={logout} className="flex-1">로그아웃</Button></div></>}
    </Dialog>}
    {message && <Toast message={message} />}
  </div>;
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button variant="menu" size="lg" fullWidth onClick={onClick}>{label}<Icon name="Line right" /></Button>;
}

function WithdrawDialog({ nickname, onClose, onWithdrawn }: { nickname: string; onClose: () => void; onWithdrawn: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [stage, setStage] = useState<'confirm' | 'reason'>('confirm');
  const [reasons, setReasons] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const subscriptions = useQuery({ queryKey: ['subscription', 'count'], queryFn: newsletterApi.fetchSubscriptionCount });
  const articles = useQuery({ queryKey: ['article', 'received', 'count'], queryFn: articleApi.fetchReceivedArticleCount });
  async function withdraw() {
    if (!agreed || reasons.length === 0 || stage !== 'reason' || saving) return;
    setSaving(true);
    setError('');
    try { await userApi.withdraw(); onWithdrawn(); }
    catch (error) { setError(getErrorMessage(error, '탈퇴를 완료하지 못했어요. 다시 시도해주세요.')); setSaving(false); }
  }
  return <Dialog title="회원탈퇴" presentation="page" busy={saving} onClose={onClose} onBack={() => stage === 'reason' ? setStage('confirm') : onClose()}>
    <div className="flex min-h-[calc(100dvh-136px)] flex-col md:min-h-[440px]">
      {stage === 'confirm' ? <>
        <h3 className="text-lg font-bold leading-6">‘{nickname}’님<br />정말 떠나시나요?</h3><p className="mt-2 text-sm text-caption-neutral">뉴독을 탈퇴하면 활동 내용이 다 사라져요.</p>
        <dl className="my-12 space-y-5 text-base"><div className="flex justify-between"><dt>구독 중인 뉴스레터</dt><dd className="font-bold text-primary">{subscriptions.data ? `${subscriptions.data.count}개` : subscriptions.isError ? '조회 실패' : '조회 중…'}</dd></div><div className="flex justify-between"><dt>지금까지 수신받은 아티클</dt><dd className="font-bold text-primary">{articles.data ? `${articles.data.count}개` : articles.isError ? '조회 실패' : '조회 중…'}</dd></div></dl>
        <label className="mt-auto flex items-start gap-3 text-sm leading-6"><Checkbox checked={agreed} disabled={saving} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5" />탈퇴하시면 등록한 정보는 모두 삭제되어 복구할 수 없습니다.</label>
        <Button fullWidth className="mt-6" disabled={!agreed} onClick={() => setStage('reason')}>계속하기</Button>
      </> : <>
        <h3 className="text-lg font-bold leading-6">떠나시는 이유는<br />무엇인가요?</h3><p className="mt-2 text-sm text-caption-neutral">하나 이상의 항목을 선택하시면 탈퇴가 완료돼요.</p>
        <fieldset disabled={saving} className="mt-8 space-y-5"><legend className="sr-only">탈퇴 이유</legend>{['뉴스레터 관리 기능이 부족해서', '콘텐츠가 부족해서', '더이상 필요가 없어서', '기타'].map((reason) => <label key={reason} className="flex items-center gap-3 text-sm text-caption-neutral"><Checkbox checked={reasons.includes(reason)} onChange={() => setReasons((previous) => previous.includes(reason) ? previous.filter((item) => item !== reason) : [...previous, reason])} />{reason}</label>)}</fieldset>
        {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
        <div className="mt-auto pt-6"><Button fullWidth disabled={reasons.length === 0 || saving} onClick={() => void withdraw()}>{saving ? '탈퇴 처리 중…' : '탈퇴하기'}</Button></div>
      </>}
    </div>
  </Dialog>;
}
