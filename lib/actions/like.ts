"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePostReaction(postId: string, type: "LIKE" | "DISLIKE"): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.$transaction([
          prisma.like.delete({ where: { id: existing.id } }),
          prisma.post.update({
            where: { id: postId },
            data: type === "LIKE"
              ? { likeCount: { decrement: 1 } }
              : { dislikeCount: { decrement: 1 } },
          }),
        ]);
      } else {
        await prisma.$transaction([
          prisma.like.update({ where: { id: existing.id }, data: { type } }),
          prisma.post.update({
            where: { id: postId },
            data: type === "LIKE"
              ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
              : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
          }),
        ]);
      }
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: { userId: session.user.id, postId, type },
        }),
        prisma.post.update({
          where: { id: postId },
          data: type === "LIKE"
            ? { likeCount: { increment: 1 } }
            : { dislikeCount: { increment: 1 } },
        }),
      ]);

      if (type === "LIKE") {
        const { createNotification } = await import("./notification");
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { authorId: true, title: true },
        });
        if (post) {
          await createNotification({
            userId: post.authorId,
            type: "LIKE",
            message: `${session.user.nickname}님이 "${post.title}" 글을 좋아합니다`,
            postId,
          });
          const { addExp } = await import("./exp");
          const { EXP_REWARDS } = await import("@/lib/level");
          await addExp(post.authorId, EXP_REWARDS.LIKED);
        }
      }
    }
  } catch {
    // DB 에러 시 무시 (이미 삭제된 좋아요 등)
  }

  revalidatePath(`/community/${postId}`);
}

export async function toggleCommentReaction(commentId: string, postId: string, type: "LIKE" | "DISLIKE"): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_commentId: { userId: session.user.id, commentId } },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.$transaction([
          prisma.like.delete({ where: { id: existing.id } }),
          prisma.comment.update({
            where: { id: commentId },
            data: type === "LIKE"
              ? { likeCount: { decrement: 1 } }
              : { dislikeCount: { decrement: 1 } },
          }),
        ]);
      } else {
        await prisma.$transaction([
          prisma.like.update({ where: { id: existing.id }, data: { type } }),
          prisma.comment.update({
            where: { id: commentId },
            data: type === "LIKE"
              ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
              : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
          }),
        ]);
      }
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: { userId: session.user.id, commentId, type },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: type === "LIKE"
            ? { likeCount: { increment: 1 } }
            : { dislikeCount: { increment: 1 } },
        }),
      ]);
    }
  } catch {
    // DB 에러 시 무시
  }

  revalidatePath(`/community/${postId}`);
}

// 이전 코드 호환용
export async function toggleLike(postId: string): Promise<void> {
  return togglePostReaction(postId, "LIKE");
}
