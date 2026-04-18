"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProductBrand, deleteProductBrand } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type BrandRow = { id: string; name: string; type: { name: string; slug: string }; _count: { products: number } };
type TypeOption = { id: string; name: string; slug: string };

export function BrandManager({ types, brands, typeFilter, query }: { types: TypeOption[]; brands: BrandRow[]; typeFilter?: string; query?: string }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createProductBrand, undefined);

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    const get = (key: string, cur: string | undefined) => key in overrides ? overrides[key] : cur;
    const tf = get("type", typeFilter); if (tf) p.type = tf;
    const q = get("q", query); if (q) p.q = q;
    const qs = new URLSearchParams(p).toString();
    return qs ? `/admin/products/brands?${qs}` : "/admin/products/brands";
  }

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">브랜드 관리</h2>

      {/* 추가 폼 */}
      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">종류</label>
            <select name="typeId" required className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
              <option value="">선택</option>
              {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">브랜드명</label>
            <input name="name" placeholder="예: 사이벡스" className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" disabled={pending} className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && <p className="text-xs text-red-500 mt-2">{state.message}</p>}
      </form>

      {/* 필터 바 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4 space-y-3">
        <form action="/admin/products/brands" className="flex gap-2">
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          <input name="q" defaultValue={query} placeholder="브랜드명 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white hover:opacity-90 transition-opacity">검색</button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Link href={buildHref({ type: undefined })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${!typeFilter ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>전체</Link>
          {types.map((t) => (
            <Link key={t.slug} href={buildHref({ type: t.slug })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${typeFilter === t.slug ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>{t.name}</Link>
          ))}
        </div>
        {(query || typeFilter) && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted">필터:</span>
            {query && <span className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded">&quot;{query}&quot;</span>}
            {typeFilter && <span className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded">{types.find((t) => t.slug === typeFilter)?.name}</span>}
            <Link href="/admin/products/brands" className="text-[11px] text-red-500 hover:underline">초기화</Link>
          </div>
        )}
      </div>

      {/* 브랜드 테이블 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {brands.length}개 브랜드</span>
        </div>
        {brands.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">{query || typeFilter ? "검색 결과가 없습니다." : "등록된 브랜드가 없습니다."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left">브랜드명</th>
                  <th className="px-4 py-2.5 text-left">종류</th>
                  <th className="px-4 py-2.5 text-center">상품</th>
                  <th className="px-4 py-2.5 text-center w-20">삭제</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff] transition-colors">
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded">{b.type.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted">{b._count.products}</td>
                    <td className="px-4 py-3 text-center">
                      {b._count.products > 0 ? (
                        <span className="text-xs text-muted">삭제불가</span>
                      ) : (
                        <form action={deleteProductBrand.bind(null, b.id)} onSubmit={(e) => { if (!confirm("정말 삭제하시겠습니까?")) e.preventDefault(); }}>
                          <button type="submit" className="text-xs text-red-500 hover:opacity-75">삭제</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
