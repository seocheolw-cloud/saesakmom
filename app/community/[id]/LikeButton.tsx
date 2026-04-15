"use client";

import { togglePostReaction } from "@/lib/actions/like";
import { useTransition } from "react";

function ThumbUpIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" fill={active ? "currentColor" : "none"} />
      {/* 손목 파란 띠 */}
      <line x1="3" y1="15.5" x2="7" y2="15.5" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M4 15v7" />
    </svg>
  );
}

function ThumbDownIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" fill={active ? "currentColor" : "none"} />
      {/* 손목 빨간 띠 */}
      <line x1="17" y1="8.5" x2="21" y2="8.5" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M20 2v7" />
    </svg>
  );
}

export function LikeButton({
  postId,
  userReaction,
  likeCount,
  dislikeCount,
}: {
  postId: string;
  userReaction: "LIKE" | "DISLIKE" | null;
  likeCount: number;
  dislikeCount: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => startTransition(() => togglePostReaction(postId, "LIKE"))}
        disabled={pending}
        className={`inline-flex items-center gap-1 h-9 px-3.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          userReaction === "LIKE"
            ? "border-blue-300 bg-blue-50 text-blue-500"
            : "border-[#d4d4d4] text-[#5F6B7C] hover:bg-gray-50"
        }`}
      >
        <ThumbUpIcon active={userReaction === "LIKE"} />
        {likeCount}
      </button>
      <button
        onClick={() => startTransition(() => togglePostReaction(postId, "DISLIKE"))}
        disabled={pending}
        className={`inline-flex items-center gap-1 h-9 px-3.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          userReaction === "DISLIKE"
            ? "border-red-300 bg-red-50 text-red-500"
            : "border-[#d4d4d4] text-[#5F6B7C] hover:bg-gray-50"
        }`}
      >
        <ThumbDownIcon active={userReaction === "DISLIKE"} />
        {dislikeCount}
      </button>
    </div>
  );
}
