"use server";

import { signIn, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { z } from "zod";

const AdminLoginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다").max(128),
  confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type FormState = { message?: string; errors?: Record<string, string[]>; success?: boolean } | undefined;

export async function adminLogin(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = AdminLoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { nickname: parsed.data.username },
    select: { email: true, password: true, role: true, status: true },
  });

  if (!user || user.role !== "ADMIN") {
    return { message: "관리자 권한이 없는 계정입니다." };
  }

  if (user.status !== "ACTIVE") {
    return { message: "비활성 상태의 계정입니다." };
  }

  if (!user.password) {
    return { message: "비밀번호가 설정되지 않은 계정입니다." };
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.password);
  if (!isValid) {
    return { message: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  try {
    await signIn("credentials", {
      email: user.email,
      password: parsed.data.password,
      redirectTo: "/admin/products",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "로그인에 실패했습니다." };
    }
    throw error;
  }
}

export async function changeAdminPassword(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { message: "관리자 권한이 필요합니다." };
  }

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { message: "비밀번호가 설정되지 않은 계정입니다." };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isValid) {
    return { message: "현재 비밀번호가 올바르지 않습니다." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  revalidatePath("/admin");
  return { success: true, message: "비밀번호가 변경되었습니다." };
}
