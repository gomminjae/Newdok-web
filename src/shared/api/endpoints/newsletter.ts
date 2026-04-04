import { apiClient } from '../client';
import type {
  SubscriptionRequest,
  NewsletterBrand,
  BrandDetail,
  NewsletterDetail,
  SubscribedNewsletter,
  OptionList,
  SubscriptionCountResponse,
} from '../types';

export const newsletterApi = {
  fetchActiveNewsletters: () =>
    apiClient<SubscribedNewsletter[]>('/newsletters/subscription/active'),

  fetchPausedNewsletters: () =>
    apiClient<SubscribedNewsletter[]>('/newsletters/subscription/paused'),

  fetchRecommendIntersection: () =>
    apiClient<NewsletterDetail[]>('/newsletters/recommend/intersection'),

  fetchRecommendUnion: () =>
    apiClient<NewsletterDetail[]>('/newsletters/recommend/union'),

  search: (brandName: string) =>
    apiClient<NewsletterBrand[]>('/newsletters/search', {
      params: { brandName },
    }),

  fetchAllNewsletterBrands: (params: {
    orderOpt?: string;
    industry?: string;
    day?: string;
  }) =>
    apiClient<NewsletterBrand[]>('/newsletters', { params }),

  fetchNewsletterBrand: (id: number) =>
    apiClient<BrandDetail>(`/newsletters/${id}`),

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
    industry?: string;
    day?: string;
  }) =>
    apiClient<NewsletterBrand[]>('/newsletters/non-member', { params }),

  fetchGuestNewsletterBrand: (id: number) =>
    apiClient<BrandDetail>(`/newsletters/${id}/non-member`),

  fetchSubscriptionCount: () =>
    apiClient<SubscriptionCountResponse>('/newsletters/subscription/count'),

  fetchOptionList: () => apiClient<OptionList>('/options'),
};
