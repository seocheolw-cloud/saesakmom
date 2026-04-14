import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
        회원가입
      </h1>

      <form className="space-y-4">
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
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          회원가입
        </button>
      </form>

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
