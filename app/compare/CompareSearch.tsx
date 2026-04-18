"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchComparison } from "@/lib/actions/compare-search";
import { createComparison } from "@/lib/actions/comparison";
import { ProductImage } from "@/app/products/ProductImage";

type ProductOption = { id: string; name: string; imageUrl: string | null; brandId: string; brandName: string; typeName: string; typeId: string };

function ProductSelector({ label, color, typeId, brandId, setBrandId, productId, setProductId, products, excludeId, brands }: {
  label: string;
  color: "blue" | "red";
  typeId: string;
  brandId: string;
  setBrandId: (v: string) => void;
  productId: string;
  setProductId: (v: string) => void;
  products: ProductOption[];
  excludeId: string;
  brands: { id: string; name: string }[];
}) {
  const filteredByBrand = brandId ? products.filter((p) => p.brandId === brandId) : products;
  const available = filteredByBrand.filter((p) => p.id !== excludeId);
  const selected = products.find((p) => p.id === productId);
  const borderColor = color === "blue" ? "border-blue-200" : "border-red-200";
  const labelColor = color === "blue" ? "text-blue-600" : "text-red-600";
  const labelBg = color === "blue" ? "bg-blue-50" : "bg-red-50";

  return (
    <div className={`flex-1 rounded-xl border ${borderColor} p-4 space-y-3`}>
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-bold ${labelColor} ${labelBg} px-2 py-0.5 rounded`}>{label}</span>
      </div>

      {selected ? (
        <ProductImage imageUrl={selected.imageUrl} typeName={selected.typeName} productName={selected.name} size="sm" />
      ) : (
        <div className="w-full h-28 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
          <span className="text-xs text-gray-400">제품을 선택하세요</span>
        </div>
      )}

      {selected && (
        <div className="text-center">
          <p className="text-xs text-muted">{selected.brandName}</p>
          <p className="text-sm font-bold text-foreground leading-tight">{selected.name}</p>
        </div>
      )}

      <div className="space-y-2">
        <select
          value={brandId}
          onChange={(e) => { setBrandId(e.target.value); setProductId(""); }}
          disabled={!typeId}
          className="h-9 w-full px-2 border border-[#d4d4d4] rounded-lg text-xs bg-white focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-muted"
        >
          <option value="">{typeId ? "브랜드 전체" : "종류를 먼저 선택"}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          disabled={!typeId}
          className="h-9 w-full px-2 border border-[#d4d4d4] rounded-lg text-xs bg-white focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-muted"
        >
          <option value="">모델 선택</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>{p.brandName} {p.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CompareSearch({ products, isLoggedIn }: { products: ProductOption[]; isLoggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typeId, setTypeId] = useState("");
  const [brandAId, setBrandAId] = useState("");
  const [brandBId, setBrandBId] = useState("");
  const [productAId, setProductAId] = useState("");
  const [productBId, setProductBId] = useState("");
  const [result, setResult] = useState<"found" | "not_found" | "creating" | null>(null);
  const [foundId, setFoundId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const types = Array.from(new Map(products.map((p) => [p.typeId, p.typeName])));
  const typeProducts = typeId ? products.filter((p) => p.typeId === typeId) : [];
  const brands = Array.from(new Map(typeProducts.map((p) => [p.brandId, p.brandName]))).map(([id, name]) => ({ id, name }));

  function resetAll() {
    setTypeId(""); setBrandAId(""); setBrandBId("");
    setProductAId(""); setProductBId("");
    setResult(null); setFoundId(null); setError(null);
  }

  function handleTypeChange(id: string) {
    setTypeId(id); setBrandAId(""); setBrandBId("");
    setProductAId(""); setProductBId("");
    setResult(null); setFoundId(null); setError(null);
  }

  function handleSearch() {
    if (!productAId || !productBId) return;
    startTransition(async () => {
      const id = await searchComparison(productAId, productBId);
      if (id) { router.push(`/compare/${id}`); }
      else { setResult("not_found"); }
    });
  }

  function handleCreate() {
    if (!productAId || !productBId || !isLoggedIn) return;
    setResult("creating");
    setError(null);
    const formData = new FormData();
    formData.set("productAId", productAId);
    formData.set("productBId", productBId);
    startTransition(async () => {
      const res = await createComparison(undefined, formData);
      // If we reach here, redirect didn't happen — there was an error
      if (res?.message) {
        setError(res.message);
        setResult("not_found");
      }
    });
  }

  const selectedA = products.find((p) => p.id === productAId);
  const selectedB = products.find((p) => p.id === productBId);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) resetAll(); }}
        className={`w-full h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
          open ? "border-primary bg-primary text-white" : "border-[#d4d4d4] bg-white text-foreground hover:border-primary"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        두 제품 비교 검색
      </button>

      {open && (
        <div className="mt-3 bg-white rounded-2xl border border-[#d4d4d4] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-[#f8fafc]">
            <h3 className="text-sm font-bold text-foreground">비교할 두 제품을 선택하세요</h3>
            <p className="text-[11px] text-muted mt-0.5">종류 → 브랜드 → 모델 순서로 선택해주세요</p>
          </div>

          <div className="p-5 space-y-4">
            {/* 1단계: 종류 선택 */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold mr-1">1</span>
                종류 선택
              </label>
              <div className="flex flex-wrap gap-1.5">
                {types.map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTypeChange(id)}
                    className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all ${
                      typeId === id ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2단계+3단계: 제품 A, B 선택 */}
            {typeId && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                  <span className="text-xs font-semibold text-foreground">브랜드 &amp; 모델 선택</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <ProductSelector
                    label="제품 A"
                    color="blue"
                    typeId={typeId}
                    brandId={brandAId}
                    setBrandId={setBrandAId}
                    productId={productAId}
                    setProductId={(v) => { setProductAId(v); setResult(null); }}
                    products={typeProducts}
                    excludeId={productBId}
                    brands={brands}
                  />

                  <div className="flex items-center justify-center shrink-0 sm:pt-8 py-2 sm:py-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-red-100 flex items-center justify-center">
                      <span className="text-xs font-black text-gray-500">VS</span>
                    </div>
                  </div>

                  <ProductSelector
                    label="제품 B"
                    color="red"
                    typeId={typeId}
                    brandId={brandBId}
                    setBrandId={setBrandBId}
                    productId={productBId}
                    setProductId={(v) => { setProductBId(v); setResult(null); }}
                    products={typeProducts}
                    excludeId={productAId}
                    brands={brands}
                  />
                </div>
              </>
            )}

            {/* 검색 버튼 */}
            {typeId && (
              <button
                type="button"
                onClick={handleSearch}
                disabled={!productAId || !productBId || pending}
                className="w-full h-11 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
              >
                {pending && !result ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                )}
                비교 검색
              </button>
            )}

            {/* 결과 */}
            {result === "found" && foundId && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-semibold text-green-700 mb-1">비교가 이미 존재합니다!</p>
                <p className="text-xs text-green-600 mb-3">{selectedA?.brandName} {selectedA?.name} vs {selectedB?.brandName} {selectedB?.name}</p>
                <button
                  type="button"
                  onClick={() => router.push(`/compare/${foundId}`)}
                  className="h-9 px-5 rounded-lg bg-green-600 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  비교 보러가기
                </button>
              </div>
            )}

            {result === "not_found" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <p className="text-sm font-semibold text-amber-700 mb-1">아직 비교가 없습니다</p>
                <p className="text-xs text-amber-600 mb-3">{selectedA?.brandName} {selectedA?.name} vs {selectedB?.brandName} {selectedB?.name}</p>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={pending}
                    className="h-9 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    비교 추가하기
                  </button>
                ) : (
                  <p className="text-xs text-muted">비교를 추가하려면 로그인이 필요합니다</p>
                )}
              </div>
            )}

            {result === "creating" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                <svg className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <p className="text-sm font-semibold text-blue-700">비교를 생성하고 있습니다...</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
