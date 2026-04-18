import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const session = await auth();
  if (session?.user?.id === userId) return;

  await prisma.notification.create({
    data: { userId, type, message, postId, commentId },
  });
}
