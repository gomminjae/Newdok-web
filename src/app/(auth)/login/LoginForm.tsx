'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userApi } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/client';
import styles from '../auth.module.scss';

export function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ loginId?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isFilled = loginId.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!loginId) {
      newErrors.loginId = '아이디를 입력해주세요.';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await userApi.login({ loginId, password });
      // 유저 정보 저장
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
    <div className={styles.page}>
      <div className={styles.logo}>
        <span>N</span> newdok
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div>
          <label className={styles.fieldLabel}>아이디</label>
          <div className={styles.inputWrap}>
            <Image
              src="/images/Line User.svg"
              alt=""
              width={20}
              height={20}
              className={styles.inputIcon}
            />
            <input
              type="text"
              className={`${styles.input} ${styles.inputWithIcon} ${errors.loginId ? styles.inputError : ''}`}
              placeholder="아이디를 입력해주세요."
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
            />
          </div>
          {errors.loginId && <p className={styles.errorMessage}>{errors.loginId}</p>}
        </div>

        <div>
          <label className={styles.fieldLabel}>비밀번호</label>
          <div className={styles.inputWrap}>
            <Image
              src="/images/Line Lock.svg"
              alt=""
              width={20}
              height={20}
              className={styles.inputIcon}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputWithIcon} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
              placeholder="비밀번호를 입력해주세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <Image
                src={showPassword ? '/images/Line Eye.svg' : '/images/_Line Close Eye.svg'}
                alt=""
                width={20}
                height={20}
                className={styles.eyeIcon}
              />
            </button>
          </div>
          {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
        </div>

        {errors.general && <p className={styles.errorMessage}>{errors.general}</p>}

        <button
          type="submit"
          className={`${styles.submitButton} ${isFilled ? styles.submitButtonActive : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>

        <div className={styles.links}>
          <Link href="/signup" className={styles.link}>
            회원가입
          </Link>
          <span className={styles.linkDivider}>|</span>
          <Link href="#" className={styles.link}>
            ID/PW 찾기
          </Link>
        </div>
      </form>
    </div>
  );
}
