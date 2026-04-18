"use client";

import Link from "next/link";
import { useState, useActionState, useRef, useEffect } from "react";
import { register } from "@/lib/actions/auth";
import { checkEmailDuplicate, checkNicknameDuplicate } from "@/lib/actions/check-duplicate";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [emailDup, setEmailDup] = useState<boolean | null>(null);
  const [nicknameDup, setNicknameDup] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const emailTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nicknameTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailDup(null);
    clearTimeout(emailTimer.current);
    if (value.length >= 3 && value.includes("@")) {
      emailTimer.current = setTimeout(async () => {
        setEmailChecking(true);
        const dup = await checkEmailDuplicate(value);
        setEmailDup(dup);
        setEmailChecking(false);
      }, 500);
    }
  }

  function handleNicknameChange(value: string) {
    setNickname(value);
    setNicknameDup(null);
    clearTimeout(nicknameTimer.current);
    if (value.length >= 2) {
      nicknameTimer.current = setTimeout(async () => {
        setNicknameChecking(true);
        const dup = await checkNicknameDuplicate(value);
        setNicknameDup(dup);
        setNicknameChecking(false);
      }, 500);
    }
  }

  useEffect(() => { return () => { clearTimeout(emailTimer.current); clearTimeout(nicknameTimer.current); }; }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-foreground">회원가입</h1>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-foreground">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`w-full h-11 rounded-lg border px-3 text-sm text-foreground bg-white focus:outline-none focus:ring-1 transition-colors ${
              emailDup === true ? "border-red-400 focus:border-red-400 focus:ring-red-200" :
              emailDup === false ? "border-green-400 focus:border-green-400 focus:ring-green-200" :
              "border-border focus:border-primary focus:ring-primary"
            }`}
            placeholder="이메일을 입력하세요"
          />
          {emailChecking && <p className="text-xs text-muted mt-1">확인 중...</p>}
          {emailDup === true && <p className="text-xs text-red-500 mt-1">이미 사용 중인 이메일입니다</p>}
          {emailDup === false && <p className="text-xs text-green-600 mt-1">사용 가능한 이메일입니다</p>}
          {state?.errors?.email && <p className="text-xs text-error mt-1">{state.errors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-semibold mb-1.5 text-foreground">닉네임</label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            className={`w-full h-11 rounded-lg border px-3 text-sm text-foreground bg-white focus:outline-none focus:ring-1 transition-colors ${
              nicknameDup === true ? "border-red-400 focus:border-red-400 focus:ring-red-200" :
              nicknameDup === false ? "border-green-400 focus:border-green-400 focus:ring-green-200" :
              "border-border focus:border-primary focus:ring-primary"
            }`}
            placeholder="닉네임을 입력하세요 (2~10자)"
          />
          {nicknameChecking && <p className="text-xs text-muted mt-1">확인 중...</p>}
          {nicknameDup === true && <p className="text-xs text-red-500 mt-1">이미 사용 중인 닉네임입니다</p>}
          {nicknameDup === false && <p className="text-xs text-green-600 mt-1">사용 가능한 닉네임입니다</p>}
          {state?.errors?.nickname && <p className="text-xs text-error mt-1">{state.errors.nickname[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-1.5 text-foreground">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="비밀번호를 입력하세요 (8자 이상)"
          />
          {state?.errors?.password && <p className="text-xs text-error mt-1">{state.errors.password[0]}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1.5 text-foreground">비밀번호 확인</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="비밀번호를 다시 입력하세요"
          />
          {state?.errors?.confirmPassword && <p className="text-xs text-error mt-1">{state.errors.confirmPassword[0]}</p>}
        </div>

        <button
          type="submit"
          disabled={pending || emailDup === true || nicknameDup === true}
          className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "처리 중..." : "회원가입"}
        </button>
      </form>

      {state?.message && <p className="mt-4 text-center text-sm text-error">{state.message}</p>}

      <p className="mt-6 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">로그인</Link>
      </p>
    </>
  );
}
