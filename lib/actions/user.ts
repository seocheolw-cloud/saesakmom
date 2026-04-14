"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateNicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2~10자로 입력하세요")
    .max(10, "닉네임은 2~10자로 입력하세요"),
});

export type UpdateNicknameState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

export async function updateNickname(
  _prevState: UpdateNicknameState,
  formData: FormData
): Promise<UpdateNicknameState> {
  const session = await auth();
  if (!session?.user) {
    return { message: "로그인이 필요합니다" };
  }

  const parsed = UpdateNicknameSchema.safeParse({
    nickname: formData.get("nickname"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { nickname } = parsed.data;

  if (nickname === session.user.nickname) {
    return { message: "현재 닉네임과 동일합니다" };
  }

  const existing = await prisma.user.findUnique({
    where: { nickname },
  });
  if (existing) {
    return { errors: { nickname: ["이미 사용 중인 닉네임입니다"] } };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nickname },
  });

  return { success: true, message: "닉네임이 변경되었습니다" };
}
