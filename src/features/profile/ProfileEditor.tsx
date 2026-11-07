'use client';

import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys, SocialSignupRequestSchema, type UserProfile } from '@/entities/user';
import { getErrorMessage } from '@/shared/api/client';
import { Button } from '@/shared/ui';
import { PreferenceForm } from './PreferenceForm';

export function ProfileEditor({ profile, onSaved }: { profile: UserProfile; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(profile.nickname);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function saveNickname(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const parsed = SocialSignupRequestSchema.shape.nickname.safeParse(nickname);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setSaving(true);
    setError('');
    try {
      await userApi.updateNickname({ nickname: parsed.data });
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      onSaved('닉네임이 저장되었습니다.');
    } catch (error) {
      setError(getErrorMessage(error, '닉네임을 저장하지 못했어요. 다시 시도해주세요.'));
    } finally { setSaving(false); }
  }
  return <div className="space-y-8">
    <form onSubmit={(event) => void saveNickname(event)} className="space-y-3">
      <label htmlFor="profile-nickname" className="block text-sm font-bold">닉네임</label>
      <input id="profile-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={1} maxLength={12} required disabled={saving} aria-describedby="nickname-help" className="min-h-12 w-full rounded-md border border-line-neutral px-3" />
      <p id="nickname-help" className="text-xs text-caption-neutral">한글, 영문, 숫자 1~12자</p>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <Button type="submit" variant="outline" fullWidth disabled={saving || nickname === profile.nickname}>{saving ? '저장 중…' : '닉네임 저장'}</Button>
    </form>
    <PreferenceForm profile={profile} onSaved={() => onSaved('추천 설정이 저장되었습니다.')} />
  </div>;
}
