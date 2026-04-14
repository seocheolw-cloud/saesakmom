"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotification({
  userId,
  type,
  message,
  postId,
  commentId,
}: {
  userId: string;
  type: "LIKE" | "COMMENT" | "REPLY";
  message: string;
  postId?: string;
  commentId?: string;
}) {
  // 자기 자신에게는 알림 보내지 않음
  const session = await auth();
  if (session?.user?.id === userId) return;

  await prisma.notification.create({
    data: { userId, type, message, postId, commentId },
  });
}

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
}

export async function markOneNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user) return;

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });
}
