'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../auth.module.scss';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isFilled = email.length > 0 && password.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '메일주소를 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 메일주소 형식이 아닙니다.';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: API 로그인 호출
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
              type="email"
              className={`${styles.input} ${styles.inputWithIcon} ${errors.email ? styles.inputError : ''}`}
              placeholder="아이디를 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
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

        <button
          type="submit"
          className={`${styles.submitButton} ${isFilled ? styles.submitButtonActive : ''}`}
        >
          로그인
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
