import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { ProductComments } from "./ProductComments";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      type: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
      specValues: {
        include: { field: { select: { name: true, unit: true, sortOrder: true } } },
        orderBy: { field: { sortOrder: "asc" } },
      },
    },
  });
  if (!product) notFound();

  const comments = await prisma.productComment.findMany({
    where: { productId: id },
    include: { author: { select: { id: true, nickname: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{product.type.name}</span>
              <span className="text-xs text-muted">{product.brand.name}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{product.name}</h1>
            {product.price && <p className="text-lg font-bold text-primary">{product.price.toLocaleString()}원</p>}
          </div>
          {product.description && (
            <div className="p-6 border-b border-border">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
          {product.specValues.length > 0 && (
            <div className="p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">상세 스펙</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specValues.map((sv) => (
                    <tr key={sv.id} className="border-b border-border last:border-b-0">
                      <td className="py-2.5 pr-4 text-muted font-medium w-1/3">{sv.field.name}</td>
                      <td className="py-2.5 text-foreground">{sv.value}{sv.field.unit ? ` ${sv.field.unit}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
        <ProductComments productId={product.id} comments={comments} currentUserId={session?.user?.id} />
        <div className="mt-4">
          <Link href={`/products?type=${product.type.slug}`} className="text-sm text-muted hover:text-primary transition-colors">← 목록으로</Link>
        </div>
      </main>
    </div>
  );
}
