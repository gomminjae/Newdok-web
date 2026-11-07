'use client';

import { useId, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  SocialSignupRequestSchema,
  userApi,
  type SocialAgreementType,
} from '@/entities/user';
import { SOCIAL_SIGNUP_STORAGE_KEY } from '@/features/auth/social';
import { ApiError } from '@/shared/api/client';
import { Button, ButtonLink, Input } from '@/shared/ui';

import { TERMS_URL, PRIVACY_URL } from '@/shared/config/links';

type SignupSession = {
  signupToken: string;
  suggestedNickname: string;
};

type AgreementState = Record<SocialAgreementType, boolean>;

const INITIAL_AGREEMENTS: AgreementState = {
  AGE_CONFIRMATION_OVER_14: false,
  TERMS_OF_SERVICE: false,
  PERSONAL_INFORMATION_COLLECTION_AND_USE: false,
  MARKETING_INFORMATION_RECEIPT: false,
};

export function SignupForm() {
  const storedSession = useSyncExternalStore(
    subscribeToSessionStorage,
    getSignupSessionSnapshot,
    getServerSignupSessionSnapshot,
  );
  const signupSession = useMemo(() => parseSignupSession(storedSession), [storedSession]);

  if (!signupSession) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-caption-heavy">소셜 로그인이 필요합니다</h1>
          <p className="mt-3 text-sm leading-6 text-caption-neutral">
            카카오 또는 Apple 인증을 먼저 완료해주세요.
          </p>
          <ButtonLink
            href="/login"
            fullWidth
            className="mt-8"
          >
            로그인으로 돌아가기
          </ButtonLink>
        </div>
      </main>
    );
  }

  return <SocialSignupFlow signupSession={signupSession} />;
}

