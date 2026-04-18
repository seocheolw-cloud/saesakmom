"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin-login");
  return session;
}

export async function changeUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED"): Promise<void> {
  const session = await requireAdmin();
  if (userId === session.user.id) return;

  const suspendedUntil = status === "SUSPENDED" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

  await prisma.user.update({
    where: { id: userId },
    data: { status, suspendedUntil },
  });

  if (status === "SUSPENDED") {
    const until = suspendedUntil!.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
    await prisma.notification.create({
      data: {
        userId,
        type: "COMMENT",
        message: `회원님의 계정이 ${until}까지 댓글 작성이 정지되었습니다.`,
      },
    });
  } else if (status === "BANNED") {
    await prisma.notification.create({
      data: {
        userId,
        type: "COMMENT",
        message: "회원님의 계정이 차단되었습니다. 로그인이 제한됩니다.",
      },
    });
  } else if (status === "ACTIVE") {
    await prisma.notification.create({
      data: {
        userId,
        type: "COMMENT",
        message: "회원님의 계정이 정상 복구되었습니다.",
      },
    });
  }

  revalidatePath("/admin/users");
}
