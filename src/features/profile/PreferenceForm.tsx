'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys, type UserProfile, type RecommendedBrand } from '@/entities/user';
import { newsletterApi, newsletterKeys } from '@/entities/newsletter';
import { getErrorMessage } from '@/shared/api/client';
import { Button, Chip, Icon, Select } from '@/shared/ui';

export function PreferenceForm({ profile, onSaved, stepwise = false }: { profile: UserProfile; onSaved: (recommendations: RecommendedBrand[]) => void; stepwise?: boolean }) {
  const queryClient = useQueryClient();
  const options = useQuery({ queryKey: [...newsletterKeys.all, 'options'], queryFn: newsletterApi.fetchOptionList });
  const [industry, setIndustry] = useState(profile.industryId?.toString() ?? '');
  const [interests, setInterests] = useState(() => (profile.interests ?? []).map((item) => item.interestId.toString()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'industry' | 'interests'>('industry');

  async function save(event: FormEvent) {
    event.preventDefault();
    if (stepwise && step === 'industry') { if (industry) { setStep('interests'); window.scrollTo({ top: 0 }); } return; }
    if (saving || !industry || interests.length < 3) return;
    setSaving(true);
    setError('');
    try {
      const response = await userApi.preInvestigate(industry, interests);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: newsletterKeys.all }),
      ]);
      onSaved(response.data);
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

  return <form onSubmit={(event) => void save(event)} className="flex flex-1 flex-col gap-6" aria-busy={saving}>
    {stepwise && <><div className="h-1 bg-tint-50"><div className="h-full bg-primary transition-[width]" style={{ width: step === 'industry' ? '30%' : '70%' }} /></div><div><h1 className="whitespace-pre-line text-xl font-bold leading-7">{step === 'industry' ? '종사 중인 산업을\n선택해주세요.' : '정확한 추천을 위해\n관심사를 3개 이상 선택해주세요.'}</h1><p className="mt-2 text-sm font-medium text-caption-neutral">{step === 'industry' ? '선택하신 산업과 관련된 뉴스레터를 찾아드려요.' : '취향에 맞는 뉴스레터를 추천해드려요.'}</p></div></>}
    {(!stepwise || step === 'industry') && <label className="block text-sm font-medium text-caption-neutral" htmlFor="profile-industry">종사산업
      <Select id="profile-industry" value={industry} disabled={saving} onChange={(event) => setIndustry(event.target.value)} required className="mt-2">
        <option value="">산업을 선택해주세요</option>
        {options.data.industries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </Select>
    </label>}
    {(!stepwise || step === 'interests') && <fieldset disabled={saving}>
      <legend className="mb-2 text-sm font-bold">관심사 <span className="font-normal text-caption-neutral">3개 이상 선택 ({interests.length}개)</span></legend>
      <div className="grid grid-cols-2 gap-3">
        {options.data.interests.map((item) => <Chip key={item.id} as="button" variant="option" active={interests.includes(String(item.id))} onClick={() => setInterests((previous) => previous.includes(String(item.id)) ? previous.filter((id) => id !== String(item.id)) : [...previous, String(item.id)])}>{item.name}</Chip>)}
      </div>
    </fieldset>}
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
    <div className="mt-auto pt-6">{stepwise && step === 'interests' && <Button variant="ghost-neutral" size="compact" disabled={saving} onClick={() => setStep('industry')} className="mb-3"><Icon name="Back" size={20} />산업 다시 선택</Button>}<Button type="submit" fullWidth disabled={saving || !industry || ((!stepwise || step === 'interests') && interests.length < 3)}>{saving ? '저장 중…' : stepwise && step === 'industry' ? '다음' : '뉴스레터 추천받기'}</Button></div>
  </form>;
}