function SocialSignupFlow({ signupSession }: { signupSession: SignupSession }) {
  const router = useRouter();
  const [step, setStep] = useState<'profile' | 'agreements'>('profile');
  const [nickname, setNickname] = useState(signupSession.suggestedNickname);
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [agreements, setAgreements] = useState<AgreementState>(INITIAL_AGREEMENTS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const birthYears = useMemo(() => {
    const latestYear = new Date().getFullYear() - 14;
    return Array.from(
      { length: latestYear - 1950 + 1 },
      (_, index) => String(latestYear - index),
    );
  }, []);

  const nicknameValidation = SocialSignupRequestSchema.shape.nickname.safeParse(nickname);
  const profileIsValid = nicknameValidation.success && birthYear !== '' && gender !== '';
  const requiredAgreementsAreChecked =
    agreements.AGE_CONFIRMATION_OVER_14 &&
    agreements.TERMS_OF_SERVICE &&
    agreements.PERSONAL_INFORMATION_COLLECTION_AND_USE;
  const allAgreementsAreChecked = Object.values(agreements).every(Boolean);

  function updateAgreement(type: SocialAgreementType, checked: boolean) {
    setAgreements((current) => ({ ...current, [type]: checked }));
  }

  async function submitSignup() {
    if (!requiredAgreementsAreChecked || isSubmitting) return;

    const request = SocialSignupRequestSchema.safeParse({
      signupToken: signupSession.signupToken,
      nickname,
      birthYear,
      gender,
      agreements: Object.entries(agreements).map(([type, agreed]) => ({
        type,
        agreed,
      })),
    });

    if (!request.success) {
      setErrorMessage(request.error.issues[0]?.message ?? '입력 내용을 확인해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await userApi.socialSignup(request.data);
      localStorage.setItem('user', JSON.stringify(response.user));
      sessionStorage.removeItem(SOCIAL_SIGNUP_STORAGE_KEY);
      window.dispatchEvent(new Event('auth-change'));
      router.replace('/onboarding');
    } catch (signupError) {
      setErrorMessage(
        signupError instanceof ApiError
          ? signupError.serverMessage ?? '회원가입에 실패했습니다.'
          : '회원가입 중 오류가 발생했습니다.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-bg">
      <header className="sticky top-0 z-10 bg-bg">
        <div className="relative flex h-11 items-center justify-center">
          <button
            type="button"
            onClick={() => {
              if (step === 'agreements') {
                setStep('profile');
                setErrorMessage(null);
              } else {
                router.back();
              }
            }}
            aria-label="뒤로 가기"
            className="absolute left-2 flex h-11 w-11 items-center justify-center text-caption-strong"
          >
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-bold">회원가입</h1>
        </div>
        <div className="h-1 bg-primary-bg">
          <div
            className="h-full bg-primary transition-[width] duration-200"
            style={{ width: step === 'profile' ? '50%' : '90%' }}
          />
        </div>
      </header>

      {step === 'profile' ? (
        <section className="flex flex-1 flex-col px-6 pb-5">
          <h2 className="pt-6 text-xl font-bold leading-8">
            프로필 설정을 위해<br />회원 정보를 입력해주세요.
          </h2>

          <div className="mt-[42px] flex flex-col gap-8">
            <div className="group">
              <label htmlFor="signup-nickname" className="mb-2 block pl-1 text-sm font-medium text-caption-neutral">닉네임</label>
              <Input
                id="signup-nickname"
                leftIcon={<ProfileIcon />}
                placeholder="12자 이내, 특수문자 사용 불가"
                value={nickname}
                maxLength={12}
                autoComplete="nickname"
                onChange={(event) => setNickname(event.target.value)}
                error={nickname && !nicknameValidation.success
                  ? nicknameValidation.error.issues[0]?.message
                  : undefined}
              />
              {nickname && nicknameValidation.success && (
                <p className="mt-2 text-xs font-medium text-primary">사용 가능한 닉네임입니다.</p>
              )}
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-caption-neutral">
              <span className="pl-1">출생연도</span>
              <span className="relative">
                <select
                  value={birthYear}
                  onChange={(event) => setBirthYear(event.target.value)}
                  className="h-12 w-full appearance-none rounded-sm border border-line-alternative bg-bg px-4 pr-12 text-sm font-medium text-caption-strong outline-none transition-colors focus:border-primary"
                >
                  <option value="">선택</option>
                  {birthYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <svg aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caption-alternative" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-xs font-medium text-caption-neutral">
                출생연도는 뉴스레터 추천에 활용돼요.
              </span>
            </label>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-caption-neutral">성별</legend>
              <div className="grid grid-cols-3 gap-2">
                {['남자', '여자', '그외'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={gender === option}
                    onClick={() => setGender(option)}
                    className={`h-12 rounded-sm border bg-bg text-base font-medium transition-colors ${
                      gender === option
                        ? 'border-primary text-primary'
                        : 'border-line-alternative text-caption-assistive'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs font-medium text-caption-neutral">
                성별은 뉴스레터 추천에 활용돼요.
              </p>
            </fieldset>
          </div>

          <div className="mt-auto pt-10">
            <Button
              type="button"
              fullWidth
              disabledTone="white"
              disabled={!profileIsValid}
              onClick={() => {
                setStep('agreements');
                setErrorMessage(null);
              }}
            >
              다음
            </Button>
          </div>
        </section>
      ) : (
        <section className="flex flex-1 flex-col px-6 pb-5">
          <h2 className="pt-6 text-xl font-bold leading-8">
            마지막으로<br />이용 약관에 동의해주세요.
          </h2>

          <div className="mt-8 flex flex-col gap-4">
            <AgreementRow
              label="만 14세 이상 확인"
              required
              checked={agreements.AGE_CONFIRMATION_OVER_14}
              onChange={(checked) => updateAgreement('AGE_CONFIRMATION_OVER_14', checked)}
            />
            <AgreementRow
              label="서비스 이용 동의"
              href={TERMS_URL}
              required
              checked={agreements.TERMS_OF_SERVICE}
              onChange={(checked) => updateAgreement('TERMS_OF_SERVICE', checked)}
            />
            <AgreementRow
              label="개인정보 수집 및 이용 동의"
              href={PRIVACY_URL}
              required
              checked={agreements.PERSONAL_INFORMATION_COLLECTION_AND_USE}
              onChange={(checked) => updateAgreement('PERSONAL_INFORMATION_COLLECTION_AND_USE', checked)}
            />
            <AgreementRow
              label="마케팅 활용/광고성 정보 수신"
              checked={agreements.MARKETING_INFORMATION_RECEIPT}
              onChange={(checked) => updateAgreement('MARKETING_INFORMATION_RECEIPT', checked)}
            />

            <div className="my-2 border-t border-caption-disabled" />
            <AgreementRow
              label="전체 약관 동의"
              emphasized
              checked={allAgreementsAreChecked}
              onChange={(checked) => {
                setAgreements({
                  AGE_CONFIRMATION_OVER_14: checked,
                  TERMS_OF_SERVICE: checked,
                  PERSONAL_INFORMATION_COLLECTION_AND_USE: checked,
                  MARKETING_INFORMATION_RECEIPT: checked,
                });
              }}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="mt-4 text-sm text-error">{errorMessage}</p>
          )}

          <div className="mt-auto pt-10">
            <Button
              type="button"
              fullWidth
              disabledTone="white"
              disabled={!requiredAgreementsAreChecked || isSubmitting}
              onClick={() => void submitSignup()}
            >
              {isSubmitting ? '가입 중...' : '가입완료'}
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

function subscribeToSessionStorage(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getSignupSessionSnapshot() {
  return sessionStorage.getItem(SOCIAL_SIGNUP_STORAGE_KEY);
}

function getServerSignupSessionSnapshot() {
  return null;
}

function parseSignupSession(storedSession: string | null): SignupSession | null {
  if (!storedSession) return null;

  try {
    const parsed = JSON.parse(storedSession) as Partial<SignupSession>;
    if (typeof parsed.signupToken !== 'string' || !parsed.signupToken) return null;

    return {
      signupToken: parsed.signupToken,
      suggestedNickname: typeof parsed.suggestedNickname === 'string'
        ? parsed.suggestedNickname
        : '',
    };
  } catch {
    return null;
  }
}

function AgreementRow({
  label,
  href,
  required,
  checked,
  emphasized,
  onChange,
}: {
  label: string;
  href?: string;
  required?: boolean;
  checked: boolean;
  emphasized?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const checkboxId = useId();
  const labelId = `${checkboxId}-label`;
  const textClassName = emphasized
    ? 'text-base font-medium text-caption-heavy'
    : 'text-sm font-medium text-caption-strong';
  const labelContent = (
    <>
      {label}
      {!emphasized && (
        <span className="text-caption-assistive"> {required ? '(필수)' : '(선택)'}</span>
      )}
    </>
  );

  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      {href ? (
        <span id={labelId} className={textClassName}>
          <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-2">
            {label.replace(/ 동의$/, '')}
          </a>
          {' 동의'}
          <span className="text-caption-assistive"> {required ? '(필수)' : '(선택)'}</span>
        </span>
      ) : (
        <label id={labelId} htmlFor={checkboxId} className={`flex min-h-11 cursor-pointer items-center ${textClassName}`}>
          {labelContent}
        </label>
      )}
      <label className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
        <input
          id={checkboxId}
          aria-labelledby={labelId}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 items-center justify-center rounded-sm border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
            checked
              ? emphasized
                ? 'border-primary bg-primary text-white'
                : 'border-caption-strong bg-bg text-primary'
              : 'border-line-alternative bg-bg text-transparent'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 12 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="text-caption-assistive transition-colors group-focus-within:text-caption-strong" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="10" cy="6" r="3" />
      <path d="M3.5 17v-1a6.5 6.5 0 0 1 13 0v1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
