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
  fetchActiveNewsletters: (signal?: AbortSignal) =>
    apiClient('/newsletters/subscription/active', {
      signal,
      schema: SubscribedNewsletterListSchema,
    }),

  fetchPausedNewsletters: (signal?: AbortSignal) =>
    apiClient('/newsletters/subscription/paused', {
      signal,
      schema: SubscribedNewsletterListSchema,
    }),

  fetchRecommendIntersection: (signal?: AbortSignal) =>
    apiClient('/newsletters/recommend/intersection', {
      signal,
      schema: NewsletterDetailListSchema,
    }),

  fetchRecommendUnion: (signal?: AbortSignal) =>
    apiClient('/newsletters/recommend/union', {
      signal,
      schema: NewsletterDetailListSchema,
    }),

  search: (brandName: string, signal?: AbortSignal) =>
    apiClient('/search/newsletter', {
      signal,
      params: { brandName },
      authenticated: false,
      schema: NewsletterSearchResultsSchema,
    }),

  fetchPopularSearchKeywords: (signal?: AbortSignal) =>
    apiClient('/search/popular', { signal, authenticated: false, schema: PopularSearchKeywordsSchema }),

  fetchAllNewsletterBrands: (params: {
    orderOpt?: string;
    industry?: string | readonly string[];
    day?: string | readonly string[];
  }, signal?: AbortSignal) =>
    apiClient('/newsletters', {
      signal,
      params,
      schema: NewsletterBrandListSchema,
    }),

  fetchNewsletterBrand: (id: number, signal?: AbortSignal) =>
    apiClient(`/newsletters/${id}`, { signal, schema: BrandDetailSchema }),

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
  }, signal?: AbortSignal) =>
    apiClient('/newsletters/non-member', {
      signal,
      authenticated: false,
      params,
      schema: NewsletterBrandListSchema,
    }),

  fetchGuestNewsletterBrand: (id: number, signal?: AbortSignal) =>
    apiClient(`/newsletters/${id}/non-member`, {
      signal,
      authenticated: false,
      schema: BrandDetailSchema,
    }),

  fetchSubscriptionCount: (signal?: AbortSignal) =>
    apiClient('/newsletters/subscription/count', {
      signal,
      schema: SubscriptionCountResponseSchema,
    }),

  fetchOptionList: (signal?: AbortSignal) =>
    apiClient('/options', { signal, authenticated: false, schema: OptionListSchema }),
};
