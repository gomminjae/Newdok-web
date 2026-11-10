'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userQueries, type RecommendedBrand } from '@/entities/user';
import { PreferenceForm } from '@/features/profile/PreferenceForm';
import { SubscribeDialog } from '@/features/subscription/SubscribeDialog';
import { useSubscriptionFlow } from '@/features/subscription/useSubscriptionFlow';
import { NewsletterImage } from '@/widgets/landing/NewsletterImage';
import { useAuth } from '@/shared/hooks';
import { LoadingState, AppImage, Button, ButtonLink, Chip, GuestNotice, Icon, Toast } from '@/shared/ui';

export default function OnboardingPage() {
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState<'welcome' | 'recommend' | 'preferences' | 'recommendations'>('welcome');
  const [recommendations, setRecommendations] = useState<RecommendedBrand[]>([]);
  const profile = useQuery({ ...userQueries.profile(), enabled: isLoggedIn });
  const subscription = useSubscriptionFlow({ email: profile.data?.subscribeEmail, userId: profile.data?.id });
  if (!isLoggedIn) return <GuestNotice />;
  if (profile.isPending) return <LoadingState label="프로필을 불러오는 중이에요." />;
  if (profile.isError) return <div role="alert" className="py-24 text-center"><p>프로필을 불러오지 못했어요.</p><Button variant="ghost" onClick={() => void profile.refetch()}>다시 시도</Button></div>;

  return <main className={`mx-auto flex min-h-dvh w-full flex-col px-6 pb-5 ${step === 'recommendations' ? 'max-w-[1000px]' : 'max-w-[480px]'}`}>
    <header className="relative -mx-6 mb-6 flex h-11 shrink-0 items-center justify-center bg-bg px-3"><h2 className="text-base font-bold">{step === 'preferences' ? '프로필 설정' : step === 'recommendations' ? '추천 뉴스레터' : '회원가입 완료'}</h2>{step === 'recommend' && <ButtonLink href="/home" variant="ghost-neutral" size="compact" className="absolute right-3">나중에</ButtonLink>}</header>
    {step === 'welcome' ? <>
      <h1 className="text-xl font-bold leading-7">뉴스레터 구독을 위한<br />이메일이 생성되었어요.</h1>
      <AppImage name="signup" alt="" width={280} height={280} className="mx-auto my-6 h-[280px] w-[280px] max-w-full object-contain" />
      <p className="mb-4 text-center text-sm leading-6 text-caption-neutral">이제 뉴독으로 구독을 신청할 수 있어요.<br />지금 바로 내게 도움이 될 뉴스레터를 만나보세요.</p>
      <div className="mb-5 rounded-xl bg-bg-elevated p-5"><p className="mb-2 text-sm text-caption-neutral">구독 이메일</p><p className="select-all break-all text-base font-bold text-primary">{profile.data.subscribeEmail ?? '구독 이메일을 준비하고 있어요.'}</p></div>
      <div className="mt-auto pt-6"><Button fullWidth onClick={() => { setStep('recommend'); window.scrollTo({ top: 0 }); }}>다음</Button></div>
    </> : step === 'recommend' ? <>
      <h1 className="text-xl font-bold leading-7">뉴스레터 추천을 위해<br />‘{profile.data.nickname}’님에 대해<br />더 알려주세요.</h1>
      <p className="mt-2 text-sm font-medium leading-6 text-caption-neutral">종사 산업과 관심사를 선택하면<br />내게 도움이 될 뉴스레터를 만나볼 수 있어요!</p>
      <AppImage name="nologin" alt="" width={280} height={280} loading="eager" className="mx-auto mt-8 h-[280px] w-[280px] max-w-full object-contain" />
      <div className="mt-auto pt-6"><Button fullWidth onClick={() => { setStep('preferences'); window.scrollTo({ top: 0 }); }}>뉴스레터 추천받기</Button></div>
    </> : step === 'preferences' ? <PreferenceForm stepwise profile={profile.data} onSaved={(items) => { setRecommendations(items); setStep('recommendations'); window.scrollTo({ top: 0 }); }} /> : <>
      <h1 className="text-xl font-bold leading-7">{profile.data.nickname}님을 위한<br />맞춤형 뉴스레터가 도착했어요!</h1><p className="mt-3 mb-6 text-sm leading-6 text-caption-neutral">구독한 뉴스레터는 발행일에 맞춰 홈으로 배달해드려요.<br />구독하기를 누르면 발행처의 구독 페이지가 열려요.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recommendations.map((item) => <section key={item.id} className="overflow-hidden rounded-xl border border-line-neutral bg-bg"><div className="flex items-start gap-3 bg-bg-system p-4"><NewsletterImage name={item.brandName} imageUrl={item.imageUrl} variant="thumbnail" /><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold">{item.brandName}</h2><p className="mt-2 flex items-center gap-1 text-xs text-caption-alternative"><Icon name="Line Clock" size={16} />{item.publicationCycle || '발행 일정 확인'}</p></div>{profile.data.subscribeEmail && /^https?:\/\//i.test(item.subscribeUrl) ? <ButtonLink href={item.subscribeUrl} target="_blank" rel="noopener noreferrer" title="새 탭에서 구독 신청" variant="outline" size="xs" onClick={subscription.beginSubscription}>구독하기</ButtonLink> : <Button variant="outline" size="xs" disabled>구독하기</Button>}</div><div className="space-y-4 p-4"><p className="text-sm leading-6 text-caption-neutral">{item.firstDescription}</p><div className="flex flex-wrap gap-1">{item.interests.map((interest) => <Chip key={interest.id}>{interest.name}</Chip>)}</div></div></section>)}</div>
      {!recommendations.length && <p className="py-8 text-sm text-caption-neutral">추천할 뉴스레터를 준비하고 있어요. 둘러보기에서 더 많은 뉴스레터를 만나보세요.</p>}
      {subscription.copyError && <div role="alert" className="mt-4 text-sm leading-6 text-error"><p>{subscription.copyError}</p><p className="select-all break-all">{profile.data.subscribeEmail}</p><Button variant="ghost" size="compact" onClick={() => void subscription.copyEmail()}>이메일 다시 복사</Button></div>}
      <div className="sticky bottom-0 mt-6 bg-bg py-4"><ButtonLink href="/home" variant="outline" fullWidth>메인으로</ButtonLink></div>
    </>}
    {subscription.notice && <SubscribeDialog checking={subscription.notice === 'check'} onClose={() => subscription.setNotice(null)} onHideForToday={subscription.hideForToday} />}
    {subscription.message && <Toast message={subscription.message} />}
  </main>;
}
