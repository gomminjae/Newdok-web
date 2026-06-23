import { apiClient, setAccessToken } from '@/shared/api/client';
import {
  AuthResponseSchema,
  NicknameResponseSchema,
  RecommendedBrandListResponseSchema,
  SMSResponseSchema,
  SimpleUserSchema,
  SimpleUserListSchema,
  UserProfileSchema,
  type IndustryRequest,
  type InterestRequest,
  type LoginRequest,
  type NicknameRequest,
  type PasswordRequest,
  type PhoneNumberRequest,
  type SignupRequest,
} from '../model/schema';

export const userApi = {
  login: async (data: LoginRequest) => {
    const res = await apiClient('/users/login', {
      method: 'POST',
      body: data,
      schema: AuthResponseSchema,
    });
    setAccessToken(res.accessToken);
    return res;
  },

  signup: async (data: SignupRequest) => {
    const res = await apiClient('/users/signup', {
      method: 'POST',
      body: data,
      schema: AuthResponseSchema,
    });
    setAccessToken(res.accessToken);
    return res;
  },

  checkPhoneNumber: (phoneNumber: string) =>
    apiClient('/users/check/phoneNumber', {
      params: { phoneNumber },
      schema: SimpleUserListSchema,
    }),

  checkLoginId: (loginId: string) =>
    apiClient('/users/check/loginId', {
      params: { loginId },
      schema: SimpleUserSchema,
    }),

  updateNickname: (data: NicknameRequest) =>
    apiClient('/users/mypage/nickname', {
      method: 'PATCH',
      body: data,
      schema: NicknameResponseSchema,
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
    apiClient('/auth/SMS', {
      method: 'POST',
      body: data,
      schema: SMSResponseSchema,
    }),

  preInvestigate: (industry: string, interest: string) =>
    apiClient('/users/preInvestigate', {
      params: { industry, interest },
      schema: RecommendedBrandListResponseSchema,
    }),

  getProfile: () =>
    apiClient('/users/my', { schema: UserProfileSchema }),

  withdraw: () =>
    apiClient<void>('/users/withdraw', {
      method: 'PATCH',
    }),
};
