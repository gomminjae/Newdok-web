import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: '로그인 | Newdok',
  description: 'Newdok에 로그인하여 구독 중인 뉴스레터를 확인하세요.',
};

export default function LoginPage() {
  return <LoginForm />;
}
