"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { RegisterSchema, LoginSchema, type AuthFormState } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function register(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    nickname: formData.get("nickname"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, nickname, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    return { errors: { email: ["이미 사용 중인 이메일입니다"] } };
  }

  const existingNickname = await prisma.user.findUnique({
    where: { nickname },
  });
  if (existingNickname) {
    return { errors: { nickname: ["이미 사용 중인 닉네임입니다"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      nickname,
      password: hashedPassword,
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/",
  });
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "이메일 또는 비밀번호가 올바르지 않습니다" };
    }
    throw error;
  }
}
