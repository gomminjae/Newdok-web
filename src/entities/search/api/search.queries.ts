import { queryOptions } from '@tanstack/react-query';
import { searchApi } from './search.api';

export const searchKeys = {
  all: ['search'] as const,
  newsletters: (brandName: string) =>
    [...searchKeys.all, 'newsletters', brandName] as const,
  popular: () => [...searchKeys.all, 'popular'] as const,
};

export const searchQueries = {
  newsletters: (brandName: string) =>
    queryOptions({
      queryKey: searchKeys.newsletters(brandName),
      queryFn: () => searchApi.searchNewsletters(brandName),
      enabled: brandName.length > 0,
    }),

  popular: () =>
    queryOptions({
      queryKey: searchKeys.popular(),
      queryFn: () => searchApi.fetchPopularKeywords(),
    }),
};
