'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userQueries } from '@/entities/user';
import { newsletterKeys, subscriptionKeys, type BrandDetail } from '@/entities/newsletter';
import { articleKeys } from '@/entities/article';
import { useAuth } from '@/shared/hooks';
import { Button, ButtonLink, Dialog } from '@/shared/ui';

export function SubscribeDialog({ brand, checking = false, onClose }: { brand: BrandDetail; checking?: boolean; onClose: () => void }) {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const profile = useQuery({ ...userQueries.profile(), enabled: isLoggedIn });
  const [stage, setStage] = useState<'apply' | 'check'>(checking ? 'check' : 'apply');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const email = profile.data?.subscribeEmail;
  const subscribeUrl = /^https?:\/\//i.test(brand.subscribeUrl) ? brand.subscribeUrl : null;

  useEffect(() => {
    if (!isLoggedIn) return;
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      void queryClient.invalidateQueries({ queryKey: articleKeys.all });
    };
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('focus', refresh); refresh(); };
  }, [isLoggedIn, queryClient]);

  async function copyEmail() {
    if (!email) return;
    setCopyError('');
    try { await navigator.clipboard.writeText(email); setCopied(true); }
    catch { setCopyError('복사하지 못했어요. 아래 주소를 선택해 직접 복사해주세요.'); }
  }

  return <Dialog title={`${brand.brandName} 구독${stage === 'check' ? ' 확인' : '하기'}`} onClose={onClose}>
    {!isLoggedIn ? <div className="space-y-5"><p className="text-sm leading-7">로그인하면 뉴스레터 수신 전용 이메일이 발급돼요. 이 주소로 신청한 아티클을 뉴독에서 받아보세요.</p><ButtonLink href="/login" fullWidth>로그인하고 구독하기</ButtonLink></div> : profile.isPending ? <p role="status">구독 이메일을 불러오는 중이에요.</p> : profile.isError ? <div role="alert"><p>구독 이메일을 불러오지 못했어요.</p><Button variant="ghost" onClick={() => void profile.refetch()}>다시 시도</Button></div> : <div className="space-y-5">
      {stage === 'apply' ? <>
        <p className="text-sm leading-7">아래 뉴독 구독 이메일을 복사하고 발행처의 신청란에 붙여넣어주세요.</p>
        <p className="select-all break-all rounded-md bg-bg-system p-4 text-sm font-bold">{email || '구독 이메일을 준비하고 있어요.'}</p>
        <Button variant="outline" fullWidth disabled={!email} onClick={() => void copyEmail()}>{copied ? '이메일 다시 복사' : '구독 이메일 복사'}</Button>
        {copied && <p role="status" className="text-sm text-primary">이메일을 복사했어요. 발행처 신청란에 붙여넣어주세요.</p>}
        {copyError && <p role="alert" className="text-sm text-error">{copyError}</p>}
        {brand.brandId === 321 && <p className="text-sm leading-7 text-caption-neutral">뉴닉은 발행처 회원가입이 필요할 수 있어요. 뉴독 구독 이메일로 가입하고 뉴스레터 수신을 신청해주세요.</p>}
        {subscribeUrl && email ? <ButtonLink href={subscribeUrl} target="_blank" rel="noopener noreferrer" fullWidth onClick={() => setStage('check')}>발행처에서 신청하기 ↗</ButtonLink> : <p className="text-sm text-caption-neutral">구독 신청을 준비하고 있어요. 잠시 후 다시 시도해주세요.</p>}
      </> : <>
        <p className="text-sm leading-7">{checking || brand.subscribeCheck ? '홈에서 구독 확인 메일을 열고 본문의 구독 확인 버튼을 눌러주세요.' : '발행처에서 신청을 완료해주세요. 확인 메일이 도착하면 홈에서 메일 본문의 구독 확인 버튼을 눌러주세요.'}</p>
        <p className="text-sm leading-7 text-caption-neutral">첫 아티클을 수신하면 내 구독에 추가돼요. 뉴스레터의 다음 발행일까지 시간이 걸릴 수 있어요.</p>
        <ButtonLink href="/home" fullWidth>홈에서 메일 확인하기</ButtonLink>
        <Button variant="neutral-outline" fullWidth onClick={() => setStage('apply')}>구독 신청 다시 하기</Button>
      </>}
    </div>}
  </Dialog>;
}
