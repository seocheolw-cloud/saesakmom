# 인증 완성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이메일/비밀번호 회원가입과 로그인을 실제로 동작하게 만든다. 기존 NextAuth 설정과 UI 스텁 위에 Server Actions + useActionState를 연결한다.

**Architecture:** Zod로 서버 검증 → Server Action에서 bcrypt 해싱/DB 저장(회원가입) 또는 NextAuth signIn 호출(로그인) → useActionState로 에러 인라인 표시. 기존 `lib/auth.ts`의 Credentials provider authorize 콜백이 로그인 검증을 담당.

**Tech Stack:** Next.js 16, React 19 (useActionState), NextAuth v5 beta, Prisma 7, Zod, bcryptjs

---

## File Structure

```
lib/
  validations/auth.ts    # (Create) Zod 검증 스키마 — RegisterSchema, LoginSchema
  actions/auth.ts        # (Create) Server Actions — register, login
app/(auth)/
  login/page.tsx         # (Modify) 'use client' + useActionState 연결
  register/page.tsx      # (Modify) 'use client' + useActionState 연결
```

---

### Task 1: Zod 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: zod 패키지 설치**

Run: `npm install zod`
Expected: `added 1 package` 메시지

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add zod dependency"
```

---

### Task 2: Zod 검증 스키마

**Files:**
- Create: `lib/validations/auth.ts`

- [ ] **Step 1: 검증 스키마 및 타입 작성**

```typescript
// lib/validations/auth.ts
import { z } from "zod";

export const RegisterSchema = z
  .object({
    email: z.string().email("유효한 이메일을 입력하세요"),
    nickname: z
      .string()
      .min(2, "닉네임은 2~10자로 입력하세요")
      .max(10, "닉네임은 2~10자로 입력하세요"),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;
```

- [ ] **Step 2: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: `lib/validations/auth.ts` 관련 에러 없음

- [ ] **Step 3: Commit**

```bash
git add lib/validations/auth.ts
git commit -m "feat: add zod validation schemas for register and login"
```

---

### Task 3: Server Actions (register + login)

**Files:**
- Create: `lib/actions/auth.ts`

- [ ] **Step 1: register 및 login Server Action 작성**

```typescript
// lib/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { RegisterSchema, LoginSchema, type AuthFormState } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function register(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    nickname: formData.get("nickname"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, nickname, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    return { errors: { email: ["이미 사용 중인 이메일입니다"] } };
  }

  const existingNickname = await prisma.user.findUnique({
    where: { nickname },
  });
  if (existingNickname) {
    return { errors: { nickname: ["이미 사용 중인 닉네임입니다"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      nickname,
      password: hashedPassword,
    },
  });

  redirect("/login?registered=true");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "이메일 또는 비밀번호가 올바르지 않습니다" };
    }
    throw error;
  }
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: `lib/actions/auth.ts` 관련 에러 없음

- [ ] **Step 3: Commit**

```bash
git add lib/actions/auth.ts
git commit -m "feat: add register and login server actions"
```

---

### Task 4: 회원가입 페이지 — useActionState 연결

**Files:**
- Modify: `app/(auth)/register/page.tsx`

- [ ] **Step 1: 클라이언트 컴포넌트로 전환하고 useActionState 연결**

`app/(auth)/register/page.tsx` 전체를 아래로 교체:

```typescript
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
        회원가입
      </h1>

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
            htmlFor="nickname"
            className="block text-sm font-semibold mb-1.5 text-foreground"
          >
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="닉네임을 입력하세요"
          />
          {state?.errors?.nickname && (
            <p className="text-xs text-error mt-1">
              {state.errors.nickname[0]}
            </p>
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
            placeholder="비밀번호를 입력하세요 (8자 이상)"
          />
          {state?.errors?.password && (
            <p className="text-xs text-error mt-1">
              {state.errors.password[0]}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold mb-1.5 text-foreground"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="비밀번호를 다시 입력하세요"
          />
          {state?.errors?.confirmPassword && (
            <p className="text-xs text-error mt-1">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "처리 중..." : "회원가입"}
        </button>
      </form>

      {state?.message && (
        <p className="mt-4 text-center text-sm text-error">{state.message}</p>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          로그인
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 2: 브라우저에서 http://localhost:3000/register 확인**

Expected: 폼이 정상 렌더링되고, 빈 폼 제출 시 에러 메시지가 인라인으로 표시됨

- [ ] **Step 3: Commit**

```bash
git add app/(auth)/register/page.tsx
git commit -m "feat: connect register page to server action with validation"
```

---

### Task 5: 로그인 페이지 — useActionState 연결

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: 클라이언트 컴포넌트로 전환하고 useActionState 연결**

`app/(auth)/login/page.tsx` 전체를 아래로 교체:

```typescript
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
```

- [ ] **Step 2: 브라우저에서 http://localhost:3000/login 확인**

Expected: 폼이 정상 렌더링되고, 잘못된 자격증명 입력 시 "이메일 또는 비밀번호가 올바르지 않습니다" 에러 표시

- [ ] **Step 3: Commit**

```bash
git add app/(auth)/login/page.tsx
git commit -m "feat: connect login page to server action with validation"
```

---

### Task 6: E2E 수동 테스트

- [ ] **Step 1: 회원가입 테스트**

1. http://localhost:3000/register 접속
2. 이메일: `test@example.com`, 닉네임: `테스트맘`, 비밀번호: `password123`, 비밀번호 확인: `password123` 입력
3. 회원가입 버튼 클릭
4. Expected: `/login?registered=true` 로 이동, "회원가입이 완료되었습니다" 메시지 표시

- [ ] **Step 2: 검증 에러 테스트**

1. 비밀번호 1자만 입력 → "비밀번호는 8자 이상이어야 합니다"
2. 비밀번호 확인 불일치 → "비밀번호가 일치하지 않습니다"
3. 같은 이메일로 재가입 → "이미 사용 중인 이메일입니다"

- [ ] **Step 3: 로그인 테스트**

1. http://localhost:3000/login 접속
2. 위에서 가입한 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. Expected: `/` 홈으로 이동

- [ ] **Step 4: 로그인 실패 테스트**

1. 틀린 비밀번호 입력
2. Expected: "이메일 또는 비밀번호가 올바르지 않습니다" 에러 표시

- [ ] **Step 5: 최종 Commit**

```bash
git add -A
git commit -m "feat: complete email/password authentication flow"
```

---

## Execution Notes

- `lib/auth.ts`의 기존 Credentials provider authorize 콜백은 수정 불필요 — 이미 이메일 조회 + bcrypt.compare 로직이 구현되어 있음
- `signIn`에서 redirect가 발생하면 Next.js가 `NEXT_REDIRECT` 에러를 throw하므로, catch에서 `AuthError`만 잡고 나머지는 re-throw해야 함
- 카카오 로그인 버튼은 disabled 상태로 "준비 중" 표시
