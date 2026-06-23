'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userApi } from '@/entities/user';
import { ApiError } from '@/shared/api/client';
import { LoginFormSchema } from '@/features/auth/login';
import { enterAsGuest } from '@/shared/hooks';
import { Button, Input } from '@/shared/ui';

type FieldErrors = {
  loginId?: string;
  password?: string;
  general?: string;
};

export function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = LoginFormSchema.safeParse({ loginId, password });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'loginId' || key === 'password') {
          fieldErrors[key] ??= issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await userApi.login(parsed.data);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/home');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isUnauthorized) {
          setErrors({ general: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        } else {
          setErrors({ general: err.serverMessage ?? '로그인에 실패했습니다.' });
        }
      } else {
        setErrors({ general: '네트워크 오류가 발생했습니다.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10">
      <div className="text-2xl md:text-[28px] font-extrabold text-caption-heavy mb-10 md:mb-12 text-center">
        <span className="text-primary">N</span> newdok
      </div>

      <form
        className="w-full max-w-sm flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          label="아이디"
          placeholder="아이디를 입력해주세요."
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          autoComplete="username"
          error={errors.loginId}
          leftIcon={<Image src="/images/Line User.svg" alt="" width={20} height={20} />}
        />

        <Input
          label="비밀번호"
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 입력해주세요."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={errors.password}
          leftIcon={<Image src="/images/Line Lock.svg" alt="" width={20} height={20} />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              className="p-2"
            >
              <Image
                src={showPassword ? '/images/Line Eye.svg' : '/images/_Line Close Eye.svg'}
                alt=""
                width={20}
                height={20}
              />
            </button>
          }
        />

        {errors.general && (
          <p className="text-sm text-error">{errors.general}</p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>

        <div className="flex items-center justify-center gap-3 text-sm text-caption-alternative">
          <Link href="/signup" className="hover:underline">회원가입</Link>
          <span className="text-line-disabled">|</span>
          <Link href="#" className="hover:underline">ID/PW 찾기</Link>
        </div>

        <button
          type="button"
          onClick={() => {
            enterAsGuest();
            router.push('/home');
          }}
          className="text-sm text-caption-alternative underline-offset-2 hover:underline mt-2"
        >
          비회원으로 이용하기
        </button>
      </form>
    </div>
  );
}
