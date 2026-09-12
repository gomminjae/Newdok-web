import { z } from 'zod';
import { InterestSchema } from '@/entities/user';

export const SubscriptionRequestSchema = z.object({
  newsletterId: z.number(),
});
export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>;

export const NewsletterBrandSchema = z.object({
  brandId: z.number(),
  brandName: z.string(),
  imageUrl: z.string().nullable(),
  interests: z.array(InterestSchema),
  isSubscribed: z.string().nullish(),
  shortDescription: z.string(),
  subscriptionCount: z.number().nullish(),
});
export type NewsletterBrand = z.infer<typeof NewsletterBrandSchema>;

export const NewsletterBrandListSchema = z.array(NewsletterBrandSchema);

export const NewsletterSearchResultSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  firstDescription: z.string(),
  imageUrl: z.string().nullish(),
});
export type NewsletterSearchResult = z.infer<typeof NewsletterSearchResultSchema>;
export const NewsletterSearchResultsSchema = z.array(NewsletterSearchResultSchema);

export const PopularSearchKeywordsSchema = z.object({
  updatedDate: z.string(),
  keywords: z.array(z.object({ rank: z.number(), keyword: z.string() })),
});

export const BrandArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
});
export type BrandArticle = z.infer<typeof BrandArticleSchema>;

export const BrandDetailSchema = z.object({
  brandId: z.number(),
  brandName: z.string(),
  detailDescription: z.string().nullable(),
  publicationCycle: z.string(),
  subscribeUrl: z.string(),
  imageUrl: z.string().nullable(),
  interests: z.array(InterestSchema),
  brandArticleList: z.array(BrandArticleSchema),
  isSubscribed: z.string().nullish(),
  subscribeCheck: z.boolean(),
});
export type BrandDetail = z.infer<typeof BrandDetailSchema>;

export const IndustrySchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type Industry = z.infer<typeof IndustrySchema>;

export const NewsletterDetailSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  firstDescription: z.string(),
  secondDescription: z.string(),
  publicationCycle: z.string(),
  subscribeUrl: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  industries: z.array(IndustrySchema),
  interests: z.array(InterestSchema),
});
export type NewsletterDetail = z.infer<typeof NewsletterDetailSchema>;

export const NewsletterDetailListSchema = z.array(NewsletterDetailSchema);

export const SubscribedNewsletterSchema = z.object({
  id: z.number().nullable(),
  brandName: z.string(),
  imageUrl: z.string().nullable(),
  publicationCycle: z.string().nullable(),
});
export type SubscribedNewsletter = z.infer<typeof SubscribedNewsletterSchema>;

export const SubscribedNewsletterListSchema = z.array(SubscribedNewsletterSchema);

export const OptionItemSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type OptionItem = z.infer<typeof OptionItemSchema>;

export const OptionListSchema = z.object({
  industries: z.array(OptionItemSchema),
  interests: z.array(OptionItemSchema),
  days: z.array(OptionItemSchema),
});
export type OptionList = z.infer<typeof OptionListSchema>;

export const SubscriptionCountResponseSchema = z.object({
  count: z.number(),
});
export type SubscriptionCountResponse = z.infer<typeof SubscriptionCountResponseSchema>;
