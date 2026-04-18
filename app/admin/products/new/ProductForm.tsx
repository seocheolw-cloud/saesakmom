"use client";

import { useActionState, useState, useEffect } from "react";
import { createProduct, updateProduct } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type SpecField = { id: string; name: string; unit: string | null };
type Brand = { id: string; name: string };
type TypeWithRelations = { id: string; name: string; brands: Brand[]; specFields: SpecField[] };
type ExistingProduct = {
  id: string; name: string; description: string | null; price: number | null;
  imageUrl: string | null; typeId: string; brandId: string; status: string;
  specValues: { fieldId: string; value: string }[];
};

export function ProductForm({ types, product }: { types: TypeWithRelations[]; product?: ExistingProduct }) {
  const [selectedTypeId, setSelectedTypeId] = useState(product?.typeId ?? "");
  const [selectedBrandId, setSelectedBrandId] = useState(product?.brandId ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const selectedType = types.find((t) => t.id === selectedTypeId);
  const actionFn = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, action, pending] = useActionState<AdminFormState, FormData>(actionFn, undefined);
  const specValueMap = new Map(product?.specValues.map((sv) => [sv.fieldId, sv.value]) ?? []);

  useEffect(() => {
    if (!product) setSelectedBrandId("");
  }, [selectedTypeId]);

  return (
    <form action={action} className="space-y-6">
      {/* 기본 정보 카드 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-[#f8fafc]">
          <h3 className="text-sm font-bold text-foreground">기본 정보</h3>
        </div>
        <div className="p-6 space-y-5">
          {/* 종류 + 브랜드 가로 배치 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                종류 <span className="text-red-400">*</span>
              </label>
              <select
                name="typeId"
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                required
                className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              >
                <option value="">종류를 선택하세요</option>
                {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
              {state?.errors?.typeId && <p className="text-xs text-red-500 mt-1">{state.errors.typeId[0]}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                브랜드 <span className="text-red-400">*</span>
              </label>
              <select
                name="brandId"
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                required
                disabled={!selectedTypeId}
                className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors disabled:bg-gray-50 disabled:text-muted"
              >
                <option value="">{selectedTypeId ? "브랜드를 선택하세요" : "종류를 먼저 선택하세요"}</option>
                {(selectedType?.brands ?? []).map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
              {state?.errors?.brandId && <p className="text-xs text-red-500 mt-1">{state.errors.brandId[0]}</p>}
            </div>
          </div>

          {/* 상품명 */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              상품명 <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              defaultValue={product?.name ?? ""}
              required
              placeholder="예: 시로나 T i-Size"
              className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
            {state?.errors?.name && <p className="text-xs text-red-500 mt-1">{state.errors.name[0]}</p>}
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">가격</label>
            <div className="relative">
              <input
                name="price"
                type="number"
                min={0}
                step={1000}
                defaultValue={product?.price ?? ""}
                placeholder="0"
                className="h-10 w-full px-3 pr-10 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">원</span>
            </div>
          </div>

          {/* 공개 상태 */}
          {product && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">공개 상태</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="PUBLISHED" defaultChecked={product.status === "PUBLISHED"} className="accent-primary" />
                  <span className="text-sm text-foreground">공개</span>
                  <span className="text-[11px] text-muted">- 사이트에 노출됩니다</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="DRAFT" defaultChecked={product.status !== "PUBLISHED"} className="accent-primary" />
                  <span className="text-sm text-foreground">비공개</span>
                  <span className="text-[11px] text-muted">- 관리자만 볼 수 있습니다</span>
                </label>
              </div>
            </div>
          )}

          {/* 설명 */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">상품 설명</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
              placeholder="상품에 대한 설명을 입력하세요"
              className="w-full px-3 py-2.5 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 이미지 카드 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-[#f8fafc]">
          <h3 className="text-sm font-bold text-foreground">상품 이미지</h3>
        </div>
        <div className="p-6">
          <div className="flex gap-4 items-start">
            {/* 미리보기 */}
            <div className="w-32 h-32 shrink-0 rounded-lg border-2 border-dashed border-[#d4d4d4] bg-[#f8fafc] flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="미리보기" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] text-gray-400">미리보기</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">이미지 파일</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { alert("5MB 이하 파일만 업로드 가능합니다."); return; }
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.url) setImageUrl(data.url);
                      else alert(data.error || "업로드 실패");
                    } catch { alert("업로드에 실패했습니다."); }
                    setUploading(false);
                  }}
                  className="w-full text-sm file:mr-3 file:h-9 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-primary-hover"
                  disabled={uploading}
                />
                <p className="text-[11px] text-muted mt-1.5">JPG, PNG, WebP, GIF (최대 5MB)</p>
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  업로드 중...
                </div>
              )}
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl("")} className="text-xs text-red-500 hover:opacity-75">이미지 제거</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 스펙 정보 카드 */}
      {selectedType && selectedType.specFields.length > 0 && (
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-[#f8fafc]">
            <h3 className="text-sm font-bold text-foreground">
              상세 스펙
              <span className="text-xs font-normal text-muted ml-2">— {selectedType.name}</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-[#d4d4d4] overflow-hidden">
              {selectedType.specFields.map((field, i) => (
                <div
                  key={field.id}
                  className={`flex items-center ${i > 0 ? "border-t border-border" : ""} ${i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}`}
                >
                  <div className="w-28 sm:w-40 shrink-0 px-4 py-3 text-sm font-medium text-foreground border-r border-border">
                    {field.name}
                    {field.unit && <span className="text-xs text-muted ml-1">({field.unit})</span>}
                  </div>
                  <div className="flex-1 px-3 py-2">
                    <input
                      name={`spec_${field.id}`}
                      defaultValue={specValueMap.get(field.id) ?? ""}
                      placeholder={`${field.name}${field.unit ? ` (${field.unit})` : ""} 입력`}
                      className="h-8 w-full px-2 border border-transparent rounded text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors hover:border-[#d4d4d4]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-2">각 항목을 클릭하여 값을 입력하세요. 비워두면 해당 스펙은 표시되지 않습니다.</p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {state?.message && state.message !== "" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <p className="text-sm text-red-600">{state.message}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 px-8 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {pending && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {pending ? "저장 중..." : product ? "상품 수정" : "상품 등록"}
        </button>
        <a
          href="/admin/products"
          className="h-11 px-6 rounded-lg border border-[#d4d4d4] text-sm font-medium text-muted hover:text-foreground hover:border-foreground transition-colors inline-flex items-center"
        >
          취소
        </a>
      </div>
    </form>
  );
}
