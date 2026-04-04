import { apiClient } from '../client';
import type { SearchedNewsletter, PopularKeywordResponse } from '../types';

export const searchApi = {
  searchNewsletters: (brandName: string) =>
    apiClient<SearchedNewsletter[]>('/search/newsletter', {
      params: { brandName },
    }),

  fetchPopularKeywords: () =>
    apiClient<PopularKeywordResponse>('/search/popular'),
};
