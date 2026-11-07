import type { Metadata } from 'next';
import { articleApi } from '@/entities/article';
import { ArticleDetailClient } from './ArticleDetailClient';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ past?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await articleApi.fetchArticleDetail(Number(id), false);

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

export default async function ArticleDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();

  const { past } = await searchParams;
  return <ArticleDetailClient id={Number(id)} archive={past === '1'} />;
}
