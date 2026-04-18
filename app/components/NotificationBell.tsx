"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getUnreadCount } from "@/lib/actions/notification-poll";

export function NotificationBell({ unreadCount: initialCount }: { unreadCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        const c = await getUnreadCount();
        setCount(c);
      });
    }, 15_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  return (
    <Link
      href="/notifications"
      className="relative w-8 h-8 md:w-9 md:h-9 rounded-lg border border-[#d4d4d4] hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
    >
      <svg
        className={`w-4 h-4 md:w-[18px] md:h-[18px] ${count > 0 ? "text-primary" : "text-[#5F6B7C]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] bg-[#fb5957] text-white text-[9px] md:text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
