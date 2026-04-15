import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const typeSlug = params.type;

  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", ...(typeSlug && { type: { slug: typeSlug } }) },
    include: { type: { select: { name: true, slug: true } }, brand: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const isAll = !typeSlug;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-foreground mb-4">육아용품</h1>
        <div className="flex flex-wrap gap-2 mb-5">
          <Link href="/products" className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${isAll ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"}`}>전체</Link>
          {types.map((t) => (
            <Link key={t.slug} href={`/products?type=${t.slug}`} className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${typeSlug === t.slug ? "bg-foreground text-white" : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"}`}>{t.name}</Link>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted">{products.length}개 상품</span>
          <Link href="/compare" className="h-9 px-4 rounded-lg border border-primary text-sm font-semibold text-primary hover:bg-blue-50 transition-colors inline-flex items-center">비교 투표</Link>
        </div>
        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">등록된 상품이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="bg-white rounded-xl border border-[#d4d4d4] p-4 hover:border-primary transition-colors">
                {p.imageUrl && (
                  <div className="w-full h-40 bg-[#f8fafc] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-primary">[{p.type.name}]</span>
                  <span className="text-xs text-muted">{p.brand.name}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{p.name}</h3>
                {p.price && <p className="text-sm font-bold text-foreground">{p.price.toLocaleString()}원</p>}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
