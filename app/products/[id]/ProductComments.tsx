"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProductComment, deleteProductComment } from "@/lib/actions/product-comment";
import type { AdminFormState } from "@/lib/validations/product";

type Comment = { id: string; content: string; createdAt: Date; author: { id: string; nickname: string } };

export function ProductComments({ productId, comments, currentUserId }: { productId: string; comments: Comment[]; currentUserId?: string }) {
  const boundAction = createProductComment.bind(null, productId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(boundAction, undefined);

  return (
    <div className="mt-4 bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4]">
        <h2 className="text-sm font-semibold text-foreground">댓글 {comments.length}개</h2>
      </div>
      {currentUserId ? (
        <div className="px-6 py-4 border-b border-[#d4d4d4]">
          <form action={formAction} key={state?.message === "" ? "reset-" + Date.now() : "form"}>
            <textarea name="content" rows={2} placeholder="댓글을 입력하세요" className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary" required />
            {state?.errors?.content && <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>}
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
        <div>
          {comments.map((c, i) => (
            <div key={c.id} className={`px-6 py-4 ${i < comments.length - 1 ? "border-b border-[#d4d4d4]" : ""}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.author.nickname}</span>
                  <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
                {currentUserId === c.author.id && (
                  <form action={deleteProductComment.bind(null, c.id, productId)}>
                    <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                  </form>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
