import type { Metadata } from 'next';
import { DesignSystemPreview } from '@/design-system/DesignSystemPreview';

export const metadata: Metadata = {
  title: '디자인 시스템',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemPreview />;
}
