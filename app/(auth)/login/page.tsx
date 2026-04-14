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
