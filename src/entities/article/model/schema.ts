import { z } from 'zod';

export const BookmarkRequestSchema = z.object({
  articleId: z.number(),
});
export type BookmarkRequest = z.infer<typeof BookmarkRequestSchema>;

export const MonthlyArticlesSchema = z.object({
  publishDate: z.number(),
  hasArticles: z.boolean(),
  totalCount: z.number(),
  unreadCount: z.number(),
});
export type MonthlyArticles = z.infer<typeof MonthlyArticlesSchema>;

export const MonthlyArticlesResponseSchema = z.object({
  data: z.array(MonthlyArticlesSchema),
});
export type MonthlyArticlesResponse = z.infer<typeof MonthlyArticlesResponseSchema>;

export const ArticleSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  imageUrl: z.string().nullable(),
  articleTitle: z.string(),
  status: z.string(),
  publishDate: z.number().nullable(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const ArticleListSchema = z.array(ArticleSchema);

export const ArticleDetailSchema = z.object({
  articleTitle: z.string(),
  articleid: z.number(),
  date: z.string(),
  brandId: z.number(),
  brandName: z.string(),
  articleHTML: z.string(),
  brandImageUrl: z.string().nullable(),
  isBookmarked: z.boolean(),
});
export type ArticleDetail = z.infer<typeof ArticleDetailSchema>;

export const BookmarkSchema = z.object({
  brandName: z.string(),
  brandId: z.number(),
  articleTitle: z.string(),
  articleId: z.number(),
  sampleText: z.string().nullable(),
  date: z.string(),
  imageURL: z.string().nullable(),
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

export const MonthlyBookmarkSchema = z.object({
  month: z.string(),
  bookmark: z.array(BookmarkSchema),
});
export type MonthlyBookmark = z.infer<typeof MonthlyBookmarkSchema>;

export const BookmarkedArticlesSchema = z.object({
  totalAmount: z.number(),
  bookmarkForMonth: z.array(MonthlyBookmarkSchema),
});
export type BookmarkedArticles = z.infer<typeof BookmarkedArticlesSchema>;

export const BookmarkArticlesResponseSchema = z.object({
  data: BookmarkedArticlesSchema,
});
export type BookmarkArticlesResponse = z.infer<typeof BookmarkArticlesResponseSchema>;

export const BookmarkInterestSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type BookmarkInterest = z.infer<typeof BookmarkInterestSchema>;

export const BookmarkInterestListResponseSchema = z.object({
  data: z.array(BookmarkInterestSchema),
});
export type BookmarkInterestListResponse = z.infer<typeof BookmarkInterestListResponseSchema>;

export const ArticlesCountResponseSchema = z.object({
  count: z.number(),
});
export type ArticlesCountResponse = z.infer<typeof ArticlesCountResponseSchema>;
