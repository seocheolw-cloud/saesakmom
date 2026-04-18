import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "./ProductForm";

export default async function NewProductPage() {
  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      brands: { orderBy: { name: "asc" } },
      specFields: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Link href="/admin/products" className="text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h2 className="text-base font-bold text-foreground">상품 등록</h2>
      </div>
      <ProductForm types={types} />
    </div>
  );
}
