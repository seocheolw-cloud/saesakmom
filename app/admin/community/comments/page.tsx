import { prisma } from "@/lib/prisma";
import { CommentDeleteButton } from "./CommentDeleteButton";

export default async function AdminCommentsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q?.trim() || "").slice(0, 100);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const PAGE_SIZE = 30;

  const where = {
    ...(query && {
      OR: [
        { content: { contains: query, mode: "insensitive" as const } },
        { author: { nickname: { contains: query, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [comments, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: { author: { select: { nickname: true } }, post: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.comment.count({ where }),
  ]);

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">댓글 관리</h2>

      <form action="/admin/community/comments" className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex gap-2">
          <input name="q" defaultValue={query} placeholder="댓글 내용, 닉네임 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white">검색</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {totalCount}개 댓글</span>
        </div>
        {comments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">댓글이 없습니다.</div>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((c) => (
              <div key={c.id} className="px-4 py-3 hover:bg-[#f8faff] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{c.author.nickname}</span>
                      <span className="text-[11px] text-muted">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.status === "ACTIVE" ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}>
                        {c.status === "ACTIVE" ? "공개" : c.status === "HIDDEN" ? "숨김" : "삭제"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 mb-1">{c.content}</p>
                    <p className="text-[11px] text-muted">게시글: {c.post.title}</p>
                  </div>
                  {c.status !== "DELETED" && <CommentDeleteButton commentId={c.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
