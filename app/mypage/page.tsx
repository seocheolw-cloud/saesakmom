import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NicknameForm } from "./NicknameForm";
import { TabContent } from "./TabContent";
import { Header } from "@/app/components/Header";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      nickname: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />

      {/* 메인 */}
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">마이페이지</h1>

        {/* 프로필 정보 */}
        <section className="bg-white rounded-xl border border-[#d4d4d4] p-6 mb-6">
          <h2 className="text-base font-bold text-foreground mb-5">내 정보</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-24 text-sm text-muted shrink-0">아이디</span>
              <span className="text-sm text-foreground">{user.id}</span>
            </div>

            <div className="flex items-center">
              <span className="w-24 text-sm text-muted shrink-0">이메일</span>
              <span className="text-sm text-foreground">{user.email}</span>
            </div>

            <NicknameForm currentNickname={user.nickname} />

            <div className="flex items-center">
              <span className="w-24 text-sm text-muted shrink-0">가입일</span>
              <span className="text-sm text-foreground">
                {user.createdAt.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* 활동 내역 탭 */}
        <TabContent
          postCount={user._count.posts}
          commentCount={user._count.comments}
        />
      </main>
    </div>
  );
}
