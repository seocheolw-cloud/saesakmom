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
      <h2 className="text-base font-bold text-foreground mb-4">상품 등록</h2>
      <ProductForm types={types} />
    </div>
  );
}
