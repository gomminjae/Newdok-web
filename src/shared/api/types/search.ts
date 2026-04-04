// ── Response ──

export interface SearchedNewsletter {
  id: number;
  brandName: string;
  firstDescription: string;
  imageUrl: string | null;
}

export interface PopularKeyword {
  rank: number;
  keyword: string;
}

export interface PopularKeywordResponse {
  updatedDate: string;
  keywords: PopularKeyword[];
}
