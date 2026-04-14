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

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      authorId: session.user.id,
      postId,
      parentId,
    },
  });

  // 알림 생성
  const { createNotification } = await import("./notification");
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true },
  });

  if (parentId) {
    // 대댓글 → 원댓글 작성자에게 알림
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parentComment) {
      await createNotification({
        userId: parentComment.authorId,
        type: "REPLY",
        message: `${session.user.nickname}님이 회원님의 댓글에 답글을 달았습니다`,
        postId,
        commentId: comment.id,
      });
    }
  } else if (post) {
    // 댓글 → 게시글 작성자에게 알림
    await createNotification({
      userId: post.authorId,
      type: "COMMENT",
      message: `${session.user.nickname}님이 "${post.title}" 글에 댓글을 달았습니다`,
      postId,
      commentId: comment.id,
    });
  }

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
