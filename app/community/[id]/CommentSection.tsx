"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { createComment, deleteComment, type CommentFormState } from "@/lib/actions/comment";
import { toggleCommentReaction } from "@/lib/actions/like";

type Author = { id: string; nickname: string };

type Reply = {
  id: string;
  content: string;
  status: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  author: Author;
  likes?: { type: string }[];
};

type Comment = {
  id: string;
  content: string;
  status: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  author: Author;
  likes?: { type: string }[];
  replies: Reply[];
};

function CommentForm({
  postId,
  parentId,
  onSuccess,
  placeholder,
  compact,
}: {
  postId: string;
  parentId: string | null;
  onSuccess?: () => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const boundAction = createComment.bind(null, postId, parentId);
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(
    boundAction,
    undefined
  );

  useEffect(() => {
    if (state?.message === "") {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} key={state?.message === "" ? "reset-" + Date.now() : "form"}>
      <textarea
        name="content"
        rows={compact ? 2 : 3}
        placeholder={placeholder ?? "댓글을 입력하세요"}
        className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary"
        required
      />
      {state?.errors?.content && (
        <p className="text-xs text-[#fb5957] mt-1">{state.errors.content[0]}</p>
      )}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {pending ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}

function DeleteCommentButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-[#fb5957] hover:opacity-75 transition-opacity disabled:opacity-40"
    >
      {pending ? "삭제 중..." : "삭제"}
    </button>
  );
}

function SmallThumbUp({ active }: { active: boolean }) {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2.5" y="13" width="5" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <rect x="2.5" y="14.5" width="5" height="3" rx="0.5" fill="#3b82f6" />
    </svg>
  );
}

function SmallThumbDown({ active }: { active: boolean }) {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
      <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16.5" y="2" width="5" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <rect x="16.5" y="5.5" width="5" height="3" rx="0.5" fill="#ef4444" />
    </svg>
  );
}

function ReactionButtons({
  commentId,
  postId,
  likeCount,
  dislikeCount,
  userReaction,
}: {
  commentId: string;
  postId: string;
  likeCount: number;
  dislikeCount: number;
  userReaction: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <button
        onClick={() => startTransition(() => toggleCommentReaction(commentId, postId, "LIKE"))}
        disabled={pending}
        className={`inline-flex items-center gap-1 h-6 px-2 rounded border text-[11px] transition-colors cursor-pointer disabled:opacity-50 ${
          userReaction === "LIKE"
            ? "border-blue-300 bg-blue-50 text-blue-500"
            : "border-[#d4d4d4] text-[#94969b] hover:bg-gray-50"
        }`}
      >
        <SmallThumbUp active={userReaction === "LIKE"} /> {Math.max(0, likeCount) > 0 && Math.max(0, likeCount)}
      </button>
      <button
        onClick={() => startTransition(() => toggleCommentReaction(commentId, postId, "DISLIKE"))}
        disabled={pending}
        className={`inline-flex items-center gap-1 h-6 px-2 rounded border text-[11px] transition-colors cursor-pointer disabled:opacity-50 ${
          userReaction === "DISLIKE"
            ? "border-red-300 bg-red-50 text-red-500"
            : "border-[#d4d4d4] text-[#94969b] hover:bg-gray-50"
        }`}
      >
        <SmallThumbDown active={userReaction === "DISLIKE"} /> {Math.max(0, dislikeCount) > 0 && Math.max(0, dislikeCount)}
      </button>
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  currentUserId,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const userReaction = comment.likes?.[0]?.type ?? null;

  return (
    <div className="border-b border-[#d4d4d4] last:border-b-0">
      {/* Main comment */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Link
              href={`/user/${comment.author.id}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {comment.author.nickname}
            </Link>
            <span className="text-xs text-[#94969b]">
              {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentUserId && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="text-xs text-[#94969b] hover:text-primary transition-colors"
              >
                답글
              </button>
            )}
            {currentUserId === comment.author.id && (
              <form action={deleteComment.bind(null, comment.id, postId)}>
                <DeleteCommentButton />
              </form>
            )}
          </div>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
        <ReactionButtons
          commentId={comment.id}
          postId={postId}
          likeCount={comment.likeCount}
          dislikeCount={comment.dislikeCount}
          userReaction={userReaction}
        />

        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              placeholder="답글을 입력하세요"
              compact
              onSuccess={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-8 border-l border-[#d4d4d4]">
          {comment.replies.map((reply) => {
            const replyReaction = reply.likes?.[0]?.type ?? null;
            return (
              <div key={reply.id} className="p-4 border-b border-[#d4d4d4] last:border-b-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/user/${reply.author.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {reply.author.nickname}
                    </Link>
                    <span className="text-xs text-[#94969b]">
                      {new Date(reply.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {currentUserId === reply.author.id && (
                    <form action={deleteComment.bind(null, reply.id, postId)}>
                      <button
                        type="submit"
                        className="text-xs text-[#fb5957] hover:opacity-75 transition-opacity"
                      >
                        삭제
                      </button>
                    </form>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                <ReactionButtons
                  commentId={reply.id}
                  postId={postId}
                  likeCount={reply.likeCount}
                  dislikeCount={reply.dislikeCount}
                  userReaction={replyReaction}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  return (
    <div className="mt-4 bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4]">
        <h2 className="text-sm font-semibold text-foreground">
          댓글 {comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)}개
        </h2>
      </div>

      {/* Comment form */}
      {currentUserId ? (
        <div className="px-6 py-4 border-b border-[#d4d4d4]">
          <CommentForm postId={postId} parentId={null} />
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-[#d4d4d4] text-sm text-[#94969b]">
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
          {" 후 댓글을 작성할 수 있습니다."}
        </div>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="p-8 text-center text-sm text-[#94969b]">
          첫 번째 댓글을 작성해보세요.
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
