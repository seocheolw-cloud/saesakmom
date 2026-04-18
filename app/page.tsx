import Link from "next/link";
import { Header } from "@/app/components/Header";
import { TrendingKeywords } from "@/app/components/TrendingKeywords";
import { ProductImage } from "@/app/products/ProductImage";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PostSummary = {
  id: string;
  title: string;
  content: string;
  author: { nickname: string };
  category: { name: string };
  createdAt: Date;
  viewCount: number;
  likeCount: number;
  _count: { comments: number };
};

// ---------------------------------------------------------------------------
// Cached data-fetching helpers
// ---------------------------------------------------------------------------
async function getPopularPosts(): Promise<PostSummary[]> {
  const POPULAR_THRESHOLD = 20;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "posts"
    WHERE status = 'ACTIVE'
      AND "likeCount" - "dislikeCount" >= ${POPULAR_THRESHOLD}
    ORDER BY "createdAt" DESC
    LIMIT 3
  `;
  if (rows.length === 0) return [];
  return prisma.post.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    include: {
      author: { select: { nickname: true } },
      category: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getRecentPosts(): Promise<PostSummary[]> {
  return prisma.post.findMany({
    where: { status: "ACTIVE" },
    include: {
      author: { select: { nickname: true } },
      category: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}


async function getLatestProducts() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      type: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

async function getLatestComparisons() {
  const comparisons = await prisma.productComparison.findMany({
    include: {
      productA: { select: { name: true, imageUrl: true, price: true, brand: { select: { name: true } }, type: { select: { name: true } } } },
      productB: { select: { name: true, imageUrl: true, price: true, brand: { select: { name: true } } } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const POPULAR_THRESHOLD = 10;
  const NEW_HOURS = 24;
  const now = Date.now();

  return comparisons
    .map((c) => {
      const total = c.voteACount + c.voteBCount;
      const isNew = now - new Date(c.createdAt).getTime() < NEW_HOURS * 60 * 60 * 1000;
      const isPopular = total + c._count.comments >= POPULAR_THRESHOLD;
      return { ...c, total, isNew, isPopular };
    })
    .sort((a, b) => {
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);
}

// ---------------------------------------------------------------------------
// PostCard component
// ---------------------------------------------------------------------------
function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/community/${post.id}`} className="block">
      <article className="p-4 hover:bg-[#f8faff] transition-colors cursor-pointer border-b border-border last:border-b-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-primary">{post.category.name}</span>
          <span className="text-xs text-muted">{post.createdAt.toLocaleDateString("ko-KR")}</span>
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1 line-clamp-1">{post.title}</h3>
        <p className="text-sm text-muted line-clamp-1 mb-2.5">{post.content.replace(/\[(image|video):[^\]]+\]/g, "").trim()}</p>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="font-medium text-foreground">{post.author.nickname}</span>
          <span>조회 {post.viewCount}</span>
          <span>좋아요 {post.likeCount}</span>
          <span>댓글 {post._count.comments}</span>
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-sm text-muted">{message}</div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function Home() {
  const [popularPosts, recentPosts, latestProducts, latestComparisons] = await Promise.all([
    getPopularPosts(),
    getRecentPosts(),
    getLatestProducts(),
    getLatestComparisons(),
  ]);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 좌측: 메인 피드 */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 모바일 검색 */}
            <form action="/search" className="md:hidden relative">
              <input
                type="text"
                name="q"
                placeholder="검색어를 입력하세요"
                className="w-full h-10 rounded-full border border-[#d4d4d4] pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-primary transition-colors"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* 인기글 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">인기글</h2>
                <Link href="/community?sort=popular" className="text-xs text-muted hover:text-primary transition-colors py-2 -my-2">
                  더보기
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
                {popularPosts.length === 0 ? (
                  <EmptyState message="아직 게시글이 없습니다" />
                ) : (
                  popularPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </section>

            {/* 최신글 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">최신글</h2>
                <Link href="/community?sort=latest" className="text-xs text-muted hover:text-primary transition-colors py-2 -my-2">
                  더보기
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
                {recentPosts.length === 0 ? (
                  <EmptyState message="아직 게시글이 없습니다" />
                ) : (
                  recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </section>

            {/* 육아용품 */}
            {latestProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-foreground">육아용품</h2>
                  <Link href="/products" className="text-xs text-muted hover:text-primary transition-colors py-2 -my-2">더보기</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {latestProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl border border-[#d4d4d4] overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
                      <ProductImage imageUrl={p.imageUrl} typeName={p.type.name} productName={p.name} size="sm" />
                      <div className="p-2.5">
                        <p className="text-[11px] text-muted">{p.brand.name}</p>
                        <p className="text-xs font-semibold text-foreground line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">{p.name}</p>
                        {p.price && <p className="text-xs font-bold text-foreground mt-1">{p.price.toLocaleString()}<span className="text-[11px] font-normal ml-0.5">원</span></p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 비교 투표 */}
            {latestComparisons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-foreground">비교 투표</h2>
                  <Link href="/compare" className="text-xs text-muted hover:text-primary transition-colors py-2 -my-2">더보기</Link>
                </div>
                <div className="space-y-4">
                  {latestComparisons.map((c) => {
                    const pctA = c.total > 0 ? Math.round((c.voteACount / c.total) * 100) : 50;
                    const pctB = 100 - pctA;
                    const winner = pctA > pctB ? "A" : pctB > pctA ? "B" : null;

                    return (
                      <Link key={c.id} href={`/compare/${c.id}`} className="group block bg-white rounded-xl border border-[#d4d4d4] overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
                        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{c.productA.type.name}</span>
                            {c.isPopular && <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">인기</span>}
                            {c.isNew && <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">N</span>}
                          </div>
                          <span className="text-[11px] text-muted">{c.total}표</span>
                        </div>
                        <div className="px-4 pb-3">
                          <div className="grid grid-cols-[1fr_32px_1fr] items-start gap-2">
                            <div className="flex flex-col items-center text-center">
                              <ProductImage imageUrl={c.productA.imageUrl} typeName={c.productA.type.name} productName={c.productA.name} size="sm" />
                              <p className="text-[11px] text-muted mt-1.5">{c.productA.brand.name}</p>
                              <p className="text-xs font-bold text-foreground leading-tight mt-0.5 line-clamp-2">{c.productA.name}</p>
                            </div>
                            <div className="flex items-center justify-center pt-10">
                              <span className="text-[11px] font-black text-gray-400">VS</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <ProductImage imageUrl={c.productB.imageUrl} typeName={c.productA.type.name} productName={c.productB.name} size="sm" />
                              <p className="text-[11px] text-muted mt-1.5">{c.productB.brand.name}</p>
                              <p className="text-xs font-bold text-foreground leading-tight mt-0.5 line-clamp-2">{c.productB.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`text-[11px] font-bold ${winner === "A" ? "text-blue-600" : "text-blue-400"}`}>{pctA}%</span>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                              <div className={`h-full rounded-l-full ${winner === "A" ? "bg-blue-500" : "bg-blue-300"}`} style={{ width: `${pctA}%` }} />
                              <div className={`h-full rounded-r-full ${winner === "B" ? "bg-red-500" : "bg-red-300"}`} style={{ width: `${pctB}%` }} />
                            </div>
                            <span className={`text-[11px] font-bold ${winner === "B" ? "text-red-600" : "text-red-400"}`}>{pctB}%</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* 우측: 사이드바 */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <TrendingKeywords />
          </aside>
        </div>
      </main>
    </div>
  );
}
