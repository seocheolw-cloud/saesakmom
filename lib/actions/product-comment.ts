"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCommentSchema, type AdminFormState } from "@/lib/validations/product";

export async function createProductComment(
  productId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user) return { message: "로그인이 필요합니다." };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true, suspendedUntil: true } });
  if (!dbUser || dbUser.status === "BANNED") return { message: "계정이 차단되었습니다." };
  if (dbUser.status === "SUSPENDED") {
    if (dbUser.suspendedUntil && dbUser.suspendedUntil <= new Date()) {
      await prisma.user.update({ where: { id: session.user.id }, data: { status: "ACTIVE", suspendedUntil: null } });
    } else {
      const until = dbUser.suspendedUntil ? dbUser.suspendedUntil.toLocaleDateString("ko-KR") : "";
      return { message: `${until}까지 댓글 작성이 정지된 상태입니다.` };
    }
  }

  const parsed = ProductCommentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const parentId = formData.get("parentId") as string | null;

  await prisma.productComment.create({
    data: { content: parsed.data.content, productId, authorId: session.user.id, parentId: parentId || null },
  });

  revalidatePath(`/products/${productId}`);
  return { message: "" };
}

export async function editProductComment(commentId: string, productId: string, content: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const comment = await prisma.productComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return;
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 1000) return;
  await prisma.productComment.update({ where: { id: commentId }, data: { content: trimmed, updatedAt: new Date() } });
  revalidatePath(`/products/${productId}`);
}

export async function deleteProductComment(commentId: string, productId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const comment = await prisma.productComment.findUnique({ where: { id: commentId } });
  if (!comment || (comment.authorId !== session.user.id && session.user.role !== "ADMIN")) return;
  await prisma.productComment.delete({ where: { id: commentId } });
  revalidatePath(`/products/${productId}`);
}
