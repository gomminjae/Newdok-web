import { queryOptions } from '@tanstack/react-query';
import { newsletterApi } from './newsletter.api';

type BrandListParams = {
  orderOpt?: string;
  industry?: string;
  day?: string;
};

export const newsletterKeys = {
  all: ['newsletter'] as const,
  brand: (id: number, isMember: boolean) =>
    [...newsletterKeys.all, 'brand', id, isMember] as const,
  list: (params: BrandListParams) =>
    [...newsletterKeys.all, 'list', params] as const,
  recommend: {
    intersection: () =>
      [...newsletterKeys.all, 'recommend', 'intersection'] as const,
    union: () => [...newsletterKeys.all, 'recommend', 'union'] as const,
  },
};

export const subscriptionKeys = {
  all: ['subscription'] as const,
  active: () => [...subscriptionKeys.all, 'active'] as const,
  paused: () => [...subscriptionKeys.all, 'paused'] as const,
};

export const newsletterQueries = {
  brand: (id: number, isMember: boolean) =>
    queryOptions({
      queryKey: newsletterKeys.brand(id, isMember),
      queryFn: () =>
        isMember
          ? newsletterApi.fetchNewsletterBrand(id)
          : newsletterApi.fetchGuestNewsletterBrand(id),
    }),

  list: (params: BrandListParams, isMember: boolean) =>
    queryOptions({
      queryKey: newsletterKeys.list(params),
      queryFn: () =>
        isMember
          ? newsletterApi.fetchAllNewsletterBrands(params)
          : newsletterApi.fetchGuestAllNewsletterBrands(params),
    }),

  recommendIntersection: () =>
    queryOptions({
      queryKey: newsletterKeys.recommend.intersection(),
      queryFn: () => newsletterApi.fetchRecommendIntersection(),
    }),

  recommendUnion: () =>
    queryOptions({
      queryKey: newsletterKeys.recommend.union(),
      queryFn: () => newsletterApi.fetchRecommendUnion(),
    }),
};

export const subscriptionQueries = {
  active: () =>
    queryOptions({
      queryKey: subscriptionKeys.active(),
      queryFn: () => newsletterApi.fetchActiveNewsletters(),
    }),

  paused: () =>
    queryOptions({
      queryKey: subscriptionKeys.paused(),
      queryFn: () => newsletterApi.fetchPausedNewsletters(),
    }),
};
