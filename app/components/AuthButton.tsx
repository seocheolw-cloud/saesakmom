"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="h-10 px-4 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors cursor-pointer"
    >
      로그아웃
    </button>
  );
}
