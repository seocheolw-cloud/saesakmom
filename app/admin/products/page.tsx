import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "./DeleteButton";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ type?: string; brand?: string; q?: string; status?: string; page?: string }> }) {
  const params = await searchParams;
  const typeFilter = params.type;
  const brandFilter = params.brand;
  const query = (params.q?.trim() || "").slice(0, 100);
  const statusFilter = params.status;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(typeFilter && { type: { slug: typeFilter } }),
    ...(brandFilter && { brand: { name: brandFilter } }),
    ...(statusFilter && { status: statusFilter as Prisma.EnumProductStatusFilter }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { brand: { name: { contains: query, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [types, products, totalCount] = await Promise.all([
    prisma.productType.findMany({ orderBy: { sortOrder: "asc" }, include: { brands: { orderBy: { name: "asc" } } } }),
    prisma.product.findMany({
      where,
      include: { type: { select: { name: true, slug: true } }, brand: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    const get = (key: string, cur: string | undefined) => key in overrides ? overrides[key] : cur;
    const v = (key: string, cur: string | undefined) => { const val = get(key, cur); if (val) p[key] = val; };
    v("type", typeFilter); v("brand", brandFilter); v("q", query || undefined);
    v("status", statusFilter); if (overrides.page) p.page = overrides.page;
    const qs = new URLSearchParams(p).toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  }

  const activeType = types.find((t) => t.slug === typeFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">상품 목록</h2>
          <p className="text-xs text-muted mt-0.5">총 {totalCount}개 상품</p>
        </div>
        <Link href="/admin/products/new" className="h-10 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          상품 등록
        </Link>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4 space-y-3">
        {/* 검색 */}
        <form action="/admin/products" className="flex gap-2">
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          {brandFilter && <input type="hidden" name="brand" value={brandFilter} />}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input name="q" defaultValue={query} placeholder="상품명, 브랜드 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white hover:opacity-90 transition-opacity">검색</button>
        </form>

        {/* 종류 필터 */}
        <div className="flex flex-wrap gap-1.5">
          <Link href={buildHref({ type: undefined, brand: undefined, page: undefined })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${!typeFilter ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>전체</Link>
          {types.map((t) => (
            <Link key={t.slug} href={buildHref({ type: t.slug, brand: undefined, page: undefined })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${typeFilter === t.slug ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>{t.name}</Link>
          ))}
        </div>

        {/* 브랜드 필터 (종류 선택 시) */}
        {activeType && activeType.brands.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-muted self-center mr-1">브랜드:</span>
            <Link href={buildHref({ brand: undefined, page: undefined })} className={`h-6 px-2 rounded-full text-[11px] font-medium inline-flex items-center ${!brandFilter ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>전체</Link>
            {activeType.brands.map((b) => (
              <Link key={b.id} href={buildHref({ brand: b.name, page: undefined })} className={`h-6 px-2 rounded-full text-[11px] font-medium inline-flex items-center ${brandFilter === b.name ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>{b.name}</Link>
            ))}
          </div>
        )}

        {/* 상태 필터 */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted self-center mr-1">상태:</span>
          <Link href={buildHref({ status: undefined, page: undefined })} className={`h-6 px-2 rounded-full text-[11px] font-medium inline-flex items-center ${!statusFilter ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>전체</Link>
          {[{ value: "PUBLISHED", label: "공개" }, { value: "DRAFT", label: "비공개" }].map((s) => (
            <Link key={s.value} href={buildHref({ status: s.value, page: undefined })} className={`h-6 px-2 rounded-full text-[11px] font-medium inline-flex items-center ${statusFilter === s.value ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>{s.label}</Link>
          ))}
        </div>

        {/* 활성 필터 표시 */}
        {(query || typeFilter || brandFilter || statusFilter) && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-muted">필터:</span>
            {query && <span className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded">&quot;{query}&quot;</span>}
            {typeFilter && <span className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded">{activeType?.name}</span>}
            {brandFilter && <span className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded">{brandFilter}</span>}
            {statusFilter && <span className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded">{statusFilter === "PUBLISHED" ? "공개" : statusFilter === "DRAFT" ? "임시" : "보관"}</span>}
            <Link href="/admin/products" className="text-[11px] text-red-500 hover:underline">초기화</Link>
          </div>
        )}
      </div>

      {/* 상품 테이블 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p className="text-sm text-muted mb-3">{query || typeFilter || brandFilter || statusFilter ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}</p>
            {!query && !typeFilter && <Link href="/admin/products/new" className="text-sm text-primary font-semibold hover:underline">첫 상품 등록하기</Link>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">상품명</th>
                  <th className="px-4 py-3 text-left">종류</th>
                  <th className="px-4 py-3 text-left">브랜드</th>
                  <th className="px-4 py-3 text-right">가격</th>
                  <th className="px-4 py-3 text-center">상태</th>
                  <th className="px-4 py-3 text-center w-36">관리</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff] transition-colors">
                    <td className="px-4 py-3 text-xs text-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded">{p.type.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.brand.name}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {p.price ? `${p.price.toLocaleString()}원` : <span className="text-muted">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        p.status === "PUBLISHED" ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"
                      }`}>
                        {p.status === "PUBLISHED" ? "공개" : "비공개"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="h-8 px-3 rounded-md text-xs font-medium text-primary bg-blue-50 hover:bg-blue-100 transition-colors inline-flex items-center justify-center whitespace-nowrap">수정</Link>
                        <DeleteProductButton productId={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {page > 1 && <Link href={buildHref({ page: String(page - 1) })} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">이전</Link>}
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)).map((p, i, arr) => {
            const prev = arr[i - 1];
            return (
              <span key={p}>
                {prev && p - prev > 1 && <span className="w-8 h-8 inline-flex items-center justify-center text-xs text-muted">...</span>}
                <Link href={buildHref({ page: String(p) })} className={`h-8 w-8 rounded-lg text-xs font-medium inline-flex items-center justify-center ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary hover:text-primary"}`}>{p}</Link>
              </span>
            );
          })}
          {page < totalPages && <Link href={buildHref({ page: String(page + 1) })} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">다음</Link>}
        </div>
      )}
    </div>
  );
}
