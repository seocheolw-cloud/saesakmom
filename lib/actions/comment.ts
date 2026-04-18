"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().trim().min(1, "댓글을 입력하세요").max(5000),
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

  const parsed = CommentSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // 삭제된 게시글에 댓글 방지
  const targetPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { status: true },
  });
  if (!targetPost || targetPost.status !== "ACTIVE") {
    return { message: "삭제된 게시글입니다." };
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      authorId: session.user.id,
      postId,
      parentId,
    },
  });

  // 경험치 부여
  const { addExp } = await import("./exp");
  const { EXP_REWARDS } = await import("@/lib/level");
  await addExp(session.user.id, EXP_REWARDS.COMMENT);

  // 알림 생성
  const { createNotification } = await import("@/lib/notifications");
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

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status !== "ACTIVE") return;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || (comment.authorId !== session.user.id && session.user.role !== "ADMIN")) return;

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "DELETED" },
  });

  revalidatePath(`/community/${postId}`);
}
