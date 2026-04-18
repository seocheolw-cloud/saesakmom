"use client";

import { adminDeletePost, adminRestorePost } from "@/lib/actions/admin-community";

export function PostActions({ postId, status }: { postId: string; status: string }) {
  if (status === "ACTIVE") {
    return (
      <form action={adminDeletePost.bind(null, postId)} onSubmit={(e) => { if (!confirm("이 게시글을 삭제하시겠습니까?")) e.preventDefault(); }}>
        <button type="submit" className="text-xs text-red-500 hover:opacity-75">삭제</button>
      </form>
    );
  }
  return (
    <form action={adminRestorePost.bind(null, postId)}>
      <button type="submit" className="text-xs text-green-600 hover:opacity-75">복원</button>
    </form>
  );
}
