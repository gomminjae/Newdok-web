import { apiClient } from '@/shared/api/client';
import {
  ArticleListSchema,
  ArticleDetailSchema,
  ArticlesCountResponseSchema,
  BookmarkArticlesResponseSchema,
  BookmarkInterestListResponseSchema,
  MonthlyArticlesResponseSchema,
  type BookmarkRequest,
  type BookmarkSort,
} from '../model/schema';

export const articleApi = {
  fetchArticles: (year: number, publicationMonth: number, signal?: AbortSignal) =>
    apiClient('/articles', {
      signal,
      params: { year, publicationMonth },
      schema: MonthlyArticlesResponseSchema,
    }),

  fetchTodayArticle: (signal?: AbortSignal) =>
    apiClient('/articles/today', { signal, schema: ArticleListSchema }),

  fetchDayArticle: (year: number, publicationMonth: number, publicationDate: number, signal?: AbortSignal) =>
    apiClient('/articles/day', {
      signal,
      params: { year, publicationMonth, publicationDate },
      schema: ArticleListSchema,
    }),

  fetchBookmarkArticles: (interestId?: number, sortBy?: BookmarkSort, signal?: AbortSignal) =>
    apiClient('/articles/bookmark', {
      signal,
      params: {
        ...(interestId !== undefined ? { interestId } : {}),
        ...(sortBy ? { sortBy } : {}),
      } as Record<string, string | number>,
      schema: BookmarkArticlesResponseSchema,
    }),

  changeBookmarkState: (data: BookmarkRequest) =>
    apiClient<void>('/articles/bookmark', {
      method: 'POST',
      body: data,
    }),

  fetchBookmarkedInterest: (signal?: AbortSignal) =>
    apiClient('/articles/bookmark/interest', {
      signal,
      schema: BookmarkInterestListResponseSchema,
    }),

  search: (keyword: string, signal?: AbortSignal) =>
    apiClient('/articles/search', {
      signal,
      params: { keyword },
      schema: ArticleListSchema,
    }),

  fetchArticleDetail: (id: number, authenticated = true, signal?: AbortSignal) =>
    apiClient(`/articles/${id}`, { signal, authenticated, schema: ArticleDetailSchema }),

  fetchReceivedArticleCount: (signal?: AbortSignal) =>
    apiClient('/articles/received/count', { signal, schema: ArticlesCountResponseSchema }),

  refresh: () => apiClient<void>('/articles/refresh'),
};
