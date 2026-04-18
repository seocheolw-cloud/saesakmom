import { z } from "zod";

export const RegisterSchema = z
  .object({
    email: z.string().email("유효한 이메일을 입력하세요"),
    nickname: z
      .string()
      .min(2, "닉네임은 2~10자로 입력하세요")
      .max(10, "닉네임은 2~10자로 입력하세요"),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요").max(128),
});

export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;
