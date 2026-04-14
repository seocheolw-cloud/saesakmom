"use client";

import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  postId: string | null;
};

function getIcon(type: string) {
  switch (type) {
    case "LIKE":
      return (
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "COMMENT":
      return (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "REPLY":
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    default:
      return null;
  }
}

function timeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(date).toLocaleDateString("ko-KR");
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">
        알림이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      {notifications.map((notif, i) => {
        const inner = (
          <div
            className={`flex items-start gap-3 p-4 transition-colors ${
              !notif.isRead ? "bg-blue-50/50" : "hover:bg-[#f8faff]"
            } ${i < notifications.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(notif.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{notif.message}</p>
              <p className="text-xs text-muted mt-1">{timeAgo(notif.createdAt)}</p>
            </div>
            {!notif.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
            )}
          </div>
        );

        if (notif.postId) {
          return (
            <Link key={notif.id} href={`/community/${notif.postId}`} className="block">
              {inner}
            </Link>
          );
        }
        return <div key={notif.id}>{inner}</div>;
      })}
    </div>
  );
}
