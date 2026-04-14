# 공통 UI + 커뮤니티 게시판 CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공통 헤더를 분리하고, 커뮤니티 게시판 CRUD(목록/상세/작성/수정/삭제)를 구현한다.

**Architecture:** 공통 헤더를 async Server Component로 추출하여 모든 페이지에서 재사용. 게시글은 Server Actions로 CRUD 처리하고, 목록은 searchParams로 카테고리 필터 + 페이지네이션. Prisma seed로 카테고리 초기 데이터 생성.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, Prisma 7, Zod, Tailwind CSS 4

---

## File Structure

```
app/
  components/
    Header.tsx              # (Create) 공통 헤더 서버 컴포넌트
  community/
    page.tsx                # (Create) 게시판 목록
    new/page.tsx            # (Create) 글 작성
    [id]/page.tsx           # (Create) 글 상세
    [id]/edit/page.tsx      # (Create) 글 수정
    [id]/DeleteButton.tsx   # (Create) 삭제 버튼 클라이언트 컴포넌트
  page.tsx                  # (Modify) Header 컴포넌트로 교체
  mypage/page.tsx           # (Modify) Header 컴포넌트로 교체
lib/
  actions/post.ts           # (Create) createPost, updatePost, deletePost
  validations/post.ts       # (Create) PostSchema
prisma/
  seed.ts                   # (Create) 카테고리 시드
```

---

### Task 1: 공통 헤더 컴포넌트 추출

**Files:**
- Create: `app/components/Header.tsx`
- Modify: `app/page.tsx`
- Modify: `app/mypage/page.tsx`

- [ ] **Step 1: Header.tsx 생성**

```typescript
// app/components/Header.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/app/components/AuthButton";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#d4d4d4]">
      <div className="max-w-[1100px] mx-auto flex items-center h-[52px] md:h-16 px-4">
        <Link href="/" className="text-xl font-bold text-primary shrink-0">
          새싹맘
        </Link>

        <nav className="flex items-center ml-6 md:ml-10 gap-1 md:gap-2 h-full">
          {[
            { name: "홈", href: "/" },
            { name: "커뮤니티", href: "/community" },
            { name: "육아용품", href: "/products" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="h-full px-3 md:px-4 text-sm md:text-[16px] font-semibold inline-flex items-center text-[#5F6B7C] hover:text-[#18202A] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-[260px] h-10 rounded-full border border-[#d4d4d4] pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-[#bbc0c5] transition-colors"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                {session.user.nickname}님
              </span>
              <Link
                href="/mypage"
                className="h-10 px-4 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                마이페이지
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="h-10 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: app/page.tsx에서 헤더를 Header 컴포넌트로 교체**

`app/page.tsx`에서:
- `import { auth } from "@/lib/auth"` 제거
- `import { LogoutButton } from "@/app/components/AuthButton"` 제거
- `import { Header } from "@/app/components/Header"` 추가
- `const session = await auth();` 제거
- `<header>...</header>` 전체를 `<Header />` 로 교체

- [ ] **Step 3: app/mypage/page.tsx에서 헤더를 Header 컴포넌트로 교체**

`app/mypage/page.tsx`에서:
- `import { Header } from "@/app/components/Header"` 추가
- `<header>...</header>` 전체를 `<Header />` 로 교체

- [ ] **Step 4: 브라우저에서 확인**

Run: 홈(`/`), 마이페이지(`/mypage`) 모두 헤더 동일하게 표시되는지 확인
Expected: 로그인/비로그인 상태에서 각각 올바른 UI 표시

- [ ] **Step 5: Commit**

```bash
git add app/components/Header.tsx app/page.tsx app/mypage/page.tsx
git commit -m "refactor: extract common Header component"
```

---

### Task 2: 카테고리 시드 데이터

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (seed 스크립트 등록)

- [ ] **Step 1: prisma/seed.ts 생성**

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

const categories = [
  { name: "임신", slug: "pregnancy", sortOrder: 1 },
  { name: "출산", slug: "birth", sortOrder: 2 },
  { name: "육아일상", slug: "daily", sortOrder: 3 },
  { name: "수유/이유식", slug: "feeding", sortOrder: 4 },
  { name: "건강", slug: "health", sortOrder: 5 },
  { name: "자유게시판", slug: "free", sortOrder: 6 },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log("Categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: package.json에 seed 스크립트 등록**

`package.json`의 `"scripts"` 에 추가:
```json
"seed": "npx tsx prisma/seed.ts"
```

그리고 tsx 설치:
```bash
npm install -D tsx
```

- [ ] **Step 3: 시드 실행**

Run: `npx dotenvx run --env-file=.env.local -- npx tsx prisma/seed.ts`
Expected: `Categories seeded successfully`

Note: `.env.local`에서 환경변수를 로드해야 하므로 dotenvx 또는 직접 환경변수 세팅 필요. 안되면 `npx tsx -r dotenv/config prisma/seed.ts` (dotenv는 이미 설치됨) 시도. dotenv의 경우 `.env.local` 경로 지정 필요: seed.ts 상단에 `import "dotenv/config"` 추가하거나, prisma/seed.ts 자체에 dotenv.config 호출.

대안: seed.ts 상단에 다음 추가:
```typescript
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
```

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: add category seed data"
```

