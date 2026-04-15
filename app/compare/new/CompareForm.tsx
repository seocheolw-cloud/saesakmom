"use client";

import { useActionState, useState } from "react";
import { createComparison } from "@/lib/actions/comparison";
import type { AdminFormState } from "@/lib/validations/product";

type ProductOption = { id: string; name: string; brand: { name: string } };
type TypeWithProducts = { id: string; name: string; products: ProductOption[] };

export function CompareForm({ types }: { types: TypeWithProducts[] }) {
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const selectedType = types.find((t) => t.id === selectedTypeId);
  const products = selectedType?.products ?? [];
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createComparison, undefined);

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1">종류 선택</label>
        <select value={selectedTypeId} onChange={(e) => setSelectedTypeId(e.target.value)} className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
          <option value="">선택하세요</option>
          {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">상품 A</label>
        <select name="productAId" required className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
          <option value="">선택하세요</option>
          {products.map((p) => (<option key={p.id} value={p.id}>{p.brand.name} {p.name}</option>))}
        </select>
        {state?.errors?.productAId && <p className="text-xs text-error mt-1">{state.errors.productAId[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">상품 B</label>
        <select name="productBId" required className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
          <option value="">선택하세요</option>
          {products.map((p) => (<option key={p.id} value={p.id}>{p.brand.name} {p.name}</option>))}
        </select>
        {state?.errors?.productBId && <p className="text-xs text-error mt-1">{state.errors.productBId[0]}</p>}
      </div>
      {state?.message && state.message !== "" && <p className="text-sm text-error">{state.message}</p>}
      <button type="submit" disabled={pending || !selectedTypeId} className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
        {pending ? "생성 중..." : "비교 만들기"}
      </button>
    </form>
  );
}
