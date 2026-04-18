import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* 관리자 헤더 */}
      <header className="sticky top-0 z-50 bg-[#1e293b] text-white">
        <div className="flex items-center h-14 px-4 gap-4">
          <a href="/admin" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span className="text-sm font-bold hidden sm:block">새싹맘 관리자</span>
          </a>
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <a href="/" className="text-[12px] text-white/50 hover:text-white/80 transition-colors hidden sm:block">사이트 보기</a>
            <span className="text-[12px] text-white/50 hidden md:block">{session.user.nickname}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/admin-login" }); }}>
              <button type="submit" className="h-8 px-3 rounded-md text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">로그아웃</button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <AdminNav />

        {/* 본문 */}
        <main className="flex-1 min-w-0 p-6">
          <div className="max-w-[1000px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
