# 공통 UI + 커뮤니티 게시판 CRUD — 디자인 스펙

## 개요

공통 헤더 컴포넌트를 분리하고, 커뮤니티 게시판 기본 CRUD를 구현한다. 댓글/좋아요/검색은 2단계에서 진행.

## 범위

- 공통 헤더 컴포넌트 분리 (중복 제거)
- 카테고리 시드 데이터
- 게시글 CRUD: 목록(카테고리별 필터, 페이지네이션), 상세, 작성, 수정, 삭제

### 범위 밖 (2단계)

- 댓글/대댓글
- 좋아요
- 검색
- 이미지 첨부
- 신고

## 파일 구조

```
app/
  components/
    Header.tsx              # (Create) 공통 헤더 — 서버 컴포넌트, 세션 체크
  community/
    page.tsx                # (Create) 게시판 목록 (전체/카테고리별)
    new/page.tsx            # (Create) 글 작성
    [id]/page.tsx           # (Create) 글 상세
    [id]/edit/page.tsx      # (Create) 글 수정
  page.tsx                  # (Modify) 헤더를 Header 컴포넌트로 교체
  mypage/page.tsx           # (Modify) 헤더를 Header 컴포넌트로 교체
lib/
  actions/post.ts           # (Create) Server Actions — createPost, updatePost, deletePost
  validations/post.ts       # (Create) Zod 스키마
prisma/
  seed.ts                   # (Create) 카테고리 시드
```

## 카테고리 시드 데이터

| name | slug | sortOrder |
|------|------|-----------|
| 임신 | pregnancy | 1 |
| 출산 | birth | 2 |
| 육아일상 | daily | 3 |
| 수유/이유식 | feeding | 4 |
| 건강 | health | 5 |
| 자유게시판 | free | 6 |

실행: `npx prisma db seed`
prisma.config.ts 또는 package.json에 seed 명령 등록 필요.

## 동작 흐름

### 공통 헤더

- `app/components/Header.tsx` — async 서버 컴포넌트
- `auth()`로 세션 체크
- 비로그인: 로고 + 네비(홈/커뮤니티/육아용품) + 검색바 + 로그인 버튼
- 로그인: 로고 + 네비 + 검색바 + 닉네임 + 마이페이지 버튼 + 로그아웃 버튼
- `page.tsx`, `mypage/page.tsx`의 중복 헤더를 이 컴포넌트로 교체

### 게시글 목록 (`/community`)

- URL: `/community?category=slug&page=1`
- 카테고리 탭 (전체 + 6개 카테고리) — 클릭 시 쿼리 파라미터 변경
- 게시글 10개씩 페이지네이션
- 각 게시글: 카테고리 뱃지, 제목, 본문 미리보기(1줄), 작성자 닉네임, 작성일, 조회수, 좋아요수, 댓글수
- 로그인 시 "글쓰기" 버튼 표시

### 글 작성 (`/community/new`)

- 로그인 필수 (미로그인 시 `/login`으로 redirect)
- 폼: 카테고리 선택 (드롭다운), 제목 (필수), 본문 (필수, textarea)
- Server Action으로 처리
- 성공 시 해당 글 상세 페이지로 redirect

### 글 상세 (`/community/[id]`)

- 제목, 카테고리 뱃지, 작성자, 작성일, 조회수
- 본문 전체 표시
- 본인 글이면 수정/삭제 버튼 표시
- 페이지 방문 시 조회수 +1 (서버에서 처리)

### 글 수정 (`/community/[id]/edit`)

- 본인 글만 접근 가능 (아니면 목록으로 redirect)
- 기존 카테고리/제목/본문 프리필
- 수정 후 상세 페이지로 redirect

### 글 삭제

- 상세 페이지에서 삭제 버튼 클릭
- 클라이언트에서 confirm 확인 후 Server Action 호출
- 본인 글만 삭제 가능
- 삭제 후 목록으로 redirect

## 검증 스키마 (Zod)

### CreatePostSchema / UpdatePostSchema

| 필드 | 타입 | 조건 | 에러 메시지 |
|------|------|------|------------|
| categoryId | string | 필수 | "카테고리를 선택하세요" |
| title | string | 1~100자 | "제목을 입력하세요" / "제목은 100자 이하로 입력하세요" |
| content | string | 1자 이상 | "내용을 입력하세요" |

## UI 스타일

기존 하늘색 테마 + 블라인드 참고 레이아웃 유지.

- 게시글 목록: 홈페이지의 PostCard 스타일과 동일
- 카테고리 탭: 홈페이지의 헤더 네비 탭과 동일한 스타일
- 글 작성/수정 폼: 인증 페이지와 동일한 입력 필드 스타일
- 페이지네이션: 숫자 버튼 형태, 현재 페이지 하이라이트
