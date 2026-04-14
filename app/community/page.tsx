import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

const POSTS_PER_PAGE = 10;

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
        <div className="flex gap-1 overflow-x-auto mb-4 bg-white rounded-xl border border-[#d4d4d4] p-1">
          <Link
            href="/community"
            className={`shrink-0 h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center transition-colors ${
              isAll
                ? "bg-primary text-white"
                : "text-[#5F6B7C] hover:bg-gray-50"
            }`}
          >
            전체
          </Link>
          <Link
            href="/community?sort=popular"
            className={`shrink-0 h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center transition-colors ${
              isPopular
                ? "bg-primary text-white"
                : "text-[#5F6B7C] hover:bg-gray-50"
            }`}
          >
            인기글
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/community?category=${cat.slug}`}
              className={`shrink-0 h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center transition-colors ${
                categorySlug === cat.slug
                  ? "bg-primary text-white"
                  : "text-[#5F6B7C] hover:bg-gray-50"
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
          {posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              게시글이 없습니다.
            </div>
          ) : (
            posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className={`block p-4 hover:bg-[#f8faff] transition-colors ${
                  i < posts.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-primary">
                    {post.category.name}
                  </span>
                  <span className="text-xs text-muted">
                    {post.createdAt.toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-foreground mb-1 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-sm text-muted line-clamp-1 mb-2.5">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="font-medium text-foreground">
                    {post.author.nickname}
                  </span>
                  <span>조회 {post.viewCount}</span>
                  <span>좋아요 {post.likeCount}</span>
                  <span>댓글 {post._count.comments}</span>
                </div>
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
