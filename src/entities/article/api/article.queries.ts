import { queryOptions } from '@tanstack/react-query';
import { articleApi } from './article.api';
import type { BookmarkSort } from '../model/schema';

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
  list: (interestId: number | undefined, sortBy: BookmarkSort) =>
    [...bookmarkKeys.all, 'list', interestId ?? null, sortBy] as const,
};

export const articleQueries = {
  day: (year: number, month: number, day: number) =>
    queryOptions({
      queryKey: articleKeys.day(year, month, day),
      queryFn: ({ signal }) => articleApi.fetchDayArticle(year, month, day, signal),
    }),

  monthly: (year: number, month: number) =>
    queryOptions({
      queryKey: articleKeys.monthly(year, month),
      queryFn: ({ signal }) => articleApi.fetchArticles(year, month, signal),
      select: (res) => res.data,
    }),

  detail: (id: number, isMember = true) =>
    queryOptions({
      queryKey: [...articleKeys.detail(id), isMember],
      queryFn: ({ signal }) => articleApi.fetchArticleDetail(id, isMember, signal),
    }),
};

export const bookmarkQueries = {
  interests: () =>
    queryOptions({
      queryKey: bookmarkKeys.interests(),
      queryFn: async ({ signal }) => (await articleApi.fetchBookmarkedInterest(signal)).data,
    }),

  list: (interestId: number | undefined, sortBy: BookmarkSort) =>
    queryOptions({
      queryKey: bookmarkKeys.list(interestId, sortBy),
      queryFn: async ({ signal }) =>
        (await articleApi.fetchBookmarkArticles(interestId, sortBy, signal)).data,
    }),
};
