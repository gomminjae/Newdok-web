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
  fetchArticles: (year: number, publicationMonth: number) =>
    apiClient('/articles', {
      params: { year, publicationMonth },
      schema: MonthlyArticlesResponseSchema,
    }),

  fetchTodayArticle: () =>
    apiClient('/articles/today', { schema: ArticleListSchema }),

  fetchDayArticle: (year: number, publicationMonth: number, publicationDate: number) =>
    apiClient('/articles/day', {
      params: { year, publicationMonth, publicationDate },
      schema: ArticleListSchema,
    }),

  fetchBookmarkArticles: (interestId?: number, sortBy?: BookmarkSort) =>
    apiClient('/articles/bookmark', {
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

  fetchBookmarkedInterest: () =>
    apiClient('/articles/bookmark/interest', {
      schema: BookmarkInterestListResponseSchema,
    }),

  search: (keyword: string) =>
    apiClient('/articles/search', {
      params: { keyword },
      schema: ArticleListSchema,
    }),

  fetchArticleDetail: (id: number, authenticated = true) =>
    apiClient(`/articles/${id}`, { authenticated, schema: ArticleDetailSchema }),

  fetchReceivedArticleCount: () =>
    apiClient('/articles/received/count', { schema: ArticlesCountResponseSchema }),

  refresh: () => apiClient<void>('/articles/refresh'),
};
