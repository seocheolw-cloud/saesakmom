"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
        로그인
      </h1>

      {registered && (
        <p className="mb-4 text-center text-sm text-primary bg-blue-50 rounded-lg py-2">
          회원가입이 완료되었습니다. 로그인해주세요.
        </p>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold mb-1.5 text-foreground"
          >
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="이메일을 입력하세요"
          />
          {state?.errors?.email && (
            <p className="text-xs text-error mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-1.5 text-foreground"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="비밀번호를 입력하세요"
          />
          {state?.errors?.password && (
            <p className="text-xs text-error mt-1">
              {state.errors.password[0]}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {state?.message && (
        <p className="mt-4 text-center text-sm text-error">{state.message}</p>
      )}

      <div className="mt-4">
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-lg bg-kakao text-sm font-semibold text-[#3c1e1e] cursor-not-allowed opacity-60"
        >
          카카오로 로그인 (준비 중)
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        계정이 없으신가요?{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          회원가입
        </Link>
      </p>
    </>
  );
}
