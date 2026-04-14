"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });
  } else {
    await prisma.like.create({
      data: { userId: session.user.id, postId },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    // 좋아요 알림
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
    }
  }

  revalidatePath(`/community/${postId}`);
}