---

### Task 3: Zod 검증 스키마 + Server Actions

**Files:**
- Create: `lib/validations/post.ts`
- Create: `lib/actions/post.ts`

- [ ] **Step 1: lib/validations/post.ts 생성**

```typescript
// lib/validations/post.ts
import { z } from "zod";

export const PostSchema = z.object({
  categoryId: z.string().min(1, "카테고리를 선택하세요"),
  title: z
    .string()
    .min(1, "제목을 입력하세요")
    .max(100, "제목은 100자 이하로 입력하세요"),
  content: z.string().min(1, "내용을 입력하세요"),
});

export type PostFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
```

- [ ] **Step 2: lib/actions/post.ts 생성**

```typescript
// lib/actions/post.ts
"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostSchema, type PostFormState } from "@/lib/validations/post";

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = PostSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
      authorId: session.user.id,
    },
  });

  redirect(`/community/${post.id}`);
}

export async function updatePost(
  postId: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== session.user.id) {
    return { message: "수정 권한이 없습니다" };
  }

  const parsed = PostSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
    },
  });

  redirect(`/community/${postId}`);
}

export async function deletePost(postId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== session.user.id) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "DELETED" },
  });

  redirect("/community");
}
```

- [ ] **Step 3: TypeScript 확인**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add lib/validations/post.ts lib/actions/post.ts
git commit -m "feat: add post validation schema and server actions"
```

---

### Task 4: 게시판 목록 페이지

**Files:**
- Create: `app/community/page.tsx`

- [ ] **Step 1: app/community/page.tsx 생성**

```typescript
// app/community/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

