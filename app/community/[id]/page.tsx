import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { DeleteButton } from "./DeleteButton";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { LevelBadge } from "@/components/LevelBadge";
import { ContentRenderer } from "@/app/components/ContentRenderer";
import { ReportPostButton } from "./ReportPostButton";
import { BackToListButton } from "./BackToListButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      author: { select: { id: true, nickname: true, level: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // 조회수 증가
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  // 좋아요/싫어요 여부
  const userLike = session?.user
    ? await prisma.like.findUnique({
        where: { userId_postId: { userId: session.user.id, postId: id } },
      })
    : null;
  const userReaction = userLike?.type ?? null;

  // 댓글 (대댓글 포함)
  const comments = await prisma.comment.findMany({
    where: { postId: id, status: "ACTIVE", parentId: null },
    include: {
      author: { select: { id: true, nickname: true, level: true } },
      likes: session?.user ? { where: { userId: session.user.id }, select: { type: true } } : false,
      replies: {
        where: { status: "ACTIVE" },
        include: {
          author: { select: { id: true, nickname: true, level: true } },
          likes: session?.user ? { where: { userId: session.user.id }, select: { type: true } } : false,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <BackToListButton />
        <div className="mb-4" />
        <article className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">
                {post.category.name}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Link
                href={`/user/${post.author.id}`}
                className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
              >
                <LevelBadge level={post.author.level} />{post.author.nickname}
              </Link>
              <span>
                {post.createdAt.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>조회 {post.viewCount + 1}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6">
            <ContentRenderer content={post.content} />
          </div>

          {/* 좋아요/싫어요 */}
          <div className="px-6 pb-4 flex justify-center">
            <LikeButton postId={post.id} userReaction={userReaction} likeCount={post.likeCount} dislikeCount={post.dislikeCount} />
          </div>

          {/* 액션 */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <div>
              {session?.user && !isAuthor && (
                <ReportPostButton postId={post.id} />
              )}
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <Link
                  href={`/community/${post.id}/edit`}
                  className="h-9 px-4 rounded-lg border border-[#d4d4d4] text-xs font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  수정
                </Link>
                <DeleteButton postId={post.id} />
              </div>
            )}
          </div>
        </article>

        {/* 댓글 */}
        <CommentSection
          postId={post.id}
          comments={comments}
          currentUserId={session?.user?.id}
        />

        <div className="mt-4">
          <BackToListButton />
        </div>
      </main>
    </div>
  );
}
