import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../new/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { specValues: { select: { fieldId: true, value: true } } },
  });
  if (!product) notFound();

  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      brands: { orderBy: { name: "asc" } },
      specFields: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">상품 수정</h2>
      <ProductForm types={types} product={product} />
    </div>
  );
}
