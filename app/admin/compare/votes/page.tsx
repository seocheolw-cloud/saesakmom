import { prisma } from "@/lib/prisma";

export default async function AdminVotesPage() {
  const comparisons = await prisma.productComparison.findMany({
    include: {
      productA: { select: { name: true, brand: { select: { name: true } } } },
      productB: { select: { name: true, brand: { select: { name: true } } } },
    },
    orderBy: [{ voteACount: "desc" }],
    take: 30,
  });

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">투표 현황</h2>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {comparisons.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">투표 데이터가 없습니다.</div>
        ) : (
          <div className="divide-y divide-border">
            {comparisons.map((c) => {
              const total = c.voteACount + c.voteBCount;
              const pctA = total > 0 ? Math.round((c.voteACount / total) * 100) : 50;
              const pctB = 100 - pctA;
              return (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{c.productA.brand.name} {c.productA.name}</span>
                    <span className="text-xs text-muted mx-2">vs</span>
                    <span className="text-sm font-medium text-foreground text-right">{c.productB.brand.name} {c.productB.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-500 w-10 text-right">{pctA}%</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue-400 rounded-l-full" style={{ width: `${pctA}%` }} />
                      <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${pctB}%` }} />
                    </div>
                    <span className="text-xs font-bold text-red-500 w-10">{pctB}%</span>
                    <span className="text-[11px] text-muted w-12 text-right">{total}표</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
