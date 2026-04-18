"use client";

import { adminDeleteComment } from "@/lib/actions/admin-community";

export function CommentDeleteButton({ commentId }: { commentId: string }) {
  return (
    <form
      action={adminDeleteComment.bind(null, commentId)}
      onSubmit={(e) => { if (!confirm("이 댓글을 삭제하시겠습니까?")) e.preventDefault(); }}
    >
      <button type="submit" className="text-xs text-red-500 hover:opacity-75 px-2 py-1">삭제</button>
    </form>
  );
}
