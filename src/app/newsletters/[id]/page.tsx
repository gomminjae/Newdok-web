import type { Metadata } from 'next';
import { newsletterApi } from '@/shared/api';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const brand = await newsletterApi.fetchGuestNewsletterBrand(Number(id));

    return {
      title: `${brand.brandName} | Newdok`,
      description:
        brand.detailDescription ??
        `${brand.brandName} 뉴스레터 상세 정보와 아티클을 확인하세요.`,
      openGraph: {
        title: `${brand.brandName} | Newdok`,
        description:
          brand.detailDescription ??
          `${brand.brandName} 뉴스레터 상세 정보`,
        ...(brand.imageUrl ? { images: [brand.imageUrl] } : {}),
      },
    };
  } catch {
    return {
      title: '뉴스레터 | Newdok',
      description: '뉴스레터 상세 정보를 확인하세요.',
    };
  }
}

export default async function NewsletterDetailPage({ params }: Props) {
  const { id } = await params;

  return <div>뉴스레터 상세 - {id}</div>;
}
