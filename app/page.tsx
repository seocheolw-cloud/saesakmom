import Link from "next/link";
import { Header } from "@/app/components/Header";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Static trending keywords (no search data in DB yet)
// ---------------------------------------------------------------------------
const TRENDING_KEYWORDS = [
  "수면교육", "이유식", "출산가방", "입덧", "신생아 목욕",
  "분유 추천", "기저귀 발진", "태교 음악", "산후조리원", "아기띠 추천",
];

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
async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

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

async function getCategoryPosts(
  categories: { name: string; slug: string }[]
): Promise<Record<string, { id: string; title: string; commentCount: number }[]>> {
  const result: Record<string, { id: string; title: string; commentCount: number }[]> = {};
  for (const cat of categories) {
    const posts = await prisma.post.findMany({
      where: { status: "ACTIVE", category: { slug: cat.slug } },
      include: { _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    if (posts.length > 0) {
      result[cat.name] = posts.map((p) => ({
        id: p.id,
        title: p.title,
        commentCount: p._count.comments,
      }));
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// PostCard component
// ---------------------------------------------------------------------------
function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="p-4 hover:bg-[#f8faff] transition-colors cursor-pointer border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold text-primary">{post.category.name}</span>
        <span className="text-xs text-muted">{post.createdAt.toLocaleDateString("ko-KR")}</span>
      </div>
      <h3 className="text-[15px] font-semibold text-foreground mb-1 line-clamp-1">{post.title}</h3>
      <p className="text-sm text-muted line-clamp-1 mb-2.5">{post.content}</p>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="font-medium text-foreground">{post.author.nickname}</span>
        <span>조회 {post.viewCount}</span>
        <span>좋아요 {post.likeCount}</span>
        <span>댓글 {post._count.comments}</span>
      </div>
    </article>
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
  const categories = await getCategories();
  const popularPosts = await getPopularPosts();
  const recentPosts = await getRecentPosts();
  const categoryPosts = await getCategoryPosts(categories);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 좌측: 메인 피드 */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 모바일 검색 */}
            <div className="md:hidden relative">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-full h-10 rounded-full border border-[#d4d4d4] pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-primary transition-colors"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* 인기글 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">인기글</h2>
                <Link href="/community?sort=popular" className="text-xs text-muted hover:text-primary transition-colors">
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
                <Link href="/community?sort=latest" className="text-xs text-muted hover:text-primary transition-colors">
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

            {/* 카테고리별 글 */}
            {Object.keys(categoryPosts).length > 0 && (
              <section>
                <h2 className="text-base font-bold text-foreground mb-3">카테고리별</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(categoryPosts).map(([category, posts]) => {
                    const cat = categories.find((c) => c.name === category);
                    return (
                      <div key={category} className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <h3 className="text-sm font-bold text-foreground">{category}</h3>
                          <Link
                            href={cat ? `/community/${cat.slug}` : `/community`}
                            className="text-xs text-muted hover:text-primary transition-colors"
                          >
                            더보기
                          </Link>
                        </div>
                        <ul>
                          {posts.map((post, i) => (
                            <li
                              key={post.id}
                              className={`px-4 py-2.5 hover:bg-[#f8faff] cursor-pointer transition-colors flex items-center justify-between ${
                                i < posts.length - 1 ? "border-b border-border" : ""
                              }`}
                            >
                              <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{post.title}</span>
                              <span className="text-xs text-muted shrink-0">댓글 {post.commentCount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* 우측: 사이드바 */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            {/* 실시간 인기 검색어 — 인기글 박스와 높이 맞춤 */}
            <div className="bg-white rounded-xl border border-[#d4d4d4] p-5 sticky top-[88px] mt-[36px]">
              <h2 className="text-sm font-bold text-foreground mb-4">실시간 인기 검색어</h2>
              <ol className="space-y-2">
                {TRENDING_KEYWORDS.map((keyword, i) => (
                  <li
                    key={keyword}
                    className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    <span className={`w-5 text-center text-xs font-bold ${i < 3 ? "text-primary" : "text-muted"}`}>
                      {i + 1}
                    </span>
                    <span className="text-foreground">{keyword}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
