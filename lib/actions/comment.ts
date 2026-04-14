"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().min(1, "댓글을 입력하세요"),
});

export type CommentFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function createComment(
  postId: string,
  parentId: string | null,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = CommentSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      authorId: session.user.id,
      postId,
      parentId,
    },
  });

  revalidatePath(`/community/${postId}`);
  return { message: "" }; // success - clear form
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return;

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "DELETED" },
  });

  revalidatePath(`/community/${postId}`);
}
