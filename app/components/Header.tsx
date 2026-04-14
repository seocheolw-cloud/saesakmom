import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/app/components/AuthButton";
import { NotificationBell } from "@/app/components/NotificationBell";

export async function Header() {
  const session = await auth();

  let unreadCount = 0;
  if (session?.user) {
    unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#d4d4d4]">
      <div className="max-w-[1100px] mx-auto flex items-center h-[52px] md:h-16 px-4">
        <Link href="/" className="text-xl font-bold text-primary shrink-0">
          새싹맘
        </Link>
        <nav className="flex items-center ml-6 md:ml-10 gap-1 md:gap-2 h-full">
          {[
            { name: "홈", href: "/" },
            { name: "커뮤니티", href: "/community" },
            { name: "육아용품", href: "/products" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="h-full px-3 md:px-4 text-sm md:text-[16px] font-semibold inline-flex items-center text-[#5F6B7C] hover:text-[#18202A] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-[260px] h-10 rounded-full border border-[#d4d4d4] pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-[#bbc0c5] transition-colors"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {session.user.nickname}님
              </span>
              <NotificationBell unreadCount={unreadCount} />
              <Link
                href="/mypage"
                className="h-10 px-4 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                마이페이지
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="h-10 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
