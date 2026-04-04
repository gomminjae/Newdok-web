import type { Interest } from './user';

// ── Request ──

export interface SubscriptionRequest {
  newsletterId: number;
}

// ── Response ──

export interface NewsletterBrand {
  brandId: number;
  brandName: string;
  imageUrl: string | null;
  interests: Interest[];
  isSubscribed: string | null;
  shortDescription: string;
  subscriptionCount: number | null;
}

export interface BrandArticle {
  id: number;
  title: string;
  date: string;
}

export interface BrandDetail {
  brandId: number;
  brandName: string;
  detailDescription: string | null;
  publicationCycle: string;
  subscribeUrl: string;
  imageUrl: string | null;
  interests: Interest[];
  brandArticleList: BrandArticle[];
  isSubscribed: string | null;
  subscribeCheck: boolean;
}

export interface Industry {
  id: number;
  name: string;
}

export interface NewsletterDetail {
  id: number;
  brandName: string;
  firstDescription: string;
  secondDescription: string;
  publicationCycle: string;
  subscribeUrl: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  industries: Industry[];
  interests: Interest[];
}

export interface SubscribedNewsletter {
  id: number | null;
  brandName: string;
  imageUrl: string | null;
  publicationCycle: string | null;
}

export interface OptionItem {
  id: number;
  name: string;
}

export interface OptionList {
  industries: OptionItem[];
  interests: OptionItem[];
  days: OptionItem[];
}

export interface SubscriptionCountResponse {
  count: number;
}
