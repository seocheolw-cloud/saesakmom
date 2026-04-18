import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import { ProductFilter } from "./ProductFilter";
import { ProductImage } from "./ProductImage";
import { logSearch } from "@/lib/actions/search";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ type?: string; brand?: string; q?: string; page?: string; minPrice?: string; maxPrice?: string; sort?: string }> }) {
  const params = await searchParams;
  const typeSlug = params.type;
  const brandFilter = params.brand;
  const query = (params.q?.trim() || "").slice(0, 100);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const minPriceRaw = parseInt(params.minPrice ?? "", 10);
  const maxPriceRaw = parseInt(params.maxPrice ?? "", 10);
  const minPrice = Number.isFinite(minPriceRaw) ? minPriceRaw : undefined;
  const maxPrice = Number.isFinite(maxPriceRaw) ? maxPriceRaw : undefined;
  const sortParam = params.sort || "";

  if (query) { logSearch(query).catch(() => {}); }

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(typeSlug && { type: { slug: typeSlug } }),
    ...(brandFilter && { brand: { name: brandFilter } }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { brand: { name: { contains: query, mode: "insensitive" as const } } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sortParam) {
    case "price_asc":
      orderBy = { price: { sort: "asc", nulls: "last" } };
      break;
    case "price_desc":
      orderBy = { price: { sort: "desc", nulls: "last" } };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [types, products, totalCount] = await Promise.all([
    prisma.productType.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        brands: { orderBy: { name: "asc" } },
        _count: { select: { products: true } },
      },
    }),
    prisma.product.findMany({
      where,
      include: { type: { select: { name: true, slug: true } }, brand: { select: { name: true } } },
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filterTypes = types.map((t) => ({ slug: t.slug, name: t.name, brands: t.brands.map((b) => ({ id: b.id, name: b.name })) }));

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    const get = (key: string, current: string | undefined) => key in overrides ? overrides[key] : current;
    const v = (key: string, current: string | undefined) => { const val = get(key, current); if (val) p[key] = val; };
    v("type", typeSlug);
    v("brand", brandFilter);
    v("q", query || undefined);
    v("minPrice", params.minPrice);
    v("maxPrice", params.maxPrice);
    v("sort", sortParam || undefined);
    if (overrides.page) p.page = overrides.page;
    const qs = new URLSearchParams(p).toString();
    return qs ? `/products?${qs}` : "/products";
  }

  const activeFilters: { label: string; clearKey: string }[] = [];
  if (minPrice !== undefined || maxPrice !== undefined) {
    const label = minPrice !== undefined && maxPrice !== undefined ? `${minPrice.toLocaleString()}~${maxPrice.toLocaleString()}원` : minPrice !== undefined ? `${minPrice.toLocaleString()}원~` : `~${maxPrice!.toLocaleString()}원`;
    activeFilters.push({ label, clearKey: "price" });
  }
  if (sortParam) {
    const sortLabels: Record<string, string> = { price_asc: "가격 낮은순", price_desc: "가격 높은순", name_asc: "이름순" };
    activeFilters.push({ label: sortLabels[sortParam] || sortParam, clearKey: "sort" });
  }

  function clearFilterHref(key: string) {
    if (key === "type") return buildHref({ type: undefined, brand: undefined, page: undefined });
    if (key === "brand") return buildHref({ brand: undefined, page: undefined });
    if (key === "price") return buildHref({ minPrice: undefined, maxPrice: undefined, page: undefined });
    if (key === "sort") return buildHref({ sort: undefined, page: undefined });
    return "/products";
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-foreground mb-5">육아용품</h1>

        {/* 검색 + 조건 버튼 */}
        <div className="flex gap-2 mb-4">
          <form action="/products" className="flex-1">
            {typeSlug && <input type="hidden" name="type" value={typeSlug} />}
            {brandFilter && <input type="hidden" name="brand" value={brandFilter} />}
            {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
            {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
            {sortParam && <input type="hidden" name="sort" value={sortParam} />}
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="상품명, 브랜드로 검색"
                maxLength={100}
                className="w-full h-11 rounded-xl border border-[#d4d4d4] bg-white pl-11 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          <ProductFilter types={filterTypes} />
        </div>

        {/* 활성 필터 태그 */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeFilters.map((f) => (
              <Link
                key={f.clearKey}
                href={clearFilterHref(f.clearKey)}
                className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                {f.label}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Link>
            ))}
            {activeFilters.length > 1 && (
              <Link href="/products" className="text-xs text-muted hover:text-foreground transition-colors">전체 초기화</Link>
            )}
          </div>
        )}

        {query && (
          <div className="mb-4 text-sm text-muted">
            &quot;{query}&quot; 검색 결과 {totalCount}건
            <Link href={buildHref({ q: undefined })} className="ml-2 text-primary hover:underline text-xs">초기화</Link>
          </div>
        )}

        <div className="flex gap-6">
          {/* 좌측: 카테고리 사이드바 */}
          <aside className="hidden md:block w-[220px] shrink-0">
            <nav className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden sticky top-[108px]">
              <Link
                href={buildHref({ type: undefined, brand: undefined, page: undefined })}
                className={`flex items-center justify-between px-4 py-3 text-sm font-semibold border-b border-border transition-colors ${
                  !typeSlug ? "bg-primary text-white" : "text-foreground hover:bg-[#f8faff]"
                }`}
              >
                <span>전체</span>
                <span className={`text-xs ${!typeSlug ? "text-white/70" : "text-muted"}`}>{types.reduce((s, t) => s + t._count.products, 0)}</span>
              </Link>
              {types.map((t) => {
                const isActive = typeSlug === t.slug;
                return (
                  <div key={t.slug}>
                    <Link
                      href={isActive && !brandFilter ? buildHref({ type: undefined, brand: undefined, page: undefined }) : buildHref({ type: t.slug, brand: undefined, page: undefined })}
                      className={`flex items-center justify-between px-4 py-3 text-sm border-b border-border transition-colors ${
                        isActive ? "bg-blue-50 text-primary font-semibold" : "text-foreground hover:bg-[#f8faff]"
                      }`}
                    >
                      <span>{t.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted">{t._count.products}</span>
                        {isActive ? (
                          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        )}
                      </div>
                    </Link>
                    {isActive && t.brands.length > 0 && (
                      <div className="bg-[#f8fafc] border-b border-border">
                        {t.brands.map((b) => (
                          <Link
                            key={b.id}
                            href={brandFilter === b.name ? buildHref({ brand: undefined, page: undefined }) : buildHref({ brand: b.name, page: undefined })}
                            className={`flex items-center px-4 pl-8 py-2 text-[13px] transition-colors ${
                              brandFilter === b.name ? "text-primary font-semibold bg-blue-50/50" : "text-muted hover:text-foreground hover:bg-white/50"
                            }`}
                          >
                            {brandFilter === b.name && (
                              <svg className="w-3 h-3 mr-1.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            )}
                            {b.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* 모바일: 카테고리 가로 탭 */}
          <div className="md:hidden w-full space-y-4 min-w-0">
            <div className="flex flex-wrap gap-2">
              <Link href={buildHref({ type: undefined, brand: undefined, page: undefined })} className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${!typeSlug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4]"}`}>전체</Link>
              {types.map((t) => (
                <Link key={t.slug} href={buildHref({ type: t.slug, brand: undefined, page: undefined })} className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${typeSlug === t.slug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4]"}`}>{t.name}</Link>
              ))}
            </div>
            {typeSlug && (() => {
              const activeType = types.find(t => t.slug === typeSlug);
              if (!activeType || activeType.brands.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1.5">
                  {activeType.brands.map((b) => (
                    <Link
                      key={b.id}
                      href={brandFilter === b.name ? buildHref({ brand: undefined, page: undefined }) : buildHref({ brand: b.name, page: undefined })}
                      className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center transition-all ${
                        brandFilter === b.name ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"
                      }`}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              );
            })()}
            <MobileProductList products={products} totalCount={totalCount} totalPages={totalPages} page={page} buildHref={buildHref} />
          </div>

          {/* 우측: 상품 그리드 */}
          <div className="hidden md:block flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted">{totalCount}개 상품</span>
              {sortParam && (
                <span className="text-xs text-muted">
                  {{ price_asc: "가격 낮은순", price_desc: "가격 높은순", name_asc: "이름순" }[sortParam]}
                </span>
              )}
            </div>
            {products.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">등록된 상품이 없습니다.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl border border-[#d4d4d4] overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
                    <ProductImage imageUrl={p.imageUrl} typeName={p.type.name} productName={p.name} size="md" />
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[11px] font-semibold text-primary bg-blue-50 px-1.5 py-0.5 rounded">{p.type.name}</span>
                        <span className="text-[11px] text-muted">{p.brand.name}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
                      {p.price ? (
                        <p className="text-[15px] font-bold text-foreground">{p.price.toLocaleString()}<span className="text-xs font-medium ml-0.5">원</span></p>
                      ) : (
                        <p className="text-xs text-muted">가격 미정</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MobileProductList({ products, totalCount, totalPages, page, buildHref }: {
  products: { id: string; name: string; imageUrl: string | null; price: number | null; type: { name: string; slug: string }; brand: { name: string } }[];
  totalCount: number;
  totalPages: number;
  page: number;
  buildHref: (o: Record<string, string | undefined>) => string;
}) {
  return (
    <>
      <span className="text-sm text-muted">{totalCount}개 상품</span>
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">등록된 상품이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl border border-[#d4d4d4] overflow-hidden hover:shadow-md transition-all">
              <ProductImage imageUrl={p.imageUrl} typeName={p.type.name} productName={p.name} size="sm" />
              <div className="p-3">
                <div className="text-[11px] text-muted mb-0.5">{p.brand.name}</div>
                <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">{p.name}</h3>
                {p.price ? (
                  <p className="text-[13px] font-bold text-foreground">{p.price.toLocaleString()}<span className="text-[10px] font-medium ml-0.5">원</span></p>
                ) : (
                  <p className="text-[11px] text-muted">가격 미정</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      )}
    </>
  );
}

function Pagination({ page, totalPages, buildHref }: { page: number; totalPages: number; buildHref: (o: Record<string, string | undefined>) => string }) {
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6">
      {page > 1 && (
        <Link href={buildHref({ page: String(page - 1) })} className="h-9 px-3 rounded-lg border border-[#d4d4d4] text-sm text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">이전</Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 inline-flex items-center justify-center text-sm text-muted">...</span>
        ) : (
          <Link key={p} href={buildHref({ page: String(p) })} className={`h-9 w-9 rounded-lg text-sm font-medium inline-flex items-center justify-center transition-colors ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary hover:text-primary"}`}>{p}</Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildHref({ page: String(page + 1) })} className="h-9 px-3 rounded-lg border border-[#d4d4d4] text-sm text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">다음</Link>
      )}
    </div>
  );
}
