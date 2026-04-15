import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { VoteButton } from "./VoteButton";
import { CompareComments } from "./CompareComments";

export default async function CompareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const comparison = await prisma.productComparison.findUnique({
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
  });
  if (!comparison) notFound();

  const userVote = session?.user
    ? await prisma.comparisonVote.findUnique({ where: { comparisonId_userId: { comparisonId: id, userId: session.user.id } } })
    : null;

  const comments = await prisma.comparisonComment.findMany({
    where: { comparisonId: id },
    include: { author: { select: { id: true, nickname: true } } },
    orderBy: { createdAt: "asc" },
  });

  const { productA, productB, voteACount, voteBCount } = comparison;
  const total = voteACount + voteBCount;
  const pctA = total > 0 ? Math.round((voteACount / total) * 100) : 50;
  const pctB = 100 - pctA;

  // Build spec comparison rows
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
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          <div className="p-6 border-b border-border text-center">
            <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{productA.type.name}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-6 border-b border-border">
            <div className="text-center">
              <p className="text-xs text-muted mb-1">{productA.brand.name}</p>
              <p className="text-base font-bold text-foreground">{productA.name}</p>
              {productA.price && <p className="text-sm text-muted mt-0.5">{productA.price.toLocaleString()}원</p>}
            </div>
            <span className="text-sm font-bold text-muted px-3">VS</span>
            <div className="text-center">
              <p className="text-xs text-muted mb-1">{productB.brand.name}</p>
              <p className="text-base font-bold text-foreground">{productB.name}</p>
              {productB.price && <p className="text-sm text-muted mt-0.5">{productB.price.toLocaleString()}원</p>}
            </div>
          </div>
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-blue-500 w-12 text-right">{pctA}%</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctA}%` }} />
                <div className="h-full bg-red-400 rounded-r-full transition-all" style={{ width: `${pctB}%` }} />
              </div>
              <span className="text-sm font-bold text-red-500 w-12">{pctB}%</span>
            </div>
            <p className="text-xs text-muted text-center">총 {total}표</p>
            <VoteButton comparisonId={comparison.id} userChoice={userVote?.choice ?? null} productAName={productA.name} productBName={productB.name} />
          </div>
          {specRows.length > 0 && (
            <div className="p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">스펙 비교</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8fafc] text-xs font-semibold text-muted">
                    <tr>
                      <th className="px-3 py-2 text-left w-1/4">항목</th>
                      <th className="px-3 py-2 text-center w-[37.5%]">{productA.name}</th>
                      <th className="px-3 py-2 text-center w-[37.5%]">{productB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((row) => (
                      <tr key={row.name} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-2.5 text-muted font-medium">{row.name}</td>
                        <td className="px-3 py-2.5 text-center text-foreground">{row.a ? `${row.a}${row.unit ? ` ${row.unit}` : ""}` : "-"}</td>
                        <td className="px-3 py-2.5 text-center text-foreground">{row.b ? `${row.b}${row.unit ? ` ${row.unit}` : ""}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <CompareComments comparisonId={comparison.id} comments={comments} currentUserId={session?.user?.id} />
        <div className="mt-4">
          <Link href="/compare" className="text-sm text-muted hover:text-primary transition-colors">← 목록으로</Link>
        </div>
      </main>
    </div>
  );
}
