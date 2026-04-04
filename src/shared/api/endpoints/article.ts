import { apiClient } from '../client';
import type {
  BookmarkRequest,
  MonthlyArticlesResponse,
  Article,
  ArticleDetail,
  BookmarkArticlesResponse,
  BookmarkInterestListResponse,
  ArticlesCountResponse,
} from '../types';

export const articleApi = {
  fetchArticles: (year: number, publicationMonth: number) =>
    apiClient<MonthlyArticlesResponse>('/articles', {
      params: { year, publicationMonth },
    }),

  fetchTodayArticle: () => apiClient<Article[]>('/articles/today'),

  fetchDayArticle: (year: number, publicationMonth: number, publicationDate: number) =>
    apiClient<Article[]>('/articles/day', {
      params: { year, publicationMonth, publicationDate },
    }),

  fetchBookmarkArticles: (interestId?: number, sortBy?: string) =>
    apiClient<BookmarkArticlesResponse>('/articles/bookmark', {
      params: {
        ...(interestId !== undefined ? { interestId } : {}),
        ...(sortBy ? { sortBy } : {}),
      } as Record<string, string | number>,
    }),

  changeBookmarkState: (data: BookmarkRequest) =>
    apiClient<void>('/articles/bookmark', {
      method: 'POST',
      body: data,
    }),

  fetchBookmarkedInterest: () =>
    apiClient<BookmarkInterestListResponse>('/articles/bookmark/interest'),

  search: (keyword: string) =>
    apiClient<Article[]>('/articles/search', {
      params: { keyword },
    }),

  fetchArticleDetail: (id: number) =>
    apiClient<ArticleDetail>(`/articles/${id}`),

  fetchReceivedArticleCount: () =>
    apiClient<ArticlesCountResponse>('/articles/received/count'),

  refresh: () => apiClient<void>('/articles/refresh'),
};
