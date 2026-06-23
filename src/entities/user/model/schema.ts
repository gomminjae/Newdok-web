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
  loginId: z.string(),
  nickname: z.string(),
});
export type NicknameResponse = z.infer<typeof NicknameResponseSchema>;

export const RecommendedBrandSchema = z.object({
  id: z.number(),
  brandName: z.string(),
  firstDescription: z.string(),
  secondDescription: z.string(),
  publicationCycle: z.string(),
  subscribeUrl: z.string(),
  imageUrl: z.string().nullable(),
  interests: z.array(InterestSchema),
});
export type RecommendedBrand = z.infer<typeof RecommendedBrandSchema>;

export const RecommendedBrandListResponseSchema = z.object({
  data: z.array(RecommendedBrandSchema),
});
export type RecommendedBrandListResponse = z.infer<typeof RecommendedBrandListResponseSchema>;

export const UserProfileSchema = AuthUserSchema;
export type UserProfile = z.infer<typeof UserProfileSchema>;
