"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePostReaction(postId: string, type: "LIKE" | "DISLIKE"): Promise<void> {
  if (type !== "LIKE" && type !== "DISLIKE") return;
  const session = await auth();
  if (!session?.user) return;

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status === "BANNED") return;

  let shouldNotify = false;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } },
    });

    if (existing) {
      if (existing.type === type) {
        await tx.like.delete({ where: { id: existing.id } });
        await tx.post.update({
          where: { id: postId },
          data: type === "LIKE" ? { likeCount: { decrement: 1 } } : { dislikeCount: { decrement: 1 } },
        });
      } else {
        await tx.like.update({ where: { id: existing.id }, data: { type } });
        await tx.post.update({
          where: { id: postId },
          data: type === "LIKE"
            ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
            : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
        });
      }
    } else {
      await tx.like.create({ data: { type, userId: session.user.id, postId } });
      await tx.post.update({
        where: { id: postId },
        data: type === "LIKE" ? { likeCount: { increment: 1 } } : { dislikeCount: { increment: 1 } },
      });
      shouldNotify = true;
    }
  });

  if (shouldNotify && type === "LIKE") {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });
    if (post && post.authorId !== session.user.id) {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        userId: post.authorId,
        type: "LIKE",
        message: `${session.user.nickname}님이 "${post.title}" 글을 좋아합니다`,
        postId,
      });
    }
  }

  revalidatePath(`/community/${postId}`);
}

export async function toggleCommentReaction(commentId: string, postId: string, type: "LIKE" | "DISLIKE"): Promise<void> {
  if (type !== "LIKE" && type !== "DISLIKE") return;
  const session = await auth();
  if (!session?.user) return;

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status === "BANNED") return;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({
      where: { userId_commentId: { userId: session.user.id, commentId } },
    });

    if (existing) {
      if (existing.type === type) {
        await tx.like.delete({ where: { id: existing.id } });
        await tx.comment.update({
          where: { id: commentId },
          data: type === "LIKE" ? { likeCount: { decrement: 1 } } : { dislikeCount: { decrement: 1 } },
        });
      } else {
        await tx.like.update({ where: { id: existing.id }, data: { type } });
        await tx.comment.update({
          where: { id: commentId },
          data: type === "LIKE"
            ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
            : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
        });
      }
    } else {
      await tx.like.create({ data: { type, userId: session.user.id, commentId } });
      await tx.comment.update({
        where: { id: commentId },
        data: type === "LIKE" ? { likeCount: { increment: 1 } } : { dislikeCount: { increment: 1 } },
      });
    }
  });

  revalidatePath(`/community/${postId}`);
}

// 이전 코드 호환용
export async function toggleLike(postId: string): Promise<void> {
  return togglePostReaction(postId, "LIKE");
}
