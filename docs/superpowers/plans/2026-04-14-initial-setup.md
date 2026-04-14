# 새싹맘 초기 세팅 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 16 프로젝트에 Prisma ORM + Supabase PostgreSQL + NextAuth(카카오 로그인) 초기 세팅을 완료한다.

**Architecture:** Prisma를 ORM으로 사용하여 Supabase PostgreSQL에 연결. NextAuth(Auth.js v5)로 이메일/비밀번호 + 카카오 소셜 로그인 구현. Next.js 16 App Router 패턴(async request APIs, proxy.ts)을 따름.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Prisma ORM, Supabase PostgreSQL, NextAuth v5 (Auth.js), bcryptjs

---

## File Structure

```
saesakmom/
├── .env.local                          # 환경변수 (DB URL, NextAuth, 카카오 OAuth)
├── prisma/
│   └── schema.prisma                   # 전체 DB 스키마
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   └── auth.ts                         # NextAuth 설정
├── app/
│   ├── layout.tsx                      # 수정: 한국어 lang, 메타데이터
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts            # NextAuth API route
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                # 로그인 페이지
│   │   └── register/
│   │       └── page.tsx                # 회원가입 페이지
│   └── page.tsx                        # 수정: 랜딩 페이지 스텁
├── proxy.ts                            # Next.js 16 proxy (middleware 대체)
└── next.config.ts                      # 수정: 이미지 등 설정
```

---

### Task 1: 패키지 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Prisma 및 인증 관련 패키지 설치**

```bash
npm install prisma @prisma/client next-auth@5 @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: 설치 확인**

Run: `npx prisma --version`
Expected: Prisma 버전 출력 (6.x)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add prisma, next-auth, bcryptjs dependencies"
```

---

### Task 2: 환경변수 및 Prisma 초기화

**Files:**
- Create: `.env.local`
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

- [ ] **Step 1: .env.local 생성**

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"

# NextAuth
AUTH_SECRET="생성필요-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# 카카오 OAuth
AUTH_KAKAO_ID=""
AUTH_KAKAO_SECRET=""
```

- [ ] **Step 2: Prisma 초기화**

Run: `npx prisma init --datasource-provider postgresql`
Expected: `prisma/schema.prisma` 파일 생성

- [ ] **Step 3: prisma/schema.prisma 작성 (전체 스키마)**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ==========================================
// 인증 (NextAuth)
// ==========================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?
  nickname      String    @unique
  profileImage  String?
  role          Role      @default(USER)
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  posts    Post[]
  comments Comment[]
  likes    Like[]
  reports  Report[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ==========================================
// 커뮤니티
// ==========================================

model Category {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  description String?
  sortOrder   Int    @default(0)
  createdAt   DateTime @default(now())

  posts Post[]

  @@map("categories")
}

model Tag {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique

  posts PostTag[]

  @@map("tags")
}

model Post {
  id         String     @id @default(cuid())
  title      String
  content    String     @db.Text
  images     String[]
  viewCount  Int        @default(0)
  likeCount  Int        @default(0)
  status     PostStatus @default(ACTIVE)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  authorId   String
  categoryId String

  author   User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])

  comments Comment[]
  likes    Like[]
  tags     PostTag[]
  reports  Report[]

  @@index([categoryId, createdAt(sort: Desc)])
  @@index([likeCount(sort: Desc)])
  @@map("posts")
}

model PostTag {
  postId String
  tagId  String

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model Comment {
  id        String        @id @default(cuid())
  content   String        @db.Text
  status    CommentStatus @default(ACTIVE)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  authorId String
  postId   String
  parentId String?

  author  User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")
  reports Report[]

  @@index([postId, createdAt])
  @@map("comments")
}

model Like {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId String
  postId String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("likes")
}

model Report {
  id        String       @id @default(cuid())
  reason    String
  detail    String?      @db.Text
  status    ReportStatus @default(PENDING)
  createdAt DateTime     @default(now())
  resolvedAt DateTime?

  reporterId String
  postId     String?
  commentId  String?

  reporter User     @relation(fields: [reporterId], references: [id])
  post     Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment  Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@map("reports")
}

// ==========================================
// 육아용품 비교
// ==========================================

model Product {
  id            String        @id @default(cuid())
  name          String
  brand         String
  categorySlug  String
  priceMin      Int?
  priceMax      Int?
  releaseDate   String?
  imageUrl      String?
  ageRangeStart Int?
  ageRangeEnd   Int?
  origin        String?
  status        ProductStatus @default(DRAFT)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  specs          ProductSpec[]
  certifications ProductCertification[]
  reviews        ProductReviewSummary?
  scores         ProductScore?

  @@index([categorySlug, status])
  @@map("products")
}

model ProductSpec {
  id        String @id @default(cuid())
  key       String
  value     String
  sortOrder Int    @default(0)

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, key])
  @@map("product_specs")
}

model ProductCertification {
  id     String  @id @default(cuid())
  type   String
  name   String
  number String?
  note   String?

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_certifications")
}

model ProductReviewSummary {
  id              String   @id @default(cuid())
  totalReviews    Int      @default(0)
  avgRating       Float    @default(0)
  prosKeywords    String[]
  consKeywords    String[]
  prosReviews     String[]
  consReviews     String[]
  recommendFor    String?  @db.Text
  notRecommendFor String?  @db.Text
  sources         String[]
  analyzedAt      DateTime @default(now())

  productId String  @unique
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_review_summaries")
}

model ProductScore {
  id               String @id @default(cuid())
  valueScore       Float  @default(0)
  popularityScore  Float  @default(0)
  overallScore     Float  @default(0)
  similarProducts  String[]

  productId String  @unique
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_scores")
}

// ==========================================
// 광고 (비활성 상태로 준비)
// ==========================================

model AdSlot {
  id        String       @id @default(cuid())
  name      String       @unique
  position  String
  isActive  Boolean      @default(false)
  imageUrl  String?
  linkUrl   String?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@map("ad_slots")
}

// ==========================================
// Enums
// ==========================================

enum Role {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  WARNED
  SUSPENDED
  BANNED
}

enum PostStatus {
  ACTIVE
  HIDDEN
  DELETED
}

enum CommentStatus {
  ACTIVE
  HIDDEN
  DELETED
}

enum ReportStatus {
  PENDING
  RESOLVED
  DISMISSED
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

- [ ] **Step 4: Prisma client singleton 생성 — `lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Commit**

