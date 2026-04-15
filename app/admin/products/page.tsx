import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/admin-product";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      type: { select: { name: true } },
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">상품 목록</h2>
        <Link
          href="/admin/products/new"
          className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
        >
          상품 등록
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 상품이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">상품명</th>
                <th className="px-4 py-2.5 text-left">종류</th>
                <th className="px-4 py-2.5 text-left">브랜드</th>
                <th className="px-4 py-2.5 text-right">가격</th>
                <th className="px-4 py-2.5 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff]">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.type.name}</td>
                  <td className="px-4 py-3 text-muted">{p.brand.name}</td>
                  <td className="px-4 py-3 text-right text-muted">
                    {p.price ? `${p.price.toLocaleString()}원` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-primary hover:underline">수정</Link>
                      <form action={deleteProduct.bind(null, p.id)}>
                        <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
