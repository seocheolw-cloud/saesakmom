import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "posts" } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, nickname: true, createdAt: true },
  });

  if (!user) notFound();

  let posts;
  if (tab === "comments") {
    const comments = await prisma.comment.findMany({
      where: { authorId: id, status: "ACTIVE" },
      select: { postId: true },
      distinct: ["postId"],
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    posts = await prisma.post.findMany({
      where: { id: { in: comments.map((c) => c.postId) }, status: "ACTIVE" },
      include: {
        author: { select: { nickname: true } },
        category: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (tab === "likes") {
    const likes = await prisma.like.findMany({
      where: { userId: id },
      select: { postId: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    posts = await prisma.post.findMany({
      where: { id: { in: likes.map((l) => l.postId) }, status: "ACTIVE" },
      include: {
        author: { select: { nickname: true } },
        category: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    posts = await prisma.post.findMany({
      where: { authorId: id, status: "ACTIVE" },
      include: {
        author: { select: { nickname: true } },
        category: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  const tabs = [
    { key: "posts", label: "작성글" },
    { key: "comments", label: "댓글단 글" },
    { key: "likes", label: "좋아요한 글" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        {/* 유저 정보 */}
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-6 mb-6">
          <h1 className="text-xl font-bold text-foreground">{user.nickname}</h1>
          <p className="text-sm text-muted mt-1">
            가입일:{" "}
            {user.createdAt.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-5">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/user/${id}?tab=${t.key}`}
              className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
                tab === t.key
                  ? "bg-foreground text-white"
                  : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              {tab === "posts" && "작성한 글이 없습니다."}
              {tab === "comments" && "댓글단 글이 없습니다."}
              {tab === "likes" && "좋아요한 글이 없습니다."}
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
      </main>
    </div>
  );
}
