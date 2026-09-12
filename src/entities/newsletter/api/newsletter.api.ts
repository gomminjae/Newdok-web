import { apiClient } from '@/shared/api/client';
import {
  BrandDetailSchema,
  NewsletterBrandListSchema,
  NewsletterDetailListSchema,
  OptionListSchema,
  SubscribedNewsletterListSchema,
  SubscriptionCountResponseSchema,
  NewsletterSearchResultsSchema,
  PopularSearchKeywordsSchema,
  type SubscriptionRequest,
} from '../model/schema';

export const newsletterApi = {
  fetchActiveNewsletters: () =>
    apiClient('/newsletters/subscription/active', {
      schema: SubscribedNewsletterListSchema,
    }),

  fetchPausedNewsletters: () =>
    apiClient('/newsletters/subscription/paused', {
      schema: SubscribedNewsletterListSchema,
    }),

  fetchRecommendIntersection: () =>
    apiClient('/newsletters/recommend/intersection', {
      schema: NewsletterDetailListSchema,
    }),

  fetchRecommendUnion: () =>
    apiClient('/newsletters/recommend/union', {
      schema: NewsletterDetailListSchema,
    }),

  search: (brandName: string, signal?: AbortSignal) =>
    apiClient('/search/newsletter', {
      params: { brandName },
      authenticated: false,
      schema: NewsletterSearchResultsSchema,
      ...(signal && { signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]) }),
    }),

  fetchPopularSearchKeywords: () =>
    apiClient('/search/popular', { authenticated: false, schema: PopularSearchKeywordsSchema }),

  fetchAllNewsletterBrands: (params: {
    orderOpt?: string;
    industry?: string | readonly string[];
    day?: string | readonly string[];
  }) =>
    apiClient('/newsletters', {
      params,
      schema: NewsletterBrandListSchema,
    }),

  fetchNewsletterBrand: (id: number) =>
    apiClient(`/newsletters/${id}`, { schema: BrandDetailSchema }),

  pauseSubscription: (data: SubscriptionRequest) =>
    apiClient<void>('/newsletters/subscription/pause', {
      method: 'PATCH',
      body: data,
    }),

  resumeSubscription: (data: SubscriptionRequest) =>
    apiClient<void>('/newsletters/subscription/resume', {
      method: 'PATCH',
      body: data,
    }),

  fetchGuestAllNewsletterBrands: (params: {
    orderOpt?: string;
    industry?: string | readonly string[];
    day?: string | readonly string[];
  }) =>
    apiClient('/newsletters/non-member', {
      authenticated: false,
      params,
      schema: NewsletterBrandListSchema,
    }),

  fetchGuestNewsletterBrand: (id: number) =>
    apiClient(`/newsletters/${id}/non-member`, {
      authenticated: false,
      schema: BrandDetailSchema,
    }),

  fetchSubscriptionCount: () =>
    apiClient('/newsletters/subscription/count', {
      schema: SubscriptionCountResponseSchema,
    }),

  fetchOptionList: () =>
    apiClient('/options', { authenticated: false, schema: OptionListSchema }),
};
