"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type TypeOption = { slug: string; name: string; brands: { id: string; name: string; count: number }[] };

export function ProductFilter({ types }: { types: TypeOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentType = searchParams.get("type") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSort = searchParams.get("sort") || "";

  const [type, setType] = useState(currentType);
  const [brand, setBrand] = useState(currentBrand);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [sort, setSort] = useState(currentSort);

  const selectedType = types.find((t) => t.slug === type);
  const brands = selectedType?.brands ?? [];

  const activeFilterCount = [currentType, currentBrand, currentMinPrice || currentMaxPrice, currentSort].filter(Boolean).length;

  function apply() {
    const p = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (brand) p.set("brand", brand);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (sort) p.set("sort", sort);
    router.push(`/products?${p.toString()}`);
    setOpen(false);
  }

  function reset() {
    setType("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    const p = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) p.set("q", q);
    router.push(p.toString() ? `/products?${p.toString()}` : "/products");
    setOpen(false);
  }

  const pricePresets = [
    { label: "~5만원", min: "", max: "50000" },
    { label: "5~15만원", min: "50000", max: "150000" },
    { label: "15~30만원", min: "150000", max: "300000" },
    { label: "30~50만원", min: "300000", max: "500000" },
    { label: "50만원~", min: "500000", max: "" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`h-11 px-4 rounded-xl border text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
          open || activeFilterCount > 0
            ? "border-primary bg-primary text-white"
            : "border-[#d4d4d4] bg-white text-foreground hover:border-primary"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        조건
        {activeFilterCount > 0 && (
          <span className={`w-5 h-5 rounded-full text-[11px] font-bold inline-flex items-center justify-center ${
            open || activeFilterCount > 0 ? "bg-white text-primary" : "bg-primary text-white"
          }`}>
            {activeFilterCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[360px] bg-white rounded-t-2xl sm:rounded-xl border border-[#d4d4d4] shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">상세 조건</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* 분류 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">분류</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setType(""); setBrand(""); }}
                    className={`h-7 px-3 rounded-full text-[12px] font-medium transition-all ${
                      !type ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                    }`}
                  >
                    전체
                  </button>
                  {types.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => { setType(t.slug); setBrand(""); }}
                      className={`h-7 px-3 rounded-full text-[12px] font-medium transition-all ${
                        type === t.slug ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 브랜드 */}
              {type && brands.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">브랜드</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBrand("")}
                      className={`h-7 px-3 rounded-full text-[12px] font-medium transition-all ${
                        !brand ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                      }`}
                    >
                      전체
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBrand(brand === b.name ? "" : b.name)}
                        className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center gap-1 transition-all ${
                          brand === b.name ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                        }`}
                      >
                        {b.name}
                        <span className={`text-[11px] ${brand === b.name ? "text-white/70" : "text-[#5F6B7C]/60"}`}>({b.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 가격 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">가격</label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pricePresets.map((p) => {
                    const isActive = minPrice === p.min && maxPrice === p.max;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          if (isActive) { setMinPrice(""); setMaxPrice(""); }
                          else { setMinPrice(p.min); setMaxPrice(p.max); }
                        }}
                        className={`h-7 px-3 rounded-full text-[12px] font-medium transition-all ${
                          isActive ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="최소"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 min-w-0 h-8 px-2 rounded-lg border border-[#d4d4d4] text-[11px] text-foreground focus:outline-none focus:border-primary"
                  />
                  <span className="text-[11px] text-muted shrink-0">~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 min-w-0 h-8 px-2 rounded-lg border border-[#d4d4d4] text-[11px] text-foreground focus:outline-none focus:border-primary"
                  />
                  <span className="text-[11px] text-muted shrink-0">원</span>
                </div>
              </div>

              {/* 정렬 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">정렬</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "", label: "최신순" },
                    { value: "price_asc", label: "가격 낮은순" },
                    { value: "price_desc", label: "가격 높은순" },
                    { value: "name_asc", label: "이름순" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSort(s.value)}
                      className={`h-7 px-3 rounded-full text-[12px] font-medium transition-all ${
                        sort === s.value ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-5 py-3.5 border-t border-border bg-[#f8fafc]">
              <button
                type="button"
                onClick={reset}
                className="flex-1 h-10 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-muted hover:border-foreground hover:text-foreground transition-colors"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 h-10 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                적용하기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
