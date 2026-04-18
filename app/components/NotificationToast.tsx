"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getNewNotifications } from "@/lib/actions/notification-poll";

type Toast = { id: string; message: string; type: string; createdAt: string };

const TYPE_ICONS: Record<string, string> = {
  LIKE: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  COMMENT: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  REPLY: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
};

export function NotificationToast({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastChecked = useRef(new Date().toISOString());
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      startTransition(async () => {
        const newOnes = await getNewNotifications(lastChecked.current);
        if (newOnes.length > 0) {
          lastChecked.current = newOnes[0].createdAt;
          setToasts((prev) => {
            const ids = new Set(prev.map((t) => t.id));
            const fresh = newOnes.filter((n) => !ids.has(n.id));
            return [...fresh, ...prev].slice(0, 5);
          });
        }
      });
    }, 10_000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[340px] w-full pointer-events-none">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white rounded-xl border border-[#d4d4d4] shadow-lg p-3.5 flex items-start gap-3 animate-slide-up cursor-pointer hover:bg-[#f8faff] transition-colors"
          onClick={() => { dismiss(toast.id); router.push("/notifications"); }}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICONS[toast.type] || TYPE_ICONS.COMMENT} />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground leading-snug line-clamp-2">{toast.message}</p>
            <p className="text-[11px] text-muted mt-1">방금 전</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }}
            className="text-muted hover:text-foreground shrink-0 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
