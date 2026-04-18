"use client";

import { useActionState } from "react";
import { adminLogin } from "@/lib/actions/admin-auth";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">관리자 로그인</h1>
          <p className="text-xs text-muted mt-1">새싹맘 관리자 전용 페이지입니다</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#d4d4d4] p-8 shadow-sm">
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-semibold text-foreground mb-1.5">아이디</label>
              <input
                id="admin-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="관리자 아이디"
                className="w-full h-11 rounded-lg border border-[#d4d4d4] px-3 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              {state?.errors?.username && <p className="text-xs text-red-500 mt-1">{state.errors.username[0]}</p>}
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-foreground mb-1.5">비밀번호</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="비밀번호"
                className="w-full h-11 rounded-lg border border-[#d4d4d4] px-3 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              {state?.errors?.password && <p className="text-xs text-red-500 mt-1">{state.errors.password[0]}</p>}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {pending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              )}
              {pending ? "로그인 중..." : "관리자 로그인"}
            </button>
          </form>

          {state?.message && (
            <div className={`mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg border ${state.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <p className={`text-xs ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-4">
          <a href="/" className="hover:text-primary transition-colors">← 홈으로 돌아가기</a>
        </p>
      </div>
    </div>
  );
}
