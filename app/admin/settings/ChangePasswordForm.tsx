"use client";

import { useActionState, useRef, useEffect } from "react";
import { changeAdminPassword } from "@/lib/actions/admin-auth";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeAdminPassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden max-w-[480px]">
      <div className="px-6 py-4 border-b border-border bg-[#f8fafc]">
        <h3 className="text-sm font-bold text-foreground">비밀번호 변경</h3>
      </div>
      <form ref={formRef} action={action} className="p-6 space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-xs font-semibold text-foreground mb-1.5">현재 비밀번호</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            placeholder="현재 비밀번호 입력"
            className="w-full h-10 rounded-lg border border-[#d4d4d4] px-3 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {state?.errors?.currentPassword && <p className="text-xs text-red-500 mt-1">{state.errors.currentPassword[0]}</p>}
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-xs font-semibold text-foreground mb-1.5">새 비밀번호</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="8자 이상 입력"
            className="w-full h-10 rounded-lg border border-[#d4d4d4] px-3 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {state?.errors?.newPassword && <p className="text-xs text-red-500 mt-1">{state.errors.newPassword[0]}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground mb-1.5">새 비밀번호 확인</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="새 비밀번호 다시 입력"
            className="w-full h-10 rounded-lg border border-[#d4d4d4] px-3 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {state?.errors?.confirmPassword && <p className="text-xs text-red-500 mt-1">{state.errors.confirmPassword[0]}</p>}
        </div>

        {state?.message && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${state.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            {state.success ? (
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            )}
            <p className={`text-xs ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-10 px-6 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {pending && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {pending ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
