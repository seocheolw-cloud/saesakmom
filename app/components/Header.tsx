import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/app/components/AuthButton";
import { NotificationBell } from "@/app/components/NotificationBell";
import { HeaderNav } from "@/app/components/HeaderNav";
import { NotificationToast } from "@/app/components/NotificationToast";

export async function Header() {
  const session = await auth();

  let unreadCount = 0;
  if (session?.user) {
    unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
  }

  return (
    <>
    <header className="sticky top-0 z-50 bg-white border-b border-[#d4d4d4]">
      {/* 상단: 로고 + 검색 + 로그인 */}
      <div className="max-w-[1100px] mx-auto flex items-center h-[48px] md:h-14 px-4 gap-3">
        <Link href="/" className="text-lg md:text-xl font-bold text-primary shrink-0">
          새싹맘
        </Link>

        {/* 데스크톱 검색 */}
        <form action="/search" className="hidden md:block relative ml-auto">
          <input
            type="text"
            name="q"
            placeholder="검색어를 입력하세요"
            className="w-[240px] lg:w-[280px] h-9 rounded-full border border-[#d4d4d4] pl-9 pr-4 text-sm bg-white focus:outline-none focus:border-primary transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        {/* 로그인/유저 영역 */}
        <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
          {session?.user ? (
            <>
              {/* 데스크톱 */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{session.user.nickname}님</span>
                <NotificationBell unreadCount={unreadCount} />
                <Link
                  href="/mypage"
                  className="h-9 px-3.5 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  마이페이지
                </Link>
                <LogoutButton />
              </div>
              {/* 모바일 */}
              <div className="flex md:hidden items-center gap-1.5">
                <NotificationBell unreadCount={unreadCount} />
                <Link
                  href="/mypage"
                  className="h-8 px-2 rounded-lg border border-[#d4d4d4] text-[11px] font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  MY
                </Link>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="h-9 px-4 md:px-5 rounded-lg bg-primary text-[13px] md:text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center shrink-0"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* 하단: 네비게이션 */}
      <div className="max-w-[1100px] mx-auto px-4 h-[40px] md:h-[44px] flex items-center">
        <HeaderNav />
      </div>
    </header>
    <NotificationToast isLoggedIn={!!session?.user} />
    </>
  );
}
