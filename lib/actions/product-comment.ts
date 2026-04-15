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

  const parsed = ProductCommentSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.productComment.create({
      data: {
        content: parsed.data.content,
        productId,
        authorId: session.user.id,
      },
    });
  } catch {
    return { message: "댓글 작성에 실패했습니다." };
  }

  revalidatePath(`/products/${productId}`);
  return { message: "" };
}

export async function deleteProductComment(
  commentId: string,
  productId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const comment = await prisma.productComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return;

  await prisma.productComment.delete({ where: { id: commentId } });
  revalidatePath(`/products/${productId}`);
}
