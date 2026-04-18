import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminCompareDetail } from "./AdminCompareDetail";

export default async function AdminCompareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comparison = await prisma.productComparison.findUnique({
    where: { id },
    include: {
      productA: { include: { type: { select: { name: true } }, brand: { select: { name: true } }, specValues: { include: { field: { select: { name: true, unit: true, sortOrder: true } } }, orderBy: { field: { sortOrder: "asc" } } } } },
      productB: { include: { brand: { select: { name: true } }, specValues: { include: { field: { select: { name: true, unit: true, sortOrder: true } } }, orderBy: { field: { sortOrder: "asc" } } } } },
      creator: { select: { nickname: true } },
      comments: { include: { author: { select: { id: true, nickname: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!comparison) notFound();

  const { productA, productB, voteACount, voteBCount } = comparison;
  const total = voteACount + voteBCount;
  const pctA = total > 0 ? Math.round((voteACount / total) * 100) : 50;
  const pctB = 100 - pctA;

  const specMap: Record<string, { name: string; unit: string | null; sortOrder: number; a?: string; b?: string }> = {};
  for (const sv of productA.specValues) specMap[sv.field.name] = { name: sv.field.name, unit: sv.field.unit, sortOrder: sv.field.sortOrder, a: sv.value };
  for (const sv of productB.specValues) {
    if (specMap[sv.field.name]) specMap[sv.field.name].b = sv.value;
    else specMap[sv.field.name] = { name: sv.field.name, unit: sv.field.unit, sortOrder: sv.field.sortOrder, b: sv.value };
  }
  const specRows = Object.values(specMap).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <Link href="/admin/compare" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        비교 목록
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-[#f8fafc]">
            <h3 className="text-sm font-bold text-foreground">비교 정보</h3>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">종류</span>
              <span className="text-xs text-primary bg-blue-50 px-2 py-0.5 rounded">{productA.type.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">작성자</span>
              <span className="text-foreground">{comparison.creator.nickname}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">생성일</span>
              <span className="text-foreground">{new Date(comparison.createdAt).toLocaleDateString("ko-KR")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">사이트 링크</span>
              <Link href={`/compare/${id}`} className="text-xs text-primary hover:underline">보기</Link>
            </div>
          </div>
        </div>

        {/* 투표 현황 */}
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-[#f8fafc]">
            <h3 className="text-sm font-bold text-foreground">투표 현황</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted">{productA.brand.name}</p>
                <p className="text-sm font-bold text-foreground">{productA.name}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{voteACount}표</p>
              </div>
              <span className="text-xs font-bold text-muted">VS</span>
              <div className="text-center">
                <p className="text-xs text-muted">{productB.brand.name}</p>
                <p className="text-sm font-bold text-foreground">{productB.name}</p>
                <p className="text-lg font-bold text-red-600 mt-1">{voteBCount}표</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-500 w-10 text-right">{pctA}%</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400 rounded-l-full" style={{ width: `${pctA}%` }} />
                <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${pctB}%` }} />
              </div>
              <span className="text-xs font-bold text-red-500 w-10">{pctB}%</span>
            </div>
            <p className="text-xs text-muted text-center mt-2">총 {total}표</p>
          </div>
        </div>
      </div>

      {/* 스펙 비교 */}
      {specRows.length > 0 && (
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-border bg-[#f8fafc]">
            <h3 className="text-sm font-bold text-foreground">스펙 비교</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left w-1/4">항목</th>
                  <th className="px-4 py-2.5 text-center text-blue-600">{productA.name}</th>
                  <th className="px-4 py-2.5 text-center text-red-600">{productB.name}</th>
                </tr>
              </thead>
              <tbody>
                {specRows.map((row, i) => (
                  <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                    <td className="px-4 py-2.5 text-muted font-medium">{row.name}</td>
                    <td className="px-4 py-2.5 text-center">{row.a ? `${row.a}${row.unit ? ` ${row.unit}` : ""}` : "-"}</td>
                    <td className="px-4 py-2.5 text-center">{row.b ? `${row.b}${row.unit ? ` ${row.unit}` : ""}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 댓글 관리 */}
      <AdminCompareDetail
        comparisonId={id}
        comments={comparison.comments.map((c) => ({
          id: c.id,
          content: c.content,
          authorNickname: c.author.nickname,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
