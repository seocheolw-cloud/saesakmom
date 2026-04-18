"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { createProductComment, deleteProductComment, editProductComment } from "@/lib/actions/product-comment";
import type { AdminFormState } from "@/lib/validations/product";

type Reply = { id: string; content: string; createdAt: Date; updatedAt: Date | null; author: { id: string; nickname: string } };
type Comment = { id: string; content: string; createdAt: Date; updatedAt: Date | null; author: { id: string; nickname: string }; replies: Reply[] };

function CommentItem({ c, productId, currentUserId, isReply }: { c: Reply; productId: string; currentUserId?: string; isReply?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(c.content);
  const [saving, startSave] = useTransition();
  const isMine = currentUserId === c.author.id;

  return (
    <div className={`px-6 py-3.5 ${isMine ? "bg-primary/5" : ""} ${isReply ? "pl-12" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{c.author.nickname}</span>
          <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
          {c.updatedAt && <span className="text-[10px] text-muted">(수정됨)</span>}
        </div>
        {isMine && !editing && (
          <div className="flex items-center gap-2">
            <span onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-primary transition-colors cursor-pointer">수정</span>
            <form className="inline" action={deleteProductComment.bind(null, c.id, productId)} onSubmit={(e) => { if (!confirm("삭제하시겠습니까?")) e.preventDefault(); }}>
              <span onClick={(e) => { (e.target as HTMLElement).closest("form")?.requestSubmit(); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer">삭제</span>
            </form>
          </div>
        )}
        {currentUserId && !isMine && !editing && (
          <span onClick={async () => {
            const reason = prompt("신고 사유를 입력해주세요");
            if (!reason) return;
            const { reportProductComment } = await import("@/lib/actions/report");
            const res = await reportProductComment(c.id, productId, reason);
            if (res.success) alert("신고가 접수되었습니다.");
            else if (res.message) alert(res.message);
          }} className="text-xs text-gray-400 hover:text-gray-500 transition-colors cursor-pointer">신고</span>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-primary rounded-lg resize-none focus:outline-none" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setEditing(false); setEditContent(c.content); }} className="h-7 px-3 rounded text-xs text-muted border border-[#d4d4d4]">취소</button>
            <button type="button" disabled={saving || !editContent.trim()} onClick={() => { startSave(async () => { await editProductComment(c.id, productId, editContent); setEditing(false); }); }} className="h-7 px-3 rounded text-xs font-semibold text-white bg-primary disabled:opacity-50">저장</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
      )}
    </div>
  );
}

export function ProductComments({ productId, comments, currentUserId }: { productId: string; comments: Comment[]; currentUserId?: string }) {
  const boundAction = createProductComment.bind(null, productId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(boundAction, undefined);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyState, replyAction, replyPending] = useActionState<AdminFormState, FormData>(boundAction, undefined);

  return (
    <div className="mt-4 bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4]">
        <h2 className="text-sm font-semibold text-foreground">댓글 {comments.reduce((n, c) => n + 1 + c.replies.length, 0)}개</h2>
      </div>
      {currentUserId ? (
        <div className="px-6 py-4 border-b border-[#d4d4d4]">
          <form action={formAction} key={state?.message === "" ? "reset-" + Date.now() : "form"}>
            <textarea name="content" rows={2} placeholder="댓글을 입력하세요" className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary" required />
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
        <div className="p-8 text-center text-sm text-muted">첫 번째 댓글을 작성해보세요.</div>
      ) : (
        <div className="divide-y divide-[#d4d4d4]">
          {comments.map((c) => (
            <div key={c.id}>
              <CommentItem c={c} productId={productId} currentUserId={currentUserId} />
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
                <CommentItem key={r.id} c={r} productId={productId} currentUserId={currentUserId} isReply />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
