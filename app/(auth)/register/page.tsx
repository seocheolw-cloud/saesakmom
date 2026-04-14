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
