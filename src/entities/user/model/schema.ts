import { z } from 'zod';

export const LoginRequestSchema = z.object({
  loginId: z.string(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const SignupRequestSchema = z.object({
  loginId: z.string(),
  password: z.string(),
  phoneNumber: z.string(),
  nickname: z.string(),
  birthYear: z.string(),
  gender: z.string(),
});
export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const NicknameRequestSchema = z.object({
  nickname: z.string(),
});
export type NicknameRequest = z.infer<typeof NicknameRequestSchema>;

export const PasswordRequestSchema = z.object({
  loginId: z.string(),
  prevPassword: z.string(),
  password: z.string(),
});
export type PasswordRequest = z.infer<typeof PasswordRequestSchema>;

export const InterestRequestSchema = z.object({
  interestIds: z.array(z.number()),
});
export type InterestRequest = z.infer<typeof InterestRequestSchema>;

export const IndustryRequestSchema = z.object({
  industryId: z.number(),
});
export type IndustryRequest = z.infer<typeof IndustryRequestSchema>;

export const PhoneNumberRequestSchema = z.object({
  phoneNumber: z.string(),
});
export type PhoneNumberRequest = z.infer<typeof PhoneNumberRequestSchema>;

export const LoginInterestSchema = z.object({
  userId: z.number(),
  interestId: z.number(),
  createdAt: z.string(),
});
export type LoginInterest = z.infer<typeof LoginInterestSchema>;

export const InterestSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type Interest = z.infer<typeof InterestSchema>;

export const AuthUserSchema = z.object({
  id: z.number(),
  loginId: z.string(),
  phoneNumber: z.string(),
  subscribeEmail: z.string().nullable(),
  nickname: z.string(),
  birthYear: z.string(),
  gender: z.string(),
  createdAt: z.string(),
  industryId: z.number().nullable(),
  interests: z.array(LoginInterestSchema).nullable(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const SocialProviderSchema = z.enum(['KAKAO', 'APPLE']);
export type SocialProvider = z.infer<typeof SocialProviderSchema>;

export const SocialLoginRequestSchema = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('KAKAO'),
    platform: z.literal('WEB'),
    authorizationCode: z.string().min(1),
    redirectUri: z.url(),
  }),
  z.object({
    provider: z.literal('APPLE'),
    platform: z.literal('WEB'),
    idToken: z.string().min(1),
    authorizationCode: z.string().min(1).optional(),
    redirectUri: z.url(),
  }),
]);
export type SocialLoginRequest = z.infer<typeof SocialLoginRequestSchema>;

export const SocialProfileSchema = z.object({
  provider: z.string().nullable().optional(),
  providerUserId: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
});

// 소셜 계정에는 기존 ID/PW 회원의 loginId, phoneNumber가 없을 수 있다.
export const SocialAuthUserSchema = z.object({
  id: z.number(),
  loginId: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  subscribeEmail: z.string().nullable(),
  nickname: z.string(),
  birthYear: z.string(),
  gender: z.string(),
  createdAt: z.string(),
  industryId: z.number().nullable().optional(),
  interests: z.array(LoginInterestSchema).nullable().optional(),
});
export type SocialAuthUser = z.infer<typeof SocialAuthUserSchema>;

export const SocialLoginResponseSchema = z.discriminatedUnion('isRegistered', [
  z.object({
    isRegistered: z.literal(true),
    accessToken: z.string().min(1),
    user: SocialAuthUserSchema,
  }),
  z.object({
    isRegistered: z.literal(false),
    signupToken: z.string().min(1),
    profile: SocialProfileSchema.nullish(),
  }),
]);
export type SocialLoginResponse = z.infer<typeof SocialLoginResponseSchema>;

export const SocialAgreementTypeSchema = z.enum([
  'AGE_CONFIRMATION_OVER_14',
  'TERMS_OF_SERVICE',
  'PERSONAL_INFORMATION_COLLECTION_AND_USE',
  'MARKETING_INFORMATION_RECEIPT',
]);
export type SocialAgreementType = z.infer<typeof SocialAgreementTypeSchema>;

export const SocialSignupRequestSchema = z.object({
  signupToken: z.string().min(1),
  nickname: z
    .string()
    .min(1, '1자 이상 12자 이하로 입력해주세요.')
    .max(12, '1자 이상 12자 이하로 입력해주세요.')
    .regex(/^[a-zA-Z0-9가-힣]+$/, '특수문자와 공백은 사용할 수 없습니다.'),
  birthYear: z.string().regex(/^\d{4}$/),
  gender: z.enum(['남자', '여자', '그외']),
  agreements: z.array(z.object({
    type: SocialAgreementTypeSchema,
    agreed: z.boolean(),
  })),
});
export type SocialSignupRequest = z.infer<typeof SocialSignupRequestSchema>;

export const SocialSignupResponseSchema = z.object({
  user: SocialAuthUserSchema,
  accessToken: z.string().min(1),
});
export type SocialSignupResponse = z.infer<typeof SocialSignupResponseSchema>;

export const SimpleUserSchema = z.object({
  id: z.number(),
  loginId: z.string(),
  phoneNumber: z.string(),
  createdAt: z.string(),
});
export type SimpleUser = z.infer<typeof SimpleUserSchema>;

export const SimpleUserListSchema = z.array(SimpleUserSchema);

export const SMSResponseSchema = z.object({
  code: z.number(),
});
export type SMSResponse = z.infer<typeof SMSResponseSchema>;

export const NicknameResponseSchema = z.object({
  id: z.number(),
  loginId: z.string().nullish(),
  nickname: z.string(),
});
export type NicknameResponse = z.infer<typeof NicknameResponseSchema>;

export const RecommendedBrandSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  firstDescription: z.string(),
  secondDescription: z.string(),
  publicationCycle: z.string().nullish().transform((value) => value ?? ''),
  subscribeUrl: z.string(),
  imageUrl: z.string().nullable(),
  interests: z.array(InterestSchema),
});
export type RecommendedBrand = z.infer<typeof RecommendedBrandSchema>;

export const RecommendedBrandListResponseSchema = z.object({
  data: z.array(RecommendedBrandSchema),
});
export type RecommendedBrandListResponse = z.infer<typeof RecommendedBrandListResponseSchema>;

export const UserProfileSchema = z.union([AuthUserSchema, SocialAuthUserSchema]);
export type UserProfile = z.infer<typeof UserProfileSchema>;
