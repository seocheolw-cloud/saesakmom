"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user) return 0;
  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function getNewNotifications(since: string): Promise<{ id: string; message: string; type: string; createdAt: string }[]> {
  const session = await auth();
  if (!session?.user) return [];
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      isRead: false,
      createdAt: { gt: new Date(since) },
    },
    select: { id: true, message: true, type: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return notifications.map((n) => ({
    id: n.id,
    message: n.message,
    type: n.type,
    createdAt: n.createdAt.toISOString(),
  }));
}
