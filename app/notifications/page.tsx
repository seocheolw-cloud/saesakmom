import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
import { NotificationList } from "./NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 페이지 방문 시 모두 읽음 처리
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">알림</h1>
        <NotificationList notifications={notifications} />
      </main>
    </div>
  );
}