const POSTS_PER_PAGE = 10;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const session = await auth();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const where = {
    status: "ACTIVE" as const,
    ...(categorySlug && {
      category: { slug: categorySlug },
    }),
  };

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { nickname: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />

      <main className="max-w-[800px] mx-auto px-4 py-6">
        {/* 카테고리 탭 */}
        <div className="flex gap-1 overflow-x-auto mb-4 bg-white rounded-xl border border-[#d4d4d4] p-1">
          <Link
            href="/community"
            className={`shrink-0 h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center transition-colors ${
              !categorySlug
                ? "bg-primary text-white"
                : "text-[#5F6B7C] hover:bg-gray-50"
            }`}
          >
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/community?category=${cat.slug}`}
              className={`shrink-0 h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center transition-colors ${
                categorySlug === cat.slug
                  ? "bg-primary text-white"
                  : "text-[#5F6B7C] hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* 글쓰기 버튼 */}
        {session?.user && (
          <div className="flex justify-end mb-4">
            <Link
              href="/community/new"
              className="h-10 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
            >
              글쓰기
            </Link>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              게시글이 없습니다.
            </div>
          ) : (
            posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className={`block p-4 hover:bg-[#f8faff] transition-colors ${
                  i < posts.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-primary">
                    {post.category.name}
                  </span>
                  <span className="text-xs text-muted">
                    {post.createdAt.toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-foreground mb-1 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-sm text-muted line-clamp-1 mb-2.5">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="font-medium text-foreground">
                    {post.author.nickname}
                  </span>
                  <span>조회 {post.viewCount}</span>
                  <span>좋아요 {post.likeCount}</span>
                  <span>댓글 {post._count.comments}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/community?${categorySlug ? `category=${categorySlug}&` : ""}page=${page}`}
                className={`w-9 h-9 rounded-lg text-sm font-semibold inline-flex items-center justify-center transition-colors ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "text-[#5F6B7C] hover:bg-gray-50 border border-[#d4d4d4]"
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 브라우저에서 /community 확인**

Expected: 카테고리 탭 + 빈 목록 표시 (게시글 없음)

- [ ] **Step 3: Commit**

```bash
git add app/community/page.tsx
git commit -m "feat: add community post list page with category filter and pagination"
```

---

### Task 5: 글 작성 페이지

**Files:**
- Create: `app/community/new/page.tsx`

- [ ] **Step 1: app/community/new/page.tsx 생성**

```typescript
// app/community/new/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
import { PostForm } from "./PostForm";

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">글쓰기</h1>
        <PostForm categories={categories} />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: PostForm 클라이언트 컴포넌트 생성 — `app/community/new/PostForm.tsx`**

```typescript
// app/community/new/PostForm.tsx
"use client";

import { useActionState } from "react";
import { createPost } from "@/lib/actions/post";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function PostForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createPost, undefined);

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <div>
        <label htmlFor="categoryId" className="block text-sm font-semibold mb-1.5 text-foreground">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state?.errors?.categoryId && (
          <p className="text-xs text-error mt-1">{state.errors.categoryId[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold mb-1.5 text-foreground">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          placeholder="제목을 입력하세요"
        />
        {state?.errors?.title && (
          <p className="text-xs text-error mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-semibold mb-1.5 text-foreground">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
          placeholder="내용을 입력하세요"
        />
        {state?.errors?.content && (
          <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <a
          href="/community"
          className="h-11 px-5 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={pending}
          className="h-11 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/community/new/
git commit -m "feat: add new post page with form"
```

---

### Task 6: 글 상세 페이지

**Files:**
- Create: `app/community/[id]/page.tsx`
- Create: `app/community/[id]/DeleteButton.tsx`

- [ ] **Step 1: app/community/[id]/page.tsx 생성**

```typescript
// app/community/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { DeleteButton } from "./DeleteButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      author: { select: { id: true, nickname: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // 조회수 증가
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />

      <main className="max-w-[800px] mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">
                {post.category.name}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="font-medium text-foreground">
                {post.author.nickname}
              </span>
              <span>
                {post.createdAt.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>조회 {post.viewCount + 1}</span>
              <span>좋아요 {post.likeCount}</span>
              <span>댓글 {post._count.comments}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* 작성자 액션 */}
          {isAuthor && (
            <div className="px-6 pb-6 flex justify-end gap-2">
              <Link
                href={`/community/${post.id}/edit`}
                className="h-9 px-4 rounded-lg border border-[#d4d4d4] text-xs font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                수정
              </Link>
              <DeleteButton postId={post.id} />
            </div>
          )}
        </article>

        <div className="mt-4">
          <Link
            href="/community"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            ← 목록으로
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: DeleteButton 클라이언트 컴포넌트 생성**

```typescript
// app/community/[id]/DeleteButton.tsx
"use client";

import { deletePost } from "@/lib/actions/post";

export function DeleteButton({ postId }: { postId: string }) {
  const handleDelete = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deletePost(postId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="h-9 px-4 rounded-lg border border-error text-xs font-semibold text-error hover:bg-red-50 transition-colors cursor-pointer"
    >
      삭제
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/community/[id]/
git commit -m "feat: add post detail page with view count and delete"
```

---

### Task 7: 글 수정 페이지

**Files:**
- Create: `app/community/[id]/edit/page.tsx`
- Create: `app/community/[id]/edit/EditPostForm.tsx`

- [ ] **Step 1: app/community/[id]/edit/page.tsx 생성**

```typescript
// app/community/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      category: { select: { id: true } },
    },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== session.user.id) {
    redirect("/community");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">글 수정</h1>
        <EditPostForm
          postId={post.id}
          categories={categories}
          defaultValues={{
            categoryId: post.categoryId,
            title: post.title,
            content: post.content,
          }}
        />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: EditPostForm 클라이언트 컴포넌트 생성**

```typescript
// app/community/[id]/edit/EditPostForm.tsx
"use client";

import { useActionState } from "react";
import { updatePost } from "@/lib/actions/post";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function EditPostForm({
  postId,
  categories,
  defaultValues,
}: {
  postId: string;
  categories: Category[];
  defaultValues: { categoryId: string; title: string; content: string };
}) {
  const updatePostWithId = updatePost.bind(null, postId);
  const [state, action, pending] = useActionState(updatePostWithId, undefined);

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <div>
        <label htmlFor="categoryId" className="block text-sm font-semibold mb-1.5 text-foreground">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={defaultValues.categoryId}
          className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state?.errors?.categoryId && (
          <p className="text-xs text-error mt-1">{state.errors.categoryId[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold mb-1.5 text-foreground">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues.title}
          className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {state?.errors?.title && (
          <p className="text-xs text-error mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-semibold mb-1.5 text-foreground">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          defaultValue={defaultValues.content}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
        />
        {state?.errors?.content && (
          <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <a
          href={`/community/${postId}`}
          className="h-11 px-5 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={pending}
          className="h-11 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "수정 중..." : "수정"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/community/[id]/edit/
git commit -m "feat: add post edit page"
```

---

### Task 8: 홈페이지 연동 — 실제 DB 데이터 표시

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: app/page.tsx 수정 — 더미 데이터를 DB 쿼리로 교체**

홈페이지의 인기글/최신글 섹션을 실제 DB에서 가져오도록 수정:

- 더미 데이터 상수(`POPULAR_POSTS`, `RECENT_POSTS`, `CATEGORY_POSTS`, `BEST_POSTS`, `TRENDING_KEYWORDS`) 제거
- `PostCard` 컴포넌트의 타입을 실제 Prisma 쿼리 결과에 맞게 수정
- `Home` 컴포넌트에서 prisma 쿼리로 인기글(좋아요순 3개), 최신글(최신순 4개), 카테고리별 글(각 3개) 조회
- 게시글이 없을 때는 "아직 게시글이 없습니다" 표시
- 인기 검색어는 아직 기능 없으므로 더미 유지 또는 섹션 제거

- [ ] **Step 2: 브라우저에서 확인**

Expected: 게시글이 없으면 빈 상태 표시, 글 작성 후 홈에 표시됨

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: connect home page to real DB data"
```

---

## Execution Notes

- Task 2(시드)에서 `.env.local` 환경변수 로드가 까다로울 수 있음 — seed.ts 상단에 dotenv.config 호출 추가 필요
- Task 3의 `updatePost`는 `bind`로 postId를 전달하는 패턴 사용 — Next.js 16 Server Actions에서 추가 인자 전달 방식
- Task 6의 조회수 증가는 간단한 방식 (새로고침마다 +1). 정교한 조회수 카운팅은 스코프 밖
- `searchParams`는 Next.js 16에서 `Promise`로 바뀌었으므로 `await searchParams` 필요
