import { queryOptions } from '@tanstack/react-query';
import { articleApi } from './article.api';

export const articleKeys = {
  all: ['article'] as const,
  day: (year: number, month: number, day: number) =>
    [...articleKeys.all, 'day', year, month, day] as const,
  monthly: (year: number, month: number) =>
    [...articleKeys.all, 'monthly', year, month] as const,
  detail: (id: number) => [...articleKeys.all, 'detail', id] as const,
};

export const bookmarkKeys = {
  all: ['bookmark'] as const,
  interests: () => [...bookmarkKeys.all, 'interests'] as const,
  list: (interestId: number | undefined, sortBy: string) =>
    [...bookmarkKeys.all, 'list', interestId ?? null, sortBy] as const,
};

export const articleQueries = {
  day: (year: number, month: number, day: number) =>
    queryOptions({
      queryKey: articleKeys.day(year, month, day),
      queryFn: () => articleApi.fetchDayArticle(year, month, day),
    }),

  monthly: (year: number, month: number) =>
    queryOptions({
      queryKey: articleKeys.monthly(year, month),
      queryFn: () => articleApi.fetchArticles(year, month),
      select: (res) => res.data,
    }),

  detail: (id: number, isMember = true) =>
    queryOptions({
      queryKey: [...articleKeys.detail(id), isMember],
      queryFn: () => articleApi.fetchArticleDetail(id, isMember),
    }),
};

export const bookmarkQueries = {
  interests: () =>
    queryOptions({
      queryKey: bookmarkKeys.interests(),
      queryFn: async () => (await articleApi.fetchBookmarkedInterest()).data,
    }),

  list: (interestId: number | undefined, sortBy: string) =>
    queryOptions({
      queryKey: bookmarkKeys.list(interestId, sortBy),
      queryFn: async () =>
        (await articleApi.fetchBookmarkArticles(interestId, sortBy)).data,
    }),
};
