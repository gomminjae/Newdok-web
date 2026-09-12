import 'server-only';

import { cache } from 'react';
import { apiClient, ApiError } from '@/shared/api/client';
import { BrandDetailSchema, NewsletterBrandListSchema } from '../model/schema';

// 공개 조회의 짧은 요청 집중만 흡수한다. 이 값을 페이지 ISR에도 사용한다.
// 회원별 구독 정보에는 적용하지 않는다.
const next = { revalidate: 60 };

export const getPublicNewsletters = cache(async (orderOpt: '인기순' | '최신순' = '인기순', day?: string) =>
  apiClient('/newsletters/non-member', {
    authenticated: false,
    params: { orderOpt, ...(day ? { day } : {}) },
    schema: NewsletterBrandListSchema,
    next,
  }),
);

export const getPublicNewsletterBrand = cache(async (id: number) => {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(404);

  // 목록 캐시에 아직 없는 신규 뉴스레터도 열려야 하므로 상세 API가 존재 여부를 판단한다.
  return apiClient(`/newsletters/${id}/non-member`, {
    authenticated: false,
    schema: BrandDetailSchema,
    next,
  });
});
