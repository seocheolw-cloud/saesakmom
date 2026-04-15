"use client";

import { useActionState } from "react";
import { createProductBrand, deleteProductBrand } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type BrandRow = { id: string; name: string; type: { name: string }; _count: { products: number } };
type TypeOption = { id: string; name: string };

export function BrandManager({ types, brands }: { types: TypeOption[]; brands: BrandRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createProductBrand, undefined);

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">브랜드 관리</h2>
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
        {state?.message && state.message !== "" && <p className="text-xs text-error mt-2">{state.message}</p>}
      </form>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {brands.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 브랜드가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">브랜드명</th>
                <th className="px-4 py-2.5 text-left">종류</th>
                <th className="px-4 py-2.5 text-center">상품</th>
                <th className="px-4 py-2.5 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3 text-muted">{b.type.name}</td>
                  <td className="px-4 py-3 text-center text-muted">{b._count.products}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={deleteProductBrand.bind(null, b.id)}>
                      <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                    </form>
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
