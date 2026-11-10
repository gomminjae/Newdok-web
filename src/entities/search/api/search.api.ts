import { apiClient } from '@/shared/api/client';
import {
  PopularKeywordResponseSchema,
  SearchedNewsletterListSchema,
} from '../model/schema';

export const searchApi = {
  searchNewsletters: (brandName: string, signal?: AbortSignal) =>
    apiClient('/search/newsletter', {
      signal,
      params: { brandName },
      schema: SearchedNewsletterListSchema,
    }),

  fetchPopularKeywords: (signal?: AbortSignal) =>
    apiClient('/search/popular', { signal, schema: PopularKeywordResponseSchema }),
};
