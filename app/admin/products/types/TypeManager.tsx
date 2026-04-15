"use client";

import { useActionState } from "react";
import { createProductType, deleteProductType } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type ProductTypeRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count: { products: number; brands: number };
};

export function TypeManager({ types }: { types: ProductTypeRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createProductType, undefined);

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">종류 관리</h2>
      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">종류명</label>
            <input name="name" placeholder="예: 카시트" className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">슬러그</label>
            <input name="slug" placeholder="예: carseat" className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" disabled={pending} className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && <p className="text-xs text-error mt-2">{state.message}</p>}
        {state?.errors?.name && <p className="text-xs text-error mt-2">{state.errors.name[0]}</p>}
        {state?.errors?.slug && <p className="text-xs text-error mt-2">{state.errors.slug[0]}</p>}
      </form>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {types.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 종류가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">종류명</th>
                <th className="px-4 py-2.5 text-left">슬러그</th>
                <th className="px-4 py-2.5 text-center">브랜드</th>
                <th className="px-4 py-2.5 text-center">상품</th>
                <th className="px-4 py-2.5 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.slug}</td>
                  <td className="px-4 py-3 text-center text-muted">{t._count.brands}</td>
                  <td className="px-4 py-3 text-center text-muted">{t._count.products}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={deleteProductType.bind(null, t.id)}>
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
