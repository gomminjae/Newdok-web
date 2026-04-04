// ── Request ──

export interface BookmarkRequest {
  articleId: number;
}

// ── Response ──

export interface MonthlyArticles {
  publishDate: number;
  hasArticles: boolean;
  totalCount: number;
  unreadCount: number;
}

export interface MonthlyArticlesResponse {
  data: MonthlyArticles[];
}

export interface Article {
  id: number;
  brandName: string;
  imageUrl: string | null;
  articleTitle: string;
  status: string;
  publishDate: number | null;
}

export interface ArticleDetail {
  articleTitle: string;
  articleid: number;
  date: string;
  brandId: number;
  brandName: string;
  articleHTML: string;
  brandImageUrl: string | null;
  isBookmarked: boolean;
}

export interface Bookmark {
  brandName: string;
  brandId: number;
  articleTitle: string;
  articleId: number;
  sampleText: string | null;
  date: string;
  imageURL: string | null;
}

export interface MonthlyBookmark {
  month: string;
  bookmark: Bookmark[];
}

export interface BookmarkedArticles {
  totalAmount: number;
  bookmarkForMonth: MonthlyBookmark[];
}

export interface BookmarkArticlesResponse {
  data: BookmarkedArticles;
}

export interface BookmarkInterest {
  id: number;
  name: string;
}

export interface BookmarkInterestListResponse {
  data: BookmarkInterest[];
}

export interface ArticlesCountResponse {
  count: number;
}
