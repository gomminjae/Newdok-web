'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SocialSignupRequestSchema,
  userApi,
  type SocialAgreementType,
} from '@/entities/user';
import { SOCIAL_SIGNUP_STORAGE_KEY } from '@/features/auth/social';
import { ApiError } from '@/shared/api/client';
import { Button, Input } from '@/shared/ui';

const TERMS_URL = 'https://newdok.notion.site/18aacf9713bc427a850ae8da92b69087?pvs=4';
const PRIVACY_URL = 'https://newdok.notion.site/82ef5aea46d84623b7b19bb951b6043c?pvs=4';

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
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-caption-heavy">소셜 로그인이 필요합니다</h1>
          <p className="mt-3 text-sm leading-6 text-caption-neutral">
            카카오 또는 Apple 인증을 먼저 완료해주세요.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary font-bold text-white"
          >
            로그인으로 돌아가기
          </Link>
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
      router.replace('/home');
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
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-bg">
      <header className="sticky top-0 z-10 bg-bg">
        <div className="relative flex h-12 items-center justify-center border-b border-line-disabled">
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
            className="absolute left-2 flex h-11 w-11 items-center justify-center text-2xl text-caption-strong"
          >
            ‹
          </button>
          <h1 className="text-base font-bold">회원가입</h1>
        </div>
        <div className="h-1 bg-tint-50">
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

          <div className="mt-10 flex flex-col gap-7">
            <div>
              <Input
                label="닉네임"
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

            <label className="flex flex-col gap-2 text-sm font-medium text-caption-strong">
              출생연도
              <select
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                className="h-12 rounded-lg border border-line-disabled bg-bg px-4 text-base outline-none focus:border-primary"
              >
                <option value="">선택</option>
                {birthYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-xs font-normal text-caption-neutral">
                출생연도는 뉴스레터 추천에 활용돼요.
              </span>
            </label>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-caption-strong">성별</legend>
              <div className="grid grid-cols-3 gap-2">
                {['남자', '여자', '그외'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGender(option)}
                    className={`h-12 rounded border text-base font-medium transition-colors ${
                      gender === option
                        ? 'border-primary text-primary'
                        : 'border-line-alternative text-caption-assistive'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-caption-neutral">
                성별은 뉴스레터 추천에 활용돼요.
              </p>
            </fieldset>
          </div>

          <div className="mt-auto pt-10">
            <Button
              type="button"
              fullWidth
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

          <div className="mt-8 flex flex-col">
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

            <div className="my-4 border-t border-line-disabled" />
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
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3">
      <span className={emphasized ? 'font-bold text-caption-heavy' : 'text-sm font-medium text-caption-strong'}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="underline underline-offset-2"
          >
            {label}
          </a>
        ) : label}
        {!emphasized && (
          <span className="text-caption-assistive"> {required ? '(필수)' : '(선택)'}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-primary"
      />
    </label>
  );
}
