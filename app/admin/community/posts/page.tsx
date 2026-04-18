import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostActions } from "./PostActions";

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q?.trim() || "").slice(0, 100);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const PAGE_SIZE = 20;

  const where = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { author: { nickname: { contains: query, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: { select: { nickname: true } }, category: { select: { name: true } }, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">게시글 관리</h2>

      <form action="/admin/community/posts" className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex gap-2">
          <input name="q" defaultValue={query} placeholder="제목, 닉네임 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white">검색</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {totalCount}개 게시글</span>
        </div>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">게시글이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left">제목</th>
                  <th className="px-4 py-2.5 text-left w-20">카테고리</th>
                  <th className="px-4 py-2.5 text-left w-24">작성자</th>
                  <th className="px-4 py-2.5 text-center w-16">댓글</th>
                  <th className="px-4 py-2.5 text-center w-16">추천</th>
                  <th className="px-4 py-2.5 text-center w-16">조회</th>
                  <th className="px-4 py-2.5 text-center w-20">상태</th>
                  <th className="px-4 py-2.5 text-center w-16">관리</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff]">
                    <td className="px-4 py-3">
                      <Link href={`/community/${p.id}`} className="text-foreground hover:text-primary transition-colors">{p.title}</Link>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-primary bg-blue-50 px-1.5 py-0.5 rounded">{p.category.name}</span></td>
                    <td className="px-4 py-3 text-muted text-xs">{p.author.nickname}</td>
                    <td className="px-4 py-3 text-center text-muted text-xs">{p._count.comments}</td>
                    <td className="px-4 py-3 text-center text-muted text-xs">{p.likeCount}</td>
                    <td className="px-4 py-3 text-center text-muted text-xs">{p.viewCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${p.status === "ACTIVE" ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}>
                        {p.status === "ACTIVE" ? "공개" : p.status === "HIDDEN" ? "숨김" : "삭제"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PostActions postId={p.id} status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {page > 1 && <Link href={`/admin/community/posts?${query ? `q=${query}&` : ""}page=${page - 1}`} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">이전</Link>}
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)).map((p, i, arr) => {
            const prev = arr[i - 1];
            return (
              <span key={p}>
                {prev && p - prev > 1 && <span className="w-8 h-8 inline-flex items-center justify-center text-xs text-muted">...</span>}
                <Link href={`/admin/community/posts?${query ? `q=${query}&` : ""}page=${p}`} className={`h-8 w-8 rounded-lg text-xs font-medium inline-flex items-center justify-center ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary hover:text-primary"}`}>{p}</Link>
              </span>
            );
          })}
          {page < totalPages && <Link href={`/admin/community/posts?${query ? `q=${query}&` : ""}page=${page + 1}`} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">다음</Link>}
        </div>
      )}
    </div>
  );
}
