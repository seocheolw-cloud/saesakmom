"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type SpecField = { id: string; name: string; unit: string | null };
type Brand = { id: string; name: string };
type TypeWithRelations = { id: string; name: string; brands: Brand[]; specFields: SpecField[] };
type ExistingProduct = {
  id: string; name: string; description: string | null; price: number | null;
  imageUrl: string | null; typeId: string; brandId: string;
  specValues: { fieldId: string; value: string }[];
};

export function ProductForm({ types, product }: { types: TypeWithRelations[]; product?: ExistingProduct }) {
  const [selectedTypeId, setSelectedTypeId] = useState(product?.typeId ?? "");
  const selectedType = types.find((t) => t.id === selectedTypeId);
  const actionFn = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, action, pending] = useActionState<AdminFormState, FormData>(actionFn, undefined);
  const specValueMap = new Map(product?.specValues.map((sv) => [sv.fieldId, sv.value]) ?? []);

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1">종류</label>
        <select name="typeId" value={selectedTypeId} onChange={(e) => setSelectedTypeId(e.target.value)} required className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
          <option value="">선택하세요</option>
          {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
        {state?.errors?.typeId && <p className="text-xs text-error mt-1">{state.errors.typeId[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">브랜드</label>
        <select name="brandId" defaultValue={product?.brandId ?? ""} required className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary">
          <option value="">선택하세요</option>
          {(selectedType?.brands ?? []).map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
        </select>
        {state?.errors?.brandId && <p className="text-xs text-error mt-1">{state.errors.brandId[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">상품명</label>
        <input name="name" defaultValue={product?.name ?? ""} required className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
        {state?.errors?.name && <p className="text-xs text-error mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">가격 (원)</label>
        <input name="price" type="number" min={0} defaultValue={product?.price ?? ""} className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">이미지 URL</label>
        <input name="imageUrl" defaultValue={product?.imageUrl ?? ""} className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">설명</label>
        <textarea name="description" rows={3} defaultValue={product?.description ?? ""} className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary" />
      </div>
      {selectedType && selectedType.specFields.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted mb-2">스펙 정보</label>
          <div className="space-y-2">
            {selectedType.specFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-sm text-foreground w-32 shrink-0">{field.name}{field.unit ? ` (${field.unit})` : ""}</span>
                <input name={`spec_${field.id}`} defaultValue={specValueMap.get(field.id) ?? ""} className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
            ))}
          </div>
        </div>
      )}
      {state?.message && state.message !== "" && <p className="text-sm text-error">{state.message}</p>}
      <button type="submit" disabled={pending} className="h-10 px-6 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
        {pending ? "저장 중..." : product ? "수정" : "등록"}
      </button>
    </form>
  );
}
