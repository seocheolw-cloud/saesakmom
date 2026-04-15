"use client";

import { togglePostReaction } from "@/lib/actions/like";
import { useTransition } from "react";

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
            ? "border-red-300 bg-red-50 text-red-500"
            : "border-[#d4d4d4] text-[#5F6B7C] hover:bg-gray-50"
        }`}
      >
        <svg className="w-4 h-4" fill={userReaction === "LIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M4 15v7" />
        </svg>
        {likeCount}
      </button>
      <button
        onClick={() => startTransition(() => togglePostReaction(postId, "DISLIKE"))}
        disabled={pending}
        className={`inline-flex items-center gap-1 h-9 px-3.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          userReaction === "DISLIKE"
            ? "border-blue-300 bg-blue-50 text-blue-500"
            : "border-[#d4d4d4] text-[#5F6B7C] hover:bg-gray-50"
        }`}
      >
        <svg className="w-4 h-4" fill={userReaction === "DISLIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z M20 2v7" />
        </svg>
        {dislikeCount}
      </button>
    </div>
  );
}
