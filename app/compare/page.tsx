import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { ProductImage } from "@/app/products/ProductImage";
import { CompareSearch } from "./CompareSearch";

const PAGE_SIZE = 12;

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const params = await searchParams;
  const typeSlug = params.type;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where = typeSlug ? { productA: { type: { slug: typeSlug } } } : undefined;
  const RECENT_CAP = 100;

  const [session, types, allProducts, comparisons, totalCount] = await Promise.all([
    auth(),
    prisma.productType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, name: true, imageUrl: true, typeId: true, type: { select: { name: true } }, brand: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.productComparison.findMany({
      where,
      include: {
        productA: { select: { name: true, imageUrl: true, price: true, brand: { select: { name: true } }, type: { select: { name: true, slug: true } } } },
        productB: { select: { name: true, imageUrl: true, price: true, brand: { select: { name: true } } } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_CAP,
    }),
    prisma.productComparison.count({ where }),
  ]);

  const POPULAR_THRESHOLD = 10;
  const NEW_HOURS = 24;
  const now = Date.now();

  const sorted = comparisons
    .map((c) => {
      const total = c.voteACount + c.voteBCount;
      const commentCount = c._count.comments;
      const isNew = now - new Date(c.createdAt).getTime() < NEW_HOURS * 60 * 60 * 1000;
      const isPopular = total + commentCount >= POPULAR_THRESHOLD;
      return { ...c, total, commentCount, isNew, isPopular };
    })
    .sort((a, b) => {
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const skip = (page - 1) * PAGE_SIZE;
  const paginated = sorted.slice(skip, skip + PAGE_SIZE);
  const effectiveTotal = Math.min(totalCount, RECENT_CAP);
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));
  const baseHref = typeSlug ? `/compare?type=${typeSlug}` : "/compare";

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-lg font-bold text-foreground">비교 투표</h1>
          <p className="text-xs text-muted mt-0.5">어떤 제품이 더 좋을까요? 투표해보세요!</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <Link href="/compare" className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${!typeSlug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"}`}>전체</Link>
          {types.map((t) => (
            <Link key={t.slug} href={`/compare?type=${t.slug}`} className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${typeSlug === t.slug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"}`}>{t.name}</Link>
          ))}
        </div>

        <CompareSearch
          products={allProducts.map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl, brandId: p.brand.id, brandName: p.brand.name, typeName: p.type.name, typeId: p.typeId }))}
          isLoggedIn={!!session?.user}
        />

        {paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#d4d4d4] p-12 text-center">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
            <p className="text-sm text-muted mb-3">등록된 비교가 없습니다.</p>
            <p className="text-sm text-muted">위 검색으로 비교할 제품을 선택해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map((c) => {
              const pctA = c.total > 0 ? Math.round((c.voteACount / c.total) * 100) : 50;
              const pctB = 100 - pctA;
              const winner = pctA > pctB ? "A" : pctB > pctA ? "B" : null;

              return (
                <Link key={c.id} href={`/compare/${c.id}`} className="group block bg-white rounded-2xl border border-[#d4d4d4] overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{c.productA.type.name}</span>
                      {c.isPopular && (
                        <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">인기</span>
                      )}
                      {c.isNew && (
                        <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">N</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <span>{c.total}표</span>
                      {c.commentCount > 0 && <span>댓글 {c.commentCount}</span>}
                    </div>
                  </div>

                  {/* 상품 비교 카드 */}
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-[1fr_36px_1fr] items-start gap-3">
                      {/* A */}
                      <div className="flex flex-col items-center text-center">
                        <ProductImage imageUrl={c.productA.imageUrl} typeName={c.productA.type.name} productName={c.productA.name} size="sm" />
                        <p className="text-[11px] text-muted mt-2">{c.productA.brand.name}</p>
                        <p className="text-[13px] font-bold text-foreground leading-tight mt-0.5 line-clamp-2 min-h-[2.5em]">{c.productA.name}</p>
                        {c.productA.price && <p className="text-xs text-muted mt-1">{c.productA.price.toLocaleString()}원</p>}
                      </div>

                      {/* VS */}
                      <div className="flex items-center justify-center pt-16">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-muted">VS</span>
                        </div>
                      </div>

                      {/* B */}
                      <div className="flex flex-col items-center text-center">
                        <ProductImage imageUrl={c.productB.imageUrl} typeName={c.productA.type.name} productName={c.productB.name} size="sm" />
                        <p className="text-[11px] text-muted mt-2">{c.productB.brand.name}</p>
                        <p className="text-[13px] font-bold text-foreground leading-tight mt-0.5 line-clamp-2 min-h-[2.5em]">{c.productB.name}</p>
                        {c.productB.price && <p className="text-xs text-muted mt-1">{c.productB.price.toLocaleString()}원</p>}
                      </div>
                    </div>

                    {/* 투표 바 */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${winner === "A" ? "text-blue-600" : "text-blue-400"}`}>{pctA}%</span>
                          {winner === "A" && <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                          <div className={`h-full rounded-l-full transition-all ${winner === "A" ? "bg-blue-500" : "bg-blue-300"}`} style={{ width: `${pctA}%` }} />
                          <div className={`h-full rounded-r-full transition-all ${winner === "B" ? "bg-red-500" : "bg-red-300"}`} style={{ width: `${pctB}%` }} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {winner === "B" && <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                          <span className={`text-xs font-bold ${winner === "B" ? "text-red-600" : "text-red-400"}`}>{pctB}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}page=${page - 1}`} className="h-9 px-3 rounded-lg border border-[#d4d4d4] text-sm text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">이전</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}page=${p}`} className={`h-9 w-9 rounded-lg text-sm font-medium inline-flex items-center justify-center transition-colors ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary hover:text-primary"}`}>{p}</Link>
            ))}
            {page < totalPages && (
              <Link href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}page=${page + 1}`} className="h-9 px-3 rounded-lg border border-[#d4d4d4] text-sm text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">다음</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
