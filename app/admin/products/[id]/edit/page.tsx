import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../new/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, types] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { specValues: { select: { fieldId: true, value: true } } },
    }),
    prisma.productType.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        brands: { orderBy: { name: "asc" } },
        specFields: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Link href="/admin/products" className="text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h2 className="text-base font-bold text-foreground">상품 수정</h2>
        <span className="text-xs text-muted">— {product.name}</span>
      </div>
      <ProductForm types={types} product={product} />
    </div>
  );
}
