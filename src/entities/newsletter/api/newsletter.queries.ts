import { queryOptions } from '@tanstack/react-query';
import { newsletterApi } from './newsletter.api';
import { getTomorrowPublicationDay } from '../model/publication';

// staleTime은 공통 QueryProvider의 기본값을 사용한다.
const publicQueryOptions = { refetchOnWindowFocus: false } as const;

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
      ...publicQueryOptions,
      queryKey: [...newsletterKeys.all, 'landing', 'popular'],
      queryFn: () => newsletterApi.fetchGuestAllNewsletterBrands({ orderOpt: '인기순' }),
      select: (brands) => brands.slice(0, 6),
    }),

  landingNewest: () =>
    queryOptions({
      ...publicQueryOptions,
      queryKey: [...newsletterKeys.all, 'landing', 'newest'],
      queryFn: () => newsletterApi.fetchGuestAllNewsletterBrands({ orderOpt: '최신순' }),
      select: (brands) => brands.slice(0, 4),
    }),

  landingTomorrow: (day = getTomorrowPublicationDay()) =>
    queryOptions({
      ...publicQueryOptions,
      queryKey: [...newsletterKeys.all, 'landing', 'tomorrow', day],
      queryFn: () => newsletterApi.fetchGuestAllNewsletterBrands({
        orderOpt: '인기순',
        day,
      }),
      select: (brands) => brands.slice(0, 3),
    }),

  brand: (id: number, isMember: boolean) =>
    queryOptions({
      ...(!isMember && publicQueryOptions),
      queryKey: newsletterKeys.brand(id, isMember),
      queryFn: () =>
        isMember
          ? newsletterApi.fetchNewsletterBrand(id)
          : newsletterApi.fetchGuestNewsletterBrand(id),
    }),

  list: (params: BrandListParams, isMember: boolean) =>
    queryOptions({
      ...(!isMember && publicQueryOptions),
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
