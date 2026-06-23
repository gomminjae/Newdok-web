import { z } from 'zod';

export const SearchedNewsletterSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  firstDescription: z.string(),
  imageUrl: z.string().nullable(),
});
export type SearchedNewsletter = z.infer<typeof SearchedNewsletterSchema>;

export const SearchedNewsletterListSchema = z.array(SearchedNewsletterSchema);

export const PopularKeywordSchema = z.object({
  rank: z.number(),
  keyword: z.string(),
});
export type PopularKeyword = z.infer<typeof PopularKeywordSchema>;

export const PopularKeywordResponseSchema = z.object({
  updatedDate: z.string(),
  keywords: z.array(PopularKeywordSchema),
});
export type PopularKeywordResponse = z.infer<typeof PopularKeywordResponseSchema>;
