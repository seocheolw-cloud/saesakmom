import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
        로그인
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
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          로그인
        </button>
      </form>

      <div className="mt-4">
        <button
          type="button"
          className="w-full h-11 rounded-lg bg-kakao text-sm font-semibold text-[#3c1e1e] hover:brightness-95 transition-colors cursor-pointer"
        >
          카카오로 로그인
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
