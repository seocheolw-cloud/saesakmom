"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function reportBase(reason: string, data: { postId?: string; commentId?: string; detail?: string }): Promise<{ success?: boolean; message?: string }> {
  const session = await auth();
  if (!session?.user) return { message: "로그인이 필요합니다." };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status === "BANNED") return { message: "계정이 차단되었습니다." };
  const trimmed = reason.trim();
  if (!trimmed || trimmed.length < 2) return { message: "신고 사유를 입력해주세요." };

  const duplicateWhere: Record<string, unknown> = { reporterId: session.user.id, status: "PENDING" };
  if (data.postId) duplicateWhere.postId = data.postId;
  else if (data.commentId) duplicateWhere.commentId = data.commentId;
  else if (data.detail) duplicateWhere.detail = data.detail;

  const existing = await prisma.report.findFirst({ where: duplicateWhere });
  if (existing) return { message: "이미 신고한 항목입니다." };

  await prisma.report.create({
    data: { reason: trimmed, reporterId: session.user.id, ...data },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function reportPost(postId: string, reason: string) {
  return reportBase(reason, { postId });
}

export async function reportComment(commentId: string, reason: string) {
  return reportBase(reason, { commentId });
}

export async function reportComparisonComment(commentId: string, comparisonId: string, reason: string) {
  return reportBase(reason, { detail: `비교 댓글 신고 | 비교ID: ${comparisonId} | 댓글ID: ${commentId}` });
}

export async function reportProductComment(commentId: string, productId: string, reason: string) {
  return reportBase(reason, { detail: `육아용품 댓글 신고 | 상품ID: ${productId} | 댓글ID: ${commentId}` });
}
