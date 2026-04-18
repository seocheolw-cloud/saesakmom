"use client";

import Link from "next/link";
import { deleteComparisonCommentAdmin } from "@/lib/actions/admin-compare";

type Comment = { id: string; content: string; authorNickname: string; createdAt: string; comparisonId: string; comparisonLabel: string };

export function AdminCompareCommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <div className="p-8 text-center text-sm text-muted">댓글이 없습니다.</div>;
  }

  return (
    <div className="divide-y divide-border">
      {comments.map((c) => (
        <div key={c.id} className="px-4 py-3 hover:bg-[#f8faff] transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">{c.authorNickname}</span>
                <span className="text-[11px] text-muted">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <p className="text-sm text-foreground mb-1">{c.content}</p>
              <Link href={`/admin/compare/${c.comparisonId}`} className="text-[11px] text-primary hover:underline">
                {c.comparisonLabel}
              </Link>
            </div>
            <form
              action={deleteComparisonCommentAdmin.bind(null, c.id, c.comparisonId)}
              onSubmit={(e) => { if (!confirm("댓글을 삭제하시겠습니까?")) e.preventDefault(); }}
            >
              <button type="submit" className="text-xs text-red-500 hover:opacity-75 shrink-0 px-2 py-1">삭제</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
