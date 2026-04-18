import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { ProductImage } from "@/app/products/ProductImage";
import { VoteButton } from "./VoteButton";
import { CompareComments } from "./CompareComments";
import { BackButton as CompareBackButton } from "./BackButton";

export default async function CompareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const [comparison, userVote, comments] = await Promise.all([
    prisma.productComparison.findUnique({
      where: { id },
      include: {
        productA: {
          include: {
            type: { select: { name: true } },
            brand: { select: { name: true } },
            specValues: { include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } }, orderBy: { field: { sortOrder: "asc" } } },
          },
        },
        productB: {
          include: {
            brand: { select: { name: true } },
            specValues: { include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } }, orderBy: { field: { sortOrder: "asc" } } },
          },
        },
      },
    }),
    session?.user
      ? prisma.comparisonVote.findUnique({ where: { comparisonId_userId: { comparisonId: id, userId: session.user.id } } })
      : null,
    prisma.comparisonComment.findMany({
      where: { comparisonId: id },
      include: { author: { select: { id: true, nickname: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!comparison) notFound();

  // flat 댓글을 트리 구조로 변환
  const topComments = comments.filter((c) => !c.parentId);
  const replyMap = new Map<string, typeof comments>();
  for (const c of comments) {
    if (c.parentId) {
      const arr = replyMap.get(c.parentId) || [];
      arr.push(c);
      replyMap.set(c.parentId, arr);
    }
  }
  const treeComments = topComments.map((c) => ({ ...c, replies: replyMap.get(c.id) || [] }));

  // 댓글 작성자들의 투표 내역 조회
  const commentAuthorIds = [...new Set(comments.map((c) => c.authorId))];
  const votes = await prisma.comparisonVote.findMany({
    where: { comparisonId: id, userId: { in: commentAuthorIds } },
    select: { userId: true, choice: true },
  });
  const voteMap: Record<string, "A" | "B"> = {};
  for (const v of votes) voteMap[v.userId] = v.choice;

  const { productA, productB, voteACount, voteBCount } = comparison;
  const total = voteACount + voteBCount;
  const pctA = total > 0 ? Math.round((voteACount / total) * 100) : 50;
  const pctB = 100 - pctA;
  const winner = pctA > pctB ? "A" : pctB > pctA ? "B" : null;

  const specMap: Record<string, { name: string; unit: string | null; sortOrder: number; a?: string; b?: string }> = {};
  for (const sv of productA.specValues) {
    specMap[sv.field.id] = { name: sv.field.name, unit: sv.field.unit, sortOrder: sv.field.sortOrder, a: sv.value };
  }
  for (const sv of productB.specValues) {
    if (specMap[sv.field.id]) { specMap[sv.field.id].b = sv.value; }
    else { specMap[sv.field.id] = { name: sv.field.name, unit: sv.field.unit, sortOrder: sv.field.sortOrder, b: sv.value }; }
  }
  const specRows = Object.values(specMap).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <div className="mb-4">
          <CompareBackButton />
        </div>

        <div className="bg-white rounded-2xl border border-[#d4d4d4] overflow-hidden shadow-sm">
          {/* 카테고리 헤더 */}
          <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-red-50 text-center">
            <span className="text-xs font-semibold text-primary bg-white/80 px-3 py-1 rounded-full">{productA.type.name} 비교</span>
          </div>

          {/* 상품 비교 */}
          <div className="p-6 border-b border-border">
            <div className="grid grid-cols-[1fr_48px_1fr] gap-3">
              {/* A */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full rounded-xl overflow-hidden">
                  <ProductImage imageUrl={productA.imageUrl} typeName={productA.type.name} productName={productA.name} size="sm" />
                </div>
                <p className="text-[11px] text-muted mt-3">{productA.brand.name}</p>
                <p className="text-[15px] font-bold text-foreground leading-tight mt-0.5 min-h-[2.5em] flex items-center">{productA.name}</p>
                {productA.price && (
                  <p className="text-sm font-semibold text-foreground mt-1">{productA.price.toLocaleString()}<span className="text-xs font-normal text-muted ml-0.5">원</span></p>
                )}
              </div>

              {/* VS */}
              <div className="flex items-center justify-center pt-14">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-red-100 flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-xs font-black text-gray-500">VS</span>
                </div>
              </div>

              {/* B */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full rounded-xl overflow-hidden">
                  <ProductImage imageUrl={productB.imageUrl} typeName={productA.type.name} productName={productB.name} size="sm" />
                </div>
                <p className="text-[11px] text-muted mt-3">{productB.brand.name}</p>
                <p className="text-[15px] font-bold text-foreground leading-tight mt-0.5 min-h-[2.5em] flex items-center">{productB.name}</p>
                {productB.price && (
                  <p className="text-sm font-semibold text-foreground mt-1">{productB.price.toLocaleString()}<span className="text-xs font-normal text-muted ml-0.5">원</span></p>
                )}
              </div>
            </div>
          </div>

          {/* 투표 영역 */}
          <div className="p-6 border-b border-border bg-[#f8fafc]">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1.5 w-12 sm:w-16 justify-end">
                <span className={`text-sm font-bold ${winner === "A" ? "text-blue-600" : "text-blue-400"}`}>{pctA}%</span>
                {winner === "A" && <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              </div>
              <div className="flex-1 h-5 bg-white rounded-full overflow-hidden flex shadow-inner border border-gray-200">
                <div className={`h-full rounded-l-full transition-all ${winner === "A" ? "bg-blue-500" : "bg-blue-300"}`} style={{ width: `${pctA}%` }} />
                <div className={`h-full rounded-r-full transition-all ${winner === "B" ? "bg-red-500" : "bg-red-300"}`} style={{ width: `${pctB}%` }} />
              </div>
              <div className="flex items-center gap-1.5 w-12 sm:w-16">
                {winner === "B" && <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                <span className={`text-sm font-bold ${winner === "B" ? "text-red-600" : "text-red-400"}`}>{pctB}%</span>
              </div>
            </div>
            <p className="text-xs text-muted text-center mb-3">총 {total}표 참여</p>
            <VoteButton comparisonId={comparison.id} userChoice={userVote?.choice ?? null} productAName={productA.name} productBName={productB.name} isLoggedIn={!!session?.user} />
          </div>

          {/* 스펙 비교 */}
          {specRows.length > 0 && (
            <div className="p-6">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                스펙 비교
              </h2>
              <div className="rounded-xl border border-[#d4d4d4] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted w-1/4">항목</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 w-[37.5%]">{productA.name}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 w-[37.5%]">{productB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((row, i) => (
                      <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                        <td className="px-4 py-3 text-muted font-medium border-r border-border">{row.name}</td>
                        <td className="px-4 py-3 text-center text-foreground font-medium border-r border-border">
                          {row.a ? <>{row.a}{row.unit && <span className="text-muted text-xs ml-1">{row.unit}</span>}</> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-foreground font-medium">
                          {row.b ? <>{row.b}{row.unit && <span className="text-muted text-xs ml-1">{row.unit}</span>}</> : <span className="text-gray-300">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <CompareComments
          comparisonId={comparison.id}
          comments={treeComments}
          currentUserId={session?.user?.id}
          voteMap={voteMap}
          productAName={productA.name}
          productBName={productB.name}
        />
      </main>
    </div>
  );
}
