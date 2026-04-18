"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { name: "홈", href: "/" },
  { name: "커뮤니티", href: "/community" },
  { name: "육아용품", href: "/products" },
  { name: "비교", href: "/compare" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 md:gap-3 h-full overflow-x-auto scrollbar-hide">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`h-full px-3 md:px-4 text-[13px] md:text-[16px] inline-flex items-center border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              isActive
                ? "text-primary font-bold border-primary"
                : "text-[#5F6B7C] font-semibold border-transparent hover:text-[#18202A]"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