```bash
git add .env.local prisma/schema.prisma lib/prisma.ts
git commit -m "feat: add env config, prisma schema, and db client singleton"
```

Note: `.env.local`은 .gitignore에 이미 포함되어 커밋되지 않음. `.env.example` 파일을 대신 커밋.

---

### Task 3: NextAuth 설정

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: NextAuth 설정 파일 작성 — `lib/auth.ts`**

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Kakao from "next-auth/providers/kakao";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Kakao({
      clientId: process.env.AUTH_KAKAO_ID!,
      clientSecret: process.env.AUTH_KAKAO_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          image: user.profileImage,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true, nickname: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.nickname = dbUser.nickname;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.nickname = token.nickname as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

- [ ] **Step 2: NextAuth 타입 확장 — `lib/auth.ts` 파일 상단에 타입 선언 추가 또는 `types/next-auth.d.ts` 생성**

Create `types/next-auth.d.ts`:

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      nickname: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    nickname: string;
  }
}
```

- [ ] **Step 3: NextAuth API 라우트 — `app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts types/next-auth.d.ts app/api/auth/\[...nextauth\]/route.ts
git commit -m "feat: configure next-auth with kakao and credentials providers"
```

---

### Task 4: 레이아웃 및 proxy 설정

**Files:**
- Modify: `app/layout.tsx`
- Create: `proxy.ts`
- Modify: `app/page.tsx`
- Create: `.env.example`

- [ ] **Step 1: 루트 레이아웃 수정 — `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "새싹맘 — 육아 커뮤니티 & 용품 비교",
  description: "초보맘을 위한 육아 커뮤니티와 육아용품 비교 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: proxy.ts 생성 (Next.js 16 — middleware 대체)**

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 페이지 보호
  if (pathname.startsWith("/admin")) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 3: 랜딩 페이지 스텁 — `app/page.tsx`**

```typescript
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold">새싹맘</h1>
      <p className="mt-4 text-lg text-gray-500">
        초보맘을 위한 육아 커뮤니티 & 용품 비교 서비스
      </p>
    </main>
  );
}
```

- [ ] **Step 4: .env.example 생성**

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"

# NextAuth
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

# 카카오 OAuth
AUTH_KAKAO_ID=""
AUTH_KAKAO_SECRET=""
```

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx proxy.ts .env.example
git commit -m "feat: update layout for korean, add proxy, landing stub, env example"
```

---

### Task 5: DB 마이그레이션 및 연결 확인

**Files:**
- Modify: `prisma/schema.prisma` (이미 작성됨)

- [ ] **Step 1: Prisma client 생성**

Run: `npx prisma generate`
Expected: `Prisma Client generated successfully`

- [ ] **Step 2: DB 마이그레이션 (Supabase 연결 후)**

Run: `npx prisma db push`
Expected: DB에 테이블 생성 완료 메시지

Note: 실제 Supabase 프로젝트가 생성되어 있고 `.env.local`에 올바른 연결 문자열이 입력되어야 함. 아직 Supabase가 없으면 이 단계는 나중에 실행.

- [ ] **Step 3: 연결 확인 스크립트 실행**

Run: `npx prisma studio`
Expected: 브라우저에서 Prisma Studio 열림, 모든 테이블 확인 가능

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: generate prisma client and push initial schema"
```

---

### Task 6: 로그인/회원가입 페이지 스텁

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/layout.tsx`

- [ ] **Step 1: Auth 레이아웃 — `app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: 로그인 페이지 — `app/(auth)/login/page.tsx`**

```typescript
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8">로그인</h1>

      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="이메일을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          로그인
        </button>
      </form>

      <div className="mt-4">
        <button
          type="button"
          className="w-full rounded-lg bg-yellow-400 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500"
        >
          카카오로 로그인
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-green-600 hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 3: 회원가입 페이지 — `app/(auth)/register/page.tsx`**

```typescript
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>

      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="이메일을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-1">
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="닉네임을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="비밀번호를 입력하세요 (8자 이상)"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          회원가입
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-green-600 hover:underline">
          로그인
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add login and register page stubs"
```

---

## Execution Notes

- Task 5 (DB 마이그레이션)는 Supabase 프로젝트 생성 후 `.env.local`에 실제 연결 문자열 입력이 선행되어야 함
- 로그인/회원가입 페이지는 UI 스텁만 — Server Action 연결은 다음 플랜에서 진행
- `proxy.ts`에서 `auth()` 호출은 NextAuth v5의 Next.js 16 호환성 확인 필요 — 문제 시 JWT 토큰 직접 검증으로 대체
