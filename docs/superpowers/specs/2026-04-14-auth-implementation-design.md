# 인증 완성 — 디자인 스펙

## 개요

기존 NextAuth 설정과 로그인/회원가입 UI 스텁을 실제로 동작하게 만든다. 이메일/비밀번호 인증만 구현하며, 카카오 로그인은 이후 별도 작업으로 진행한다.

## 범위

- 회원가입 Server Action (검증 + DB 저장)
- 로그인 폼 동작 연결 (NextAuth signIn)
- 에러 메시지 인라인 표시
- 성공 시 리다이렉트
- Zod 의존성 추가

### 범위 밖

- 카카오 소셜 로그인
- 비밀번호 찾기/재설정
- 이메일 인증
- 프로필 관리

## 파일 구조

```
lib/
  actions/auth.ts        # Server Actions (register, login)
  validations/auth.ts    # Zod 검증 스키마
app/(auth)/
  login/page.tsx         # 클라이언트 컴포넌트로 전환 (useActionState)
  register/page.tsx      # 클라이언트 컴포넌트로 전환 (useActionState)
```

## 동작 흐름

### 회원가입

1. 폼 제출 → `register` Server Action 호출
2. Zod 서버 검증:
   - 이메일: 유효한 이메일 형식
   - 닉네임: 2자 이상 10자 이하
   - 비밀번호: 8자 이상
   - 비밀번호 확인: 일치 여부
3. 이메일 중복 체크 → "이미 사용 중인 이메일입니다"
4. 닉네임 중복 체크 → "이미 사용 중인 닉네임입니다"
5. bcrypt.hash(password, 10)으로 해싱
6. prisma.user.create로 DB 저장
7. 성공 시 `/login`으로 redirect

### 로그인

1. 폼 제출 → `login` Server Action 호출
2. signIn("credentials", { email, password, redirect: false }) 호출
3. NextAuth authorize 콜백에서 이메일 조회 + bcrypt.compare
4. 성공 시 `/`로 redirect
5. 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다" 에러 반환

## 검증 스키마 (Zod)

### RegisterSchema

| 필드 | 타입 | 조건 | 에러 메시지 |
|------|------|------|------------|
| email | string | 이메일 형식 | "유효한 이메일을 입력하세요" |
| nickname | string | 2~10자 | "닉네임은 2~10자로 입력하세요" |
| password | string | 8자 이상 | "비밀번호는 8자 이상이어야 합니다" |
| confirmPassword | string | password와 일치 | "비밀번호가 일치하지 않습니다" |

### LoginSchema

| 필드 | 타입 | 조건 | 에러 메시지 |
|------|------|------|------------|
| email | string | 이메일 형식 | "유효한 이메일을 입력하세요" |
| password | string | 1자 이상 | "비밀번호를 입력하세요" |

## UI 스타일 (블라인드 참고)

### 색상

| 용도 | 색상 코드 |
|------|----------|
| 주요 (버튼, focus) | `#22C55E` (green-500) |
| 주요 hover | `#16A34A` (green-600) |
| 배경 | `#f6f7fa` |
| 카드 배경 | `#ffffff` |
| 텍스트 | `#222222` |
| 보조 텍스트 | `#94969b` |
| 경계선 | `#d4d4d4` |
| 에러 | `#FB5957` |
| 카카오 (비활성) | `#FEE500` |

### 컴포넌트 스타일

- **입력 필드**: border `#d4d4d4`, border-radius 8px, height 44px, font-size 14px, focus 시 border `#22C55E`
- **버튼**: height 44px, border-radius 8px, font-weight 600, font-size 14px
- **카드**: max-width 400px, 중앙 정렬, padding 32px, border-radius 12px, shadow-sm
- **에러 메시지**: font-size 12px, color `#FB5957`, margin-top 4px
- **브레이크포인트**: 1100px (모바일/데스크톱)
- **폰트**: Pretendard (시스템 기본 sans-serif 폴백)

## 에러 처리

Server Action이 `{ success: false, errors: { ... } }` 형태의 상태를 반환하고, 클라이언트에서 useActionState로 받아 각 필드 아래에 인라인 표시한다.

## 의존성

- `zod` 추가 설치 필요
