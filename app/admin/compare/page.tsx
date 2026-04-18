import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminComparePage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q?.trim() || "").slice(0, 100);
  const typeFilter = params.type;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const PAGE_SIZE = 20;

  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });

  const where = {
    ...(typeFilter && { productA: { type: { slug: typeFilter } } }),
    ...(query && {
      OR: [
        { productA: { name: { contains: query, mode: "insensitive" as const } } },
        { productB: { name: { contains: query, mode: "insensitive" as const } } },
        { productA: { brand: { name: { contains: query, mode: "insensitive" as const } } } },
        { productB: { brand: { name: { contains: query, mode: "insensitive" as const } } } },
      ],
    }),
  };

  const [comparisons, totalCount] = await Promise.all([
    prisma.productComparison.findMany({
      where,
      include: {
        productA: { select: { name: true, brand: { select: { name: true } }, type: { select: { name: true, slug: true } } } },
        productB: { select: { name: true, brand: { select: { name: true } } } },
        creator: { select: { nickname: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.productComparison.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    const get = (key: string, cur: string | undefined) => key in overrides ? overrides[key] : cur;
    const tf = get("type", typeFilter); if (tf) p.type = tf;
    const q = get("q", query); if (q) p.q = q;
    const pg = get("page", String(page)); if (pg && pg !== "1") p.page = pg;
    const qs = new URLSearchParams(p).toString();
    return qs ? `/admin/compare?${qs}` : "/admin/compare";
  }

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">비교 목록</h2>

      <div className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4 space-y-3">
        <form action="/admin/compare" className="flex gap-2">
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          <input name="q" defaultValue={query} placeholder="상품명, 브랜드 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white">검색</button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Link href={buildHref({ type: undefined, page: undefined })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${!typeFilter ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>전체</Link>
          {types.map((t) => (
            <Link key={t.slug} href={buildHref({ type: t.slug, page: undefined })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${typeFilter === t.slug ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>{t.name}</Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {totalCount}건</span>
        </div>
        {comparisons.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">{query || typeFilter ? "검색 결과가 없습니다." : "비교가 없습니다."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left">종류</th>
                  <th className="px-4 py-2.5 text-left">상품 A</th>
                  <th className="px-4 py-2.5 text-center w-10">VS</th>
                  <th className="px-4 py-2.5 text-left">상품 B</th>
                  <th className="px-4 py-2.5 text-center w-16">투표</th>
                  <th className="px-4 py-2.5 text-center w-16">댓글</th>
                  <th className="px-4 py-2.5 text-left w-20">작성자</th>
                  <th className="px-4 py-2.5 text-center w-16">관리</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff]">
                    <td className="px-4 py-3"><span className="text-xs text-primary bg-blue-50 px-1.5 py-0.5 rounded">{c.productA.type.name}</span></td>
                    <td className="px-4 py-3 font-medium">{c.productA.brand.name} {c.productA.name}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-muted">VS</td>
                    <td className="px-4 py-3 font-medium">{c.productB.brand.name} {c.productB.name}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted">{c.voteACount + c.voteBCount}</td>
                    <td className="px-4 py-3 text-center text-xs text-muted">{c._count.comments}</td>
                    <td className="px-4 py-3 text-xs text-muted">{c.creator.nickname}</td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/admin/compare/${c.id}`} className="text-xs text-primary hover:underline">상세</Link>
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
          {page > 1 && <Link href={buildHref({ page: String(page - 1) })} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">이전</Link>}
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)).map((p, i, arr) => {
            const prev = arr[i - 1];
            return (
              <span key={p}>
                {prev && p - prev > 1 && <span className="w-8 h-8 inline-flex items-center justify-center text-xs text-muted">...</span>}
                <Link href={buildHref({ page: String(p) })} className={`h-8 w-8 rounded-lg text-xs font-medium inline-flex items-center justify-center ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary hover:text-primary"}`}>{p}</Link>
              </span>
            );
          })}
          {page < totalPages && <Link href={buildHref({ page: String(page + 1) })} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary hover:text-primary transition-colors inline-flex items-center">다음</Link>}
        </div>
      )}
    </div>
  );
}
