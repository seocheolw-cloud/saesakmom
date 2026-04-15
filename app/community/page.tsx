import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

const POSTS_PER_PAGE = 20;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sort = params.sort;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const session = await auth();

  const categories = await prisma.category.findMany({
    where: { slug: { not: "popular" } },
    orderBy: { sortOrder: "asc" },
  });

  const isPopular = sort === "popular";

  const where = {
    status: "ACTIVE" as const,
    ...(categorySlug && {
      category: { slug: categorySlug },
    }),
  };

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { nickname: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
      orderBy: isPopular ? { likeCount: "desc" } : { createdAt: "desc" },
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const isAll = !categorySlug && !isPopular;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Link
            href="/community"
            className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
              isAll
                ? "bg-foreground text-white"
                : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
            }`}
          >
            전체
          </Link>
          <Link
            href="/community?sort=popular"
            className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
              isPopular
                ? "bg-foreground text-white"
                : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
            }`}
          >
            인기글
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/community?category=${cat.slug}`}
              className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
                categorySlug === cat.slug
                  ? "bg-foreground text-white"
                  : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* 글쓰기 버튼 */}
        {session?.user && (
          <div className="flex justify-end mb-4">
            <Link
              href="/community/new"
              className="h-10 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
            >
              글쓰기
            </Link>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="hidden md:grid grid-cols-[1fr_100px_90px_60px_60px] gap-2 px-4 py-2.5 border-b border-border bg-[#f8fafc] text-xs font-semibold text-muted">
            <span>제목</span>
            <span className="text-center">글쓴이</span>
            <span className="text-center">등록일</span>
            <span className="text-center">추천</span>
            <span className="text-center">조회</span>
          </div>
          {posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              게시글이 없습니다.
            </div>
          ) : (
            posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className={`block md:grid md:grid-cols-[1fr_100px_90px_60px_60px] md:gap-2 md:items-center px-4 py-3 hover:bg-[#f8faff] transition-colors ${
                  i < posts.length - 1 ? "border-b border-border" : ""
                }`}
              >
                {/* 제목 + 댓글수 + 카테고리 */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-semibold text-primary shrink-0">
                    [{post.category.name}]
                  </span>
                  <span className="text-[14px] text-foreground truncate">
                    {post.title}
                  </span>
                  {Date.now() - post.createdAt.getTime() < 3600000 && (
                    <span className="shrink-0 text-red-500 text-[11px] font-bold">
                      N
                    </span>
                  )}
                  {post._count.comments > 0 && (
                    <span className="shrink-0 bg-gray-100 text-gray-500 text-[11px] font-medium px-1.5 py-0.5 rounded">
                      {post._count.comments}
                    </span>
                  )}
                </div>
                {/* 모바일: 메타 한줄 */}
                <div className="flex items-center gap-3 mt-1.5 md:hidden text-xs text-muted">
                  <span>{post.author.nickname}</span>
                  <span>{post.createdAt.toLocaleDateString("ko-KR")}</span>
                  <span>추천 {post.likeCount}</span>
                  <span>조회 {post.viewCount}</span>
                </div>
                {/* 데스크톱: 각 컬럼 */}
                <span className="hidden md:block text-xs text-muted text-center truncate">
                  {post.author.nickname}
                </span>
                <span className="hidden md:block text-xs text-muted text-center">
                  {post.createdAt.toLocaleDateString("ko-KR")}
                </span>
                <span className="hidden md:block text-xs text-muted text-center">
                  {post.likeCount}
                </span>
                <span className="hidden md:block text-xs text-muted text-center">
                  {post.viewCount}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const queryParts: string[] = [];
              if (categorySlug) queryParts.push(`category=${categorySlug}`);
              if (isPopular) queryParts.push("sort=popular");
              queryParts.push(`page=${page}`);
              const href = `/community?${queryParts.join("&")}`;

              return (
                <Link
                  key={page}
                  href={href}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold inline-flex items-center justify-center transition-colors ${
                    page === currentPage
                      ? "bg-primary text-white"
                      : "text-[#5F6B7C] hover:bg-gray-50 border border-[#d4d4d4]"
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
