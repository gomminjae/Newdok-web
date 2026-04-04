// ── Request ──

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface SignupRequest {
  loginId: string;
  password: string;
  phoneNumber: string;
  nickname: string;
  birthYear: string;
  gender: string;
}

export interface NicknameRequest {
  nickname: string;
}

export interface PasswordRequest {
  loginId: string;
  prevPassword: string;
  password: string;
}

export interface InterestRequest {
  interestIds: number[];
}

export interface IndustryRequest {
  industryId: number;
}

export interface PhoneNumberRequest {
  phoneNumber: string;
}

// ── Response ──

export interface LoginInterest {
  userId: number;
  interestId: number;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  loginId: string;
  phoneNumber: string;
  subscribeEmail: string | null;
  nickname: string;
  birthYear: string;
  gender: string;
  createdAt: string;
  industryId: number | null;
  interests: LoginInterest[] | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface SimpleUser {
  id: number;
  loginId: string;
  phoneNumber: string;
  createdAt: string;
}

export interface SMSResponse {
  code: number;
}

export interface NicknameResponse {
  id: number;
  loginId: string;
  nickname: string;
}

export interface RecommendedBrand {
  id: number;
  brandName: string;
  firstDescription: string;
  secondDescription: string;
  publicationCycle: string;
  subscribeUrl: string;
  imageUrl: string | null;
  interests: Interest[];
}

export interface RecommendedBrandListResponse {
  data: RecommendedBrand[];
}

export interface Interest {
  id: number;
  name: string;
}

export interface UserProfile {
  id: number;
  loginId: string;
  phoneNumber: string;
  subscribeEmail: string | null;
  nickname: string;
  birthYear: string;
  gender: string;
  createdAt: string;
  industryId: number | null;
  interests: LoginInterest[] | null;
}
