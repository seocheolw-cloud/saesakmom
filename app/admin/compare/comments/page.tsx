import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminCompareCommentList } from "./AdminCompareCommentList";

export default async function AdminCompareCommentsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
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
    prisma.comparisonComment.findMany({
      where,
      include: {
        author: { select: { nickname: true } },
        comparison: {
          select: {
            id: true,
            productA: { select: { name: true, brand: { select: { name: true } } } },
            productB: { select: { name: true, brand: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.comparisonComment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">비교 댓글 관리</h2>

      <form action="/admin/compare/comments" className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex gap-2">
          <input name="q" defaultValue={query} placeholder="댓글 내용, 닉네임 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white">검색</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {totalCount}개 댓글</span>
        </div>
        <AdminCompareCommentList
          comments={comments.map((c) => ({
            id: c.id,
            content: c.content,
            authorNickname: c.author.nickname,
            createdAt: c.createdAt.toISOString(),
            comparisonId: c.comparison.id,
            comparisonLabel: `${c.comparison.productA.brand.name} ${c.comparison.productA.name} vs ${c.comparison.productB.brand.name} ${c.comparison.productB.name}`,
          }))}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/compare/comments?${query ? `q=${query}&` : ""}page=${p}`} className={`h-8 w-8 rounded-lg text-xs font-medium inline-flex items-center justify-center ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary"}`}>{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
