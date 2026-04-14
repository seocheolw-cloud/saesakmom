import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { DeleteButton } from "./DeleteButton";

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
      author: { select: { id: true, nickname: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    notFound();
  }

  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
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
              <span className="font-medium text-foreground">
                {post.author.nickname}
              </span>
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
              <span>좋아요 {post.likeCount}</span>
              <span>댓글 {post._count.comments}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
          {isAuthor && (
            <div className="px-6 pb-6 flex justify-end gap-2">
              <Link
                href={`/community/${post.id}/edit`}
                className="h-9 px-4 rounded-lg border border-[#d4d4d4] text-xs font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                수정
              </Link>
              <DeleteButton postId={post.id} />
            </div>
          )}
        </article>
        <div className="mt-4">
          <Link
            href="/community"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            ← 목록으로
          </Link>
        </div>
      </main>
    </div>
  );
}
