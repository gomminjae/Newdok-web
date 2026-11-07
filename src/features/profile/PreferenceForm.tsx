'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys, type UserProfile } from '@/entities/user';
import { newsletterApi, newsletterKeys } from '@/entities/newsletter';
import { getErrorMessage } from '@/shared/api/client';
import { Button, Chip } from '@/shared/ui';

export function PreferenceForm({ profile, onSaved }: { profile: UserProfile; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const options = useQuery({ queryKey: [...newsletterKeys.all, 'options'], queryFn: newsletterApi.fetchOptionList });
  const [industry, setIndustry] = useState(profile.industryId?.toString() ?? '');
  const [interests, setInterests] = useState(() => (profile.interests ?? []).map((item) => item.interestId.toString()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || !industry || interests.length < 3) return;
    setSaving(true);
    setError('');
    try {
      await userApi.preInvestigate(industry, interests);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: newsletterKeys.all }),
      ]);
      onSaved();
    } catch (error) {
      // 서버가 설정을 저장한 뒤 추천을 만드는 단계에서 실패할 수도 있다.
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      void queryClient.invalidateQueries({ queryKey: newsletterKeys.all });
      setError(getErrorMessage(error, '추천 설정을 저장하지 못했어요. 다시 시도해주세요.'));
    } finally {
      setSaving(false);
    }
  }

  if (options.isPending) return <p role="status">선택 항목을 불러오는 중이에요.</p>;
  if (options.isError) return <div role="alert"><p>선택 항목을 불러오지 못했어요.</p><Button variant="ghost" size="compact" onClick={() => void options.refetch()}>다시 시도</Button></div>;

  return <form onSubmit={(event) => void save(event)} className="space-y-6" aria-busy={saving}>
    <label className="block text-sm font-bold" htmlFor="profile-industry">산업
      <select id="profile-industry" value={industry} disabled={saving} onChange={(event) => setIndustry(event.target.value)} required className="mt-2 block min-h-12 w-full rounded-md border border-line-neutral bg-bg px-3 font-normal">
        <option value="">산업을 선택해주세요</option>
        {options.data.industries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <fieldset disabled={saving}>
      <legend className="mb-2 text-sm font-bold">관심사 <span className="font-normal text-caption-neutral">3개 이상 선택 ({interests.length}개)</span></legend>
      <div className="flex flex-wrap gap-2">
        {options.data.interests.map((item) => <Chip key={item.id} as="button" active={interests.includes(String(item.id))} onClick={() => setInterests((previous) => previous.includes(String(item.id)) ? previous.filter((id) => id !== String(item.id)) : [...previous, String(item.id)])}>{item.name}</Chip>)}
      </div>
    </fieldset>
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
    <Button type="submit" fullWidth disabled={saving || !industry || interests.length < 3}>{saving ? '저장 중…' : '추천 설정 저장'}</Button>
  </form>;
}
