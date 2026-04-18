import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [productCount, typeCount, brandCount, postCount, commentCount, comparisonCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.productType.count(),
    prisma.productBrand.count(),
    prisma.post.count({ where: { status: "ACTIVE" } }),
    prisma.comment.count({ where: { status: "ACTIVE" } }),
    prisma.productComparison.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "전체 상품", value: productCount, href: "/admin/products", color: "text-blue-600 bg-blue-50" },
    { label: "종류", value: typeCount, href: "/admin/products/types", color: "text-purple-600 bg-purple-50" },
    { label: "브랜드", value: brandCount, href: "/admin/products/brands", color: "text-pink-600 bg-pink-50" },
    { label: "게시글", value: postCount, href: "/admin/community/posts", color: "text-green-600 bg-green-50" },
    { label: "댓글", value: commentCount, href: "/admin/community/comments", color: "text-teal-600 bg-teal-50" },
    { label: "비교 투표", value: comparisonCount, href: "/admin/compare", color: "text-orange-600 bg-orange-50" },
    { label: "회원", value: userCount, href: "/admin/users", color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-5">대시보드</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-[#d4d4d4] p-4 hover:shadow-md hover:border-primary/40 transition-all">
            <p className="text-xs text-muted mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/products/new" className="bg-white rounded-xl border border-[#d4d4d4] p-5 hover:shadow-md hover:border-primary/40 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">상품 등록</h3>
          <p className="text-xs text-muted mt-0.5">새 육아용품을 등록합니다</p>
        </Link>
        <Link href="/admin/products/types" className="bg-white rounded-xl border border-[#d4d4d4] p-5 hover:shadow-md hover:border-primary/40 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">종류 & 스펙 관리</h3>
          <p className="text-xs text-muted mt-0.5">카테고리와 스펙 항목을 설정합니다</p>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-xl border border-[#d4d4d4] p-5 hover:shadow-md hover:border-primary/40 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">설정</h3>
          <p className="text-xs text-muted mt-0.5">비밀번호 변경 등 관리자 설정</p>
        </Link>
      </div>
    </div>
  );
}
