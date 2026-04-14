"use client";

import { toggleLike } from "@/lib/actions/like";
import { useTransition } from "react";

export function LikeButton({
  postId,
  liked,
  likeCount,
}: {
  postId: string;
  liked: boolean;
  likeCount: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleLike(postId))}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
        liked
          ? "border-red-300 bg-red-50 text-red-500"
          : "border-[#d4d4d4] text-[#5F6B7C] hover:bg-gray-50"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      좋아요 {likeCount}
    </button>
  );
}
