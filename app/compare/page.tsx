import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const typeSlug = params.type;
  const session = await auth();

  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const comparisons = await prisma.productComparison.findMany({
    where: typeSlug ? { productA: { type: { slug: typeSlug } } } : undefined,
    include: {
      productA: { select: { name: true, brand: { select: { name: true } }, type: { select: { name: true, slug: true } } } },
      productB: { select: { name: true, brand: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-foreground">비교 투표</h1>
          {session?.user && (
            <Link href="/compare/new" className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center">비교 만들기</Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <Link href="/compare" className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${!typeSlug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"}`}>전체</Link>
          {types.map((t) => (
            <Link key={t.slug} href={`/compare?type=${t.slug}`} className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${typeSlug === t.slug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"}`}>{t.name}</Link>
          ))}
        </div>
        {comparisons.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">등록된 비교가 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {comparisons.map((c) => {
              const total = c.voteACount + c.voteBCount;
              const pctA = total > 0 ? Math.round((c.voteACount / total) * 100) : 50;
              const pctB = 100 - pctA;
              return (
                <Link key={c.id} href={`/compare/${c.id}`} className="block bg-white rounded-xl border border-[#d4d4d4] p-4 hover:border-primary transition-colors">
                  <span className="text-xs font-semibold text-primary mb-2 block">[{c.productA.type.name}]</span>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-foreground flex-1 text-center">{c.productA.brand.name} {c.productA.name}</span>
                    <span className="text-xs font-bold text-muted shrink-0">VS</span>
                    <span className="text-sm font-semibold text-foreground flex-1 text-center">{c.productB.brand.name} {c.productB.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-10 text-right font-semibold text-blue-500">{pctA}%</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctA}%` }} />
                      <div className="h-full bg-red-400 rounded-r-full transition-all" style={{ width: `${pctB}%` }} />
                    </div>
                    <span className="w-10 font-semibold text-red-500">{pctB}%</span>
                  </div>
                  <p className="text-xs text-muted text-center mt-1">{total}표</p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
