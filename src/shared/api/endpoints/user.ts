import { apiClient, setAccessToken } from '../client';
import type {
  LoginRequest,
  SignupRequest,
  NicknameRequest,
  PasswordRequest,
  InterestRequest,
  IndustryRequest,
  PhoneNumberRequest,
  AuthResponse,
  SimpleUser,
  SMSResponse,
  NicknameResponse,
  RecommendedBrandListResponse,
  UserProfile,
} from '../types';

export const userApi = {
  login: async (data: LoginRequest) => {
    const res = await apiClient<AuthResponse>('/users/login', {
      method: 'POST',
      body: data,
    });
    setAccessToken(res.accessToken);
    return res;
  },

  signup: async (data: SignupRequest) => {
    const res = await apiClient<AuthResponse>('/users/signup', {
      method: 'POST',
      body: data,
    });
    setAccessToken(res.accessToken);
    return res;
  },

  checkPhoneNumber: (phoneNumber: string) =>
    apiClient<SimpleUser[]>('/users/check/phoneNumber', {
      params: { phoneNumber },
    }),

  checkLoginId: (loginId: string) =>
    apiClient<SimpleUser>('/users/check/loginId', {
      params: { loginId },
    }),

  updateNickname: (data: NicknameRequest) =>
    apiClient<NicknameResponse>('/users/mypage/nickname', {
      method: 'PATCH',
      body: data,
    }),

  updatePassword: (data: PasswordRequest) =>
    apiClient<void>('/users/mypage/password', {
      method: 'PATCH',
      body: data,
    }),

  updateInterest: (data: InterestRequest) =>
    apiClient<void>('/users/mypage/interest', {
      method: 'PATCH',
      body: data,
    }),

  updateIndustry: (data: IndustryRequest) =>
    apiClient<void>('/users/mypage/industry', {
      method: 'PATCH',
      body: data,
    }),

  updatePhoneNumber: (data: PhoneNumberRequest) =>
    apiClient<void>('/users/mypage/phoneNumber', {
      method: 'PATCH',
      body: data,
    }),

  authSMS: (data: PhoneNumberRequest) =>
    apiClient<SMSResponse>('/auth/SMS', {
      method: 'POST',
      body: data,
    }),

  preInvestigate: (industry: string, interest: string) =>
    apiClient<RecommendedBrandListResponse>('/users/preInvestigate', {
      params: { industry, interest },
    }),

  getProfile: () => apiClient<UserProfile>('/users/my'),

  withdraw: () =>
    apiClient<void>('/users/withdraw', {
      method: 'PATCH',
    }),
};
