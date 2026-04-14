"use client";

import { useActionState, useState } from "react";
import { updateNickname } from "@/lib/actions/user";

export function NicknameForm({ currentNickname }: { currentNickname: string }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateNickname, undefined);

  if (state?.success) {
    setEditing(false);
  }

  return (
    <div className="flex items-start">
      <span className="w-24 text-sm text-muted shrink-0 mt-2">닉네임</span>
      {editing ? (
        <form action={action} className="flex-1">
          <div className="flex items-center gap-2">
            <input
              name="nickname"
              type="text"
              defaultValue={currentNickname}
              className="h-9 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-40"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-9 px-3 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              {pending ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-9 px-3 rounded-lg border border-[#d4d4d4] text-xs font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
          {state?.errors?.nickname && (
            <p className="text-xs text-error mt-1">
              {state.errors.nickname[0]}
            </p>
          )}
          {state?.message && !state.success && (
            <p className="text-xs text-error mt-1">{state.message}</p>
          )}
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{currentNickname}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline cursor-pointer"
          >
            변경
          </button>
          {state?.success && (
            <span className="text-xs text-green-600">{state.message}</span>
          )}
        </div>
      )}
    </div>
  );
}
