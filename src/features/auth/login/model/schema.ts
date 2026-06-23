import { z } from 'zod';

export const LoginFormSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력해주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(6, '비밀번호는 6자 이상이어야 합니다.'),
});
export type LoginFormValues = z.infer<typeof LoginFormSchema>;
