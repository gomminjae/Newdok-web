'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys, SocialSignupRequestSchema, type UserProfile } from '@/entities/user';
import { newsletterApi, newsletterKeys } from '@/entities/newsletter';
import { getErrorMessage } from '@/shared/api/client';
import { useToast } from '@/shared/hooks';
import { Button, Chip, Dialog, Icon, Input, Dropdown, Toast } from '@/shared/ui';

type Field = 'nickname' | 'industry' | 'interests';
const TITLES: Record<Field, string> = { nickname: '닉네임 변경', industry: '종사 산업 변경', interests: '관심사 변경' };

export function ProfileEditor({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [field, setField] = useState<Field | null>(null);
  const [busy, setBusy] = useState(false);
  const { message, showToast } = useToast();
  const queryClient = useQueryClient();
  const options = useQuery({ queryKey: [...newsletterKeys.all, 'options'], queryFn: newsletterApi.fetchOptionList });
  const industry = options.data?.industries.find((item) => item.id === profile.industryId)?.name;
  const interests = options.data?.interests.filter((item) => profile.interests?.some((selected) => selected.interestId === item.id)) ?? [];

  async function saved(message: string) {
    await Promise.all([queryClient.invalidateQueries({ queryKey: userKeys.all }), queryClient.invalidateQueries({ queryKey: newsletterKeys.all })]);
    setField(null);
    showToast(message);
  }
  return <Dialog title={field ? TITLES[field] : '프로필 편집'} presentation="page" busy={busy} onClose={onClose} onBack={() => field ? setField(null) : onClose()}>
    {options.isPending ? <p role="status">프로필 항목을 불러오는 중이에요.</p> : options.isError ? <div role="alert"><p>선택 항목을 불러오지 못했어요.</p><Button variant="ghost" onClick={() => void options.refetch()}>다시 시도</Button></div> : field ? <ProfileField key={field} field={field} profile={profile} options={options.data} onBusy={setBusy} onSaved={saved} /> : <div className="space-y-6">
      <h3 className="mb-10 text-lg font-bold leading-6">등록하신 정보에 맞춰<br />뉴스레터를 추천해드려요</h3>
      <ProfileValue label="닉네임" value={profile.nickname} onClick={() => setField('nickname')} />
      <ProfileValue label="종사산업" value={industry ?? '산업군을 선택해주세요.'} onClick={() => setField('industry')} />
      <section><h3 className="mb-2 text-sm font-medium text-caption-neutral">관심사</h3><div className="flex flex-wrap items-center gap-2">
        {interests.map((item) => <Chip key={item.id} size="md">{item.name}</Chip>)}
        <Button variant="outline" size="icon-chip" radius="full" onClick={() => setField('interests')} aria-label="관심사 변경"><Icon name="Line Plus" size={24} /></Button>
      </div></section>
    </div>}
    {message && <Toast message={message} />}
  </Dialog>;
}

function ProfileValue({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return <section><h3 className="mb-2 text-sm font-medium text-caption-neutral">{label}</h3><Button variant="field" fullWidth onClick={onClick}><span className="min-w-0 truncate">{value}</span><Icon name="Line Edit" size={24} /></Button></section>;
}

function ProfileField({ field, profile, options, onBusy, onSaved }: {
  field: Field;
  profile: UserProfile;
  options: Awaited<ReturnType<typeof newsletterApi.fetchOptionList>>;
  onBusy: (busy: boolean) => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [industry, setIndustry] = useState(profile.industryId?.toString() ?? '');
  const [interests, setInterests] = useState(() => (profile.interests ?? []).map((item) => item.interestId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const initialInterests = (profile.interests ?? []).map((item) => item.interestId).sort((a, b) => a - b).join(',');
  const changed = field === 'nickname' ? nickname !== profile.nickname : field === 'industry' ? !!industry && industry !== profile.industryId?.toString() : interests.length >= 3 && [...interests].sort((a, b) => a - b).join(',') !== initialInterests;
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || !changed) return;
    setError('');
    if (field === 'nickname') {
      const parsed = SocialSignupRequestSchema.shape.nickname.safeParse(nickname);
      if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    }
    setSaving(true); onBusy(true);
    try {
      if (field === 'nickname') await userApi.updateNickname({ nickname });
      else if (field === 'industry') await userApi.updateIndustry({ industryId: Number(industry) });
      else await userApi.updateInterest({ interestIds: interests });
      await onSaved(field === 'nickname' ? '닉네임이 변경되었습니다.' : field === 'industry' ? '종사산업이 변경되었습니다.' : '관심사가 변경되었습니다.');
    } catch (error) { setError(getErrorMessage(error, '변경 내용을 저장하지 못했어요. 다시 시도해주세요.')); }
    finally { setSaving(false); onBusy(false); }
  }
  return <form onSubmit={(event) => void save(event)} className="flex min-h-[calc(100dvh-136px)] flex-col md:min-h-0" aria-busy={saving}>
    {field === 'nickname' ? <div><Input id="profile-nickname" label="닉네임" value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={1} maxLength={12} disabled={saving} required error={error || undefined} /><p className="mt-2 text-xs text-caption-alternative">닉네임은 12자 이내로 입력해주세요.</p></div> : field === 'industry' ? <section><label className="text-sm font-medium text-caption-neutral" htmlFor="profile-industry">종사 산업</label><Dropdown id="profile-industry" value={industry} disabled={saving} onValueChange={setIndustry} required className="mt-2" placeholder="산업군을 선택해주세요." options={options.industries.map((item) => ({ value: String(item.id), label: item.name }))} /></section> : <fieldset disabled={saving}><legend className="text-base font-bold">관심사</legend><p className="mt-1 mb-5 text-sm text-caption-neutral">최소 3가지 이상을 선택해주세요. ({interests.length}개)</p><div className="grid grid-cols-2 gap-3">{options.interests.map((item) => <Chip key={item.id} as="button" variant="option" active={interests.includes(item.id)} onClick={() => setInterests((previous) => previous.includes(item.id) ? previous.filter((id) => id !== item.id) : [...previous, item.id])}>{item.name}</Chip>)}</div></fieldset>}
    {error && field !== 'nickname' && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
    <div className="mt-auto pt-6 md:mt-8 md:pt-0"><Button type="submit" fullWidth disabled={saving || !changed}>{saving ? '저장 중…' : '변경하기'}</Button></div>
  </form>;
}
