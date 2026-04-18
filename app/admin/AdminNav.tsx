"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_GROUPS = [
  {
    name: "대시보드",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    href: "/admin",
  },
  {
    name: "상품 관리",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    children: [
      { name: "상품 목록", href: "/admin/products" },
      { name: "종류 관리", href: "/admin/products/types" },
      { name: "브랜드 관리", href: "/admin/products/brands" },
    ],
  },
  {
    name: "커뮤니티 관리",
    icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    children: [
      { name: "게시글 관리", href: "/admin/community/posts" },
      { name: "댓글 관리", href: "/admin/community/comments" },
    ],
  },
  {
    name: "비교 관리",
    icon: "M8 9l4-4 4 4m0 6l-4 4-4-4",
    children: [
      { name: "비교 목록", href: "/admin/compare" },
      { name: "댓글 관리", href: "/admin/compare/comments" },
      { name: "투표 현황", href: "/admin/compare/votes" },
    ],
  },
  {
    name: "회원 관리",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    href: "/admin/users",
  },
  {
    name: "신고 관리",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    href: "/admin/reports",
  },
  {
    name: "로그분석",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    href: "/admin/analytics",
  },
  {
    name: "설정",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    href: "/admin/settings",
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const g of NAV_GROUPS) {
      if (g.children?.some((c) => pathname.startsWith(c.href))) s.add(g.name);
    }
    return s;
  });

  function toggleGroup(name: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  return (
    <>
      {/* 모바일 토글 */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="md:hidden fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-[#1e293b] text-white shadow-lg flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
      </button>

      {/* 오버레이 */}
      {collapsed && <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setCollapsed(false)} />}

      <aside className={`${collapsed ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:sticky top-14 z-40 w-56 h-[calc(100vh-56px)] bg-white border-r border-[#d4d4d4] overflow-y-auto transition-transform shrink-0`}>
        <nav className="py-3">
          {NAV_GROUPS.map((group) => {
            if (group.href) {
              const isActive = pathname === group.href;
              return (
                <Link
                  key={group.name}
                  href={group.href}
                  onClick={() => setCollapsed(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive ? "text-primary bg-blue-50 border-r-2 border-primary" : "text-[#5F6B7C] hover:text-foreground hover:bg-[#f8faff]"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.icon} /></svg>
                  {group.name}
                </Link>
              );
            }

            const isOpen = openGroups.has(group.name);
            const hasActive = group.children?.some((c) => pathname.startsWith(c.href));

            return (
              <div key={group.name}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    hasActive ? "text-primary" : "text-[#5F6B7C] hover:text-foreground hover:bg-[#f8faff]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.icon} /></svg>
                    {group.name}
                  </span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isOpen && group.children && (
                  <div className="pb-1">
                    {group.children.map((child) => {
                      const siblings = group.children!.filter((s) => s.href !== child.href);
                      const isShadowed = siblings.some((s) => s.href.startsWith(child.href + "/"));
                      const isActive = isShadowed ? pathname === child.href : (pathname === child.href || pathname.startsWith(child.href + "/"));
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setCollapsed(false)}
                          className={`flex items-center pl-11 pr-4 py-2 text-[12px] font-medium transition-colors ${
                            isActive ? "text-primary bg-blue-50 border-r-2 border-primary" : "text-[#5F6B7C] hover:text-foreground hover:bg-[#f8faff]"
                          }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
