import { queryOptions } from '@tanstack/react-query';
import { newsletterApi } from './newsletter.api';
import { getTomorrowPublicationDay } from '../model/publication';

type BrandListParams = {
  orderOpt?: string;
  industry?: string | readonly string[];
  day?: string | readonly string[];
};

export const newsletterKeys = {
  all: ['newsletter'] as const,
  brand: (id: number, isMember: boolean) =>
    [...newsletterKeys.all, 'brand', id, isMember] as const,
  list: (params: BrandListParams, isMember: boolean) =>
    [...newsletterKeys.all, 'list', params, isMember] as const,
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
  search: (keyword: string) => queryOptions({
    queryKey: [...newsletterKeys.all, 'search', keyword],
    queryFn: ({ signal }) => newsletterApi.search(keyword, signal),
    enabled: !!keyword,
    staleTime: 60_000,
  }),

  popularSearchKeywords: () => queryOptions({
    queryKey: [...newsletterKeys.all, 'popular-search-keywords'],
    queryFn: newsletterApi.fetchPopularSearchKeywords,
    staleTime: 300_000,
  }),

  landingPopular: () =>
    queryOptions({
      queryKey: [...newsletterKeys.all, 'landing', 'popular'],
      queryFn: () => newsletterApi.fetchGuestAllNewsletterBrands({ orderOpt: '인기순' }),
      select: (brands) => brands.slice(0, 6),
    }),

  landingNewest: () =>
    queryOptions({
      queryKey: [...newsletterKeys.all, 'landing', 'newest'],
      queryFn: () => newsletterApi.fetchGuestAllNewsletterBrands({ orderOpt: '최신순' }),
      select: (brands) => brands.slice(0, 4),
    }),

  landingTomorrow: () =>
    queryOptions({
      queryKey: [...newsletterKeys.all, 'landing', 'tomorrow'],
      queryFn: () => newsletterApi.fetchGuestAllNewsletterBrands({
        orderOpt: '인기순',
        day: getTomorrowPublicationDay(),
      }),
      select: (brands) => brands.slice(0, 3),
      // 자정을 넘겨 페이지를 열어 둔 경우에도 다음 발행일을 갱신한다.
      refetchInterval: 60_000,
    }),

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
      queryKey: newsletterKeys.list(params, isMember),
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
