import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";
import { ProductImage } from "@/app/products/ProductImage";
import { logSearch } from "@/lib/actions/search";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q?.trim() || "").slice(0, 100);

  if (!query) {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        <Header />
        <main className="max-w-[800px] mx-auto px-4 py-8">
          <h1 className="text-lg font-bold text-foreground mb-4">통합 검색</h1>
          <p className="text-sm text-muted">검색어를 입력해주세요.</p>
        </main>
      </div>
    );
  }

  logSearch(query).catch(() => {});

  const searchFilter = { contains: query, mode: "insensitive" as const };

  const [posts, products, comparisons] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: searchFilter },
          { content: searchFilter },
          { author: { nickname: searchFilter } },
        ],
      },
      include: {
        author: { select: { nickname: true } },
        category: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { name: searchFilter },
          { brand: { name: searchFilter } },
          { description: searchFilter },
        ],
      },
      include: {
        type: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.productComparison.findMany({
      where: {
        OR: [
          { productA: { name: searchFilter } },
          { productB: { name: searchFilter } },
          { productA: { brand: { name: searchFilter } } },
          { productB: { brand: { name: searchFilter } } },
        ],
      },
      include: {
        productA: { select: { name: true, imageUrl: true, brand: { select: { name: true } }, type: { select: { name: true } } } },
        productB: { select: { name: true, imageUrl: true, brand: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalCount = posts.length + products.length + comparisons.length;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-lg font-bold text-foreground mb-1">
          &quot;{query}&quot; 검색 결과
        </h1>
        <p className="text-xs text-muted mb-6">총 {totalCount}건</p>

        {totalCount === 0 && (
          <div className="bg-white rounded-xl border border-[#d4d4d4] p-12 text-center">
            <p className="text-sm text-muted mb-2">검색 결과가 없습니다.</p>
            <p className="text-xs text-muted">다른 검색어로 시도해보세요.</p>
          </div>
        )}

        {/* 커뮤니티 */}
        {posts.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">커뮤니티 ({posts.length})</h2>
              <Link href={`/community?q=${encodeURIComponent(query)}`} className="text-xs text-muted hover:text-primary transition-colors">더보기</Link>
            </div>
            <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
              {posts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className={`block px-4 py-3 hover:bg-[#f8faff] transition-colors ${i < posts.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-primary bg-blue-50 px-1.5 py-0.5 rounded">{post.category.name}</span>
                    <span className="text-[11px] text-muted">{post.author.nickname}</span>
                    <span className="text-[11px] text-muted">{post.createdAt.toLocaleDateString("ko-KR")}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted line-clamp-1 mt-0.5">{post.content.replace(/\[(image|video):[^\]]+\]/g, "").trim()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 육아용품 */}
        {products.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">육아용품 ({products.length})</h2>
              <Link href={`/products?q=${encodeURIComponent(query)}`} className="text-xs text-muted hover:text-primary transition-colors">더보기</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl border border-[#d4d4d4] overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
                  <ProductImage imageUrl={p.imageUrl} typeName={p.type.name} productName={p.name} size="sm" />
                  <div className="p-2.5">
                    <p className="text-[11px] text-muted">{p.brand.name}</p>
                    <p className="text-xs font-semibold text-foreground line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">{p.name}</p>
                    {p.price && <p className="text-xs font-bold text-foreground mt-1">{p.price.toLocaleString()}<span className="text-[10px] font-normal ml-0.5">원</span></p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 비교 */}
        {comparisons.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">비교 투표 ({comparisons.length})</h2>
              <Link href="/compare" className="text-xs text-muted hover:text-primary transition-colors">더보기</Link>
            </div>
            <div className="space-y-3">
              {comparisons.map((c) => {
                const total = c.voteACount + c.voteBCount;
                const pctA = total > 0 ? Math.round((c.voteACount / total) * 100) : 50;
                const pctB = 100 - pctA;
                return (
                  <Link key={c.id} href={`/compare/${c.id}`} className="block bg-white rounded-xl border border-[#d4d4d4] p-4 hover:shadow-md hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{c.productA.type.name}</span>
                      <span className="text-[11px] text-muted">{total}표</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className="font-medium text-foreground flex-1 text-center">{c.productA.brand.name} {c.productA.name}</span>
                      <span className="text-xs font-bold text-muted">VS</span>
                      <span className="font-medium text-foreground flex-1 text-center">{c.productB.brand.name} {c.productB.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-500">{pctA}%</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-400 rounded-l-full" style={{ width: `${pctA}%` }} />
                        <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${pctB}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-red-500">{pctB}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
