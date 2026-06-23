import { apiClient } from '@/shared/api/client';
import {
  PopularKeywordResponseSchema,
  SearchedNewsletterListSchema,
} from '../model/schema';

export const searchApi = {
  searchNewsletters: (brandName: string) =>
    apiClient('/search/newsletter', {
      params: { brandName },
      schema: SearchedNewsletterListSchema,
    }),

  fetchPopularKeywords: () =>
    apiClient('/search/popular', { schema: PopularKeywordResponseSchema }),
};
