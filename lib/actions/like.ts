"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePostReaction(postId: string, type: "LIKE" | "DISLIKE"): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existing) {
    if (existing.type === type) {
      // 같은 타입 누르면 취소
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.update({
        where: { id: postId },
        data: type === "LIKE" ? { likeCount: { decrement: 1 } } : { dislikeCount: { decrement: 1 } },
      });
    } else {
      // 다른 타입으로 변경
      await prisma.like.update({ where: { id: existing.id }, data: { type } });
      await prisma.post.update({
        where: { id: postId },
        data: type === "LIKE"
          ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
          : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
      });
    }
  } else {
    await prisma.like.create({
      data: { userId: session.user.id, postId, type },
    });
    await prisma.post.update({
      where: { id: postId },
      data: type === "LIKE" ? { likeCount: { increment: 1 } } : { dislikeCount: { increment: 1 } },
    });

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
        // 글 작성자에게 경험치
        const { addExp } = await import("./exp");
        const { EXP_REWARDS } = await import("@/lib/level");
        await addExp(post.authorId, EXP_REWARDS.LIKED);
      }
    }
  }

  revalidatePath(`/community/${postId}`);
}

export async function toggleCommentReaction(commentId: string, postId: string, type: "LIKE" | "DISLIKE"): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const existing = await prisma.like.findUnique({
    where: { userId_commentId: { userId: session.user.id, commentId } },
  });

  if (existing) {
    if (existing.type === type) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.comment.update({
        where: { id: commentId },
        data: type === "LIKE" ? { likeCount: { decrement: 1 } } : { dislikeCount: { decrement: 1 } },
      });
    } else {
      await prisma.like.update({ where: { id: existing.id }, data: { type } });
      await prisma.comment.update({
        where: { id: commentId },
        data: type === "LIKE"
          ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
          : { likeCount: { decrement: 1 }, dislikeCount: { increment: 1 } },
      });
    }
  } else {
    await prisma.like.create({
      data: { userId: session.user.id, commentId, type },
    });
    await prisma.comment.update({
      where: { id: commentId },
      data: type === "LIKE" ? { likeCount: { increment: 1 } } : { dislikeCount: { increment: 1 } },
    });
  }

  revalidatePath(`/community/${postId}`);
}

// 이전 코드 호환용
export async function toggleLike(postId: string): Promise<void> {
  return togglePostReaction(postId, "LIKE");
}
