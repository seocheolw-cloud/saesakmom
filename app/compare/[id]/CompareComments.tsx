"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { createComparisonComment, deleteComparisonComment, editComparisonComment } from "@/lib/actions/comparison";
import { reportComparisonComment } from "@/lib/actions/report";
import type { AdminFormState } from "@/lib/validations/product";

type Reply = { id: string; content: string; createdAt: Date; updatedAt: Date | null; authorId: string; author: { id: string; nickname: string } };
type Comment = { id: string; content: string; createdAt: Date; updatedAt: Date | null; authorId: string; author: { id: string; nickname: string }; replies: Reply[] };

function VoteBadge({ choice, productAName, productBName }: { choice?: "A" | "B"; productAName: string; productBName: string }) {
  if (!choice) return <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">미투표</span>;
  if (choice === "A") return <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{productAName} 투표</span>;
  return <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{productBName} 투표</span>;
}

function CommentItem({ c, comparisonId, currentUserId, voteMap, productAName, productBName, isReply }: {
  c: Reply; comparisonId: string; currentUserId?: string;
  voteMap: Record<string, "A" | "B">; productAName: string; productBName: string; isReply?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(c.content);
  const [saving, startSave] = useTransition();
  const isMine = currentUserId === c.author.id;

  return (
    <div className={`px-6 py-3.5 ${isMine ? "bg-primary/5" : ""} ${isReply ? "pl-12" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{c.author.nickname}</span>
          <VoteBadge choice={voteMap[c.author.id]} productAName={productAName} productBName={productBName} />
          <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
          {c.updatedAt && <span className="text-[10px] text-muted">(수정됨)</span>}
        </div>
        <div className="flex items-center gap-2">
          {currentUserId && !isMine && (
            <button type="button" onClick={async () => {
              const reason = prompt("신고 사유를 입력해주세요");
              if (!reason) return;
              const res = await reportComparisonComment(c.id, comparisonId, reason);
              if (res.success) alert("신고가 접수되었습니다.");
              else if (res.message) alert(res.message);
            }} className="text-xs text-gray-400 hover:text-gray-500 transition-colors">신고</button>
          )}
          {isMine && !editing && (
            <>
              <span onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-primary transition-colors cursor-pointer">수정</span>
              <form className="inline" action={deleteComparisonComment.bind(null, c.id, comparisonId)} onSubmit={(e) => { if (!confirm("삭제하시겠습니까?")) e.preventDefault(); }}>
                <span onClick={(e) => { (e.target as HTMLElement).closest("form")?.requestSubmit(); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer">삭제</span>
              </form>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-primary rounded-lg resize-none focus:outline-none" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setEditing(false); setEditContent(c.content); }} className="h-7 px-3 rounded text-xs text-muted border border-[#d4d4d4]">취소</button>
            <button type="button" disabled={saving || !editContent.trim()} onClick={() => { startSave(async () => { await editComparisonComment(c.id, comparisonId, editContent); setEditing(false); }); }} className="h-7 px-3 rounded text-xs font-semibold text-white bg-primary disabled:opacity-50">저장</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
      )}
    </div>
  );
}

export function CompareComments({ comparisonId, comments, currentUserId, voteMap, productAName, productBName }: {
  comparisonId: string; comments: Comment[]; currentUserId?: string;
  voteMap: Record<string, "A" | "B">; productAName: string; productBName: string;
}) {
  const boundAction = createComparisonComment.bind(null, comparisonId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(boundAction, undefined);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyState, replyAction, replyPending] = useActionState<AdminFormState, FormData>(boundAction, undefined);

  const totalCount = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <div className="mt-4 bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4]">
        <h2 className="text-sm font-semibold text-foreground">댓글 {totalCount}개</h2>
      </div>
      {currentUserId ? (
        <div className="px-6 py-4 border-b border-[#d4d4d4]">
          <form action={formAction} key={state?.message === "" ? "reset-" + Date.now() : "form"}>
            <textarea name="content" rows={2} placeholder="의견을 남겨주세요" className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary" required />
            {state?.errors?.content && <p className="text-xs text-red-500 mt-1">{state.errors.content[0]}</p>}
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={pending} className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50">{pending ? "등록 중..." : "등록"}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-[#d4d4d4] text-sm text-muted">
          <Link href="/login" className="text-primary hover:underline">로그인</Link>{" 후 댓글을 작성할 수 있습니다."}
        </div>
      )}
      {comments.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted">첫 번째 의견을 남겨보세요.</div>
      ) : (
        <div className="divide-y divide-[#d4d4d4]">
          {comments.map((c) => (
            <div key={c.id}>
              <CommentItem c={c} comparisonId={comparisonId} currentUserId={currentUserId} voteMap={voteMap} productAName={productAName} productBName={productBName} />
              {currentUserId && (
                <div className="px-6 pb-1">
                  <button type="button" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="text-[11px] text-gray-400 hover:text-primary transition-colors">답글</button>
                </div>
              )}
              {replyTo === c.id && (
                <div className="px-6 pl-12 pb-3">
                  <form action={replyAction} key={replyState?.message === "" ? "reply-reset-" + Date.now() : "reply"} onSubmit={() => { setTimeout(() => setReplyTo(null), 100); }}>
                    <input type="hidden" name="parentId" value={c.id} />
                    <textarea name="content" rows={2} placeholder={`${c.author.nickname}님에게 답글`} className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary" required autoFocus />
                    <div className="flex gap-2 justify-end mt-1.5">
                      <button type="button" onClick={() => setReplyTo(null)} className="h-7 px-3 rounded text-xs text-muted border border-[#d4d4d4]">취소</button>
                      <button type="submit" disabled={replyPending} className="h-7 px-3 rounded text-xs font-semibold text-white bg-primary disabled:opacity-50">{replyPending ? "..." : "답글"}</button>
                    </div>
                  </form>
                </div>
              )}
              {c.replies.map((r) => (
                <CommentItem key={r.id} c={r} comparisonId={comparisonId} currentUserId={currentUserId} voteMap={voteMap} productAName={productAName} productBName={productBName} isReply />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
