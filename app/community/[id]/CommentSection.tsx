"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { createComment, deleteComment, type CommentFormState } from "@/lib/actions/comment";

type Author = { id: string; nickname: string };

type Reply = {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  author: Author;
};

type Comment = {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  author: Author;
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
                <button
                  type="submit"
                  className="text-xs text-[#fb5957] hover:opacity-75 transition-opacity"
                >
                  삭제
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>

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
          {comment.replies.map((reply) => (
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
            </div>
          ))}
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
