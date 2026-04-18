"use client";

import { deleteComparison, deleteComparisonCommentAdmin } from "@/lib/actions/admin-compare";

type Comment = { id: string; content: string; authorNickname: string; createdAt: string };

export function AdminCompareDetail({ comparisonId, comments }: { comparisonId: string; comments: Comment[] }) {

  return (
    <div className="space-y-4">
      {/* 댓글 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-[#f8fafc] flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">댓글 ({comments.length})</h3>
        </div>
        {comments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">댓글이 없습니다.</div>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-[#f8faff] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">{c.authorNickname}</span>
                    <span className="text-[11px] text-muted">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <p className="text-sm text-foreground">{c.content}</p>
                </div>
                <form
                  action={deleteComparisonCommentAdmin.bind(null, c.id, comparisonId)}
                  onSubmit={(e) => { if (!confirm("댓글을 삭제하시겠습니까?")) e.preventDefault(); }}
                >
                  <button type="submit" className="text-xs text-red-500 hover:opacity-75 shrink-0 px-2 py-1">삭제</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 비교 삭제 */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-red-100 bg-red-50">
          <h3 className="text-sm font-bold text-red-700">위험 영역</h3>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">이 비교를 삭제합니다</p>
            <p className="text-xs text-muted mt-0.5">관련된 투표와 댓글이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <form
            action={deleteComparison.bind(null, comparisonId)}
            onSubmit={(e) => { if (!confirm("정말 삭제하시겠습니까? 모든 투표와 댓글이 삭제됩니다.")) e.preventDefault(); }}
          >
            <button type="submit" className="h-9 px-4 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors shrink-0">삭제</button>
          </form>
        </div>
      </div>
    </div>
  );
}
