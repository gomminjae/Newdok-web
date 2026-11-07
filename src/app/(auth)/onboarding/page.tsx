'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userQueries } from '@/entities/user';
import { PreferenceForm } from '@/features/profile/PreferenceForm';
import { useAuth } from '@/shared/hooks';
import { Button, ButtonLink, GuestNotice } from '@/shared/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const profile = useQuery({ ...userQueries.profile(), enabled: isLoggedIn });
  if (!isLoggedIn) return <GuestNotice />;
  return <main className="mx-auto w-full max-w-[520px] px-5 py-10">
    <h1 className="text-2xl font-bold">어떤 소식에 관심이 있나요?</h1>
    <p className="mt-3 mb-8 text-sm text-caption-neutral">산업과 관심사를 알려주시면 맞춤 뉴스레터를 추천해드려요. 마이페이지에서 언제든 바꿀 수 있어요.</p>
    {profile.isPending ? <p role="status">프로필을 불러오는 중이에요.</p> : profile.isError ? <div role="alert"><p>프로필을 불러오지 못했어요.</p><Button variant="ghost" onClick={() => void profile.refetch()}>다시 시도</Button></div> : <PreferenceForm profile={profile.data} onSaved={() => router.replace('/search?tab=recommend')} />}
    <ButtonLink href="/home" variant="ghost-neutral" fullWidth className="mt-4">다음에 할게요</ButtonLink>
  </main>;
}
