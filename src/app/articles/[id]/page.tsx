import type { Metadata } from 'next';
import { articleApi } from '@/shared/api';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await articleApi.fetchArticleDetail(Number(id));

    return {
      title: `${article.articleTitle} | ${article.brandName} - Newdok`,
      description: `${article.brandName}의 아티클: ${article.articleTitle}`,
      openGraph: {
        title: `${article.articleTitle} | Newdok`,
        description: `${article.brandName}의 아티클`,
        ...(article.brandImageUrl ? { images: [article.brandImageUrl] } : {}),
      },
    };
  } catch {
    return {
      title: '아티클 | Newdok',
      description: '아티클 상세 내용을 확인하세요.',
    };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;

  return <div>아티클 상세 - {id}</div>;
}
