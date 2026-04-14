"use client";

import { deletePost } from "@/lib/actions/post";

export function DeleteButton({ postId }: { postId: string }) {
  const handleDelete = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deletePost(postId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="h-9 px-4 rounded-lg border border-error text-xs font-semibold text-error hover:bg-red-50 transition-colors cursor-pointer"
    >
      삭제
    </button>
  );
}
