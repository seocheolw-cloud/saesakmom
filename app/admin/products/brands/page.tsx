import { prisma } from "@/lib/prisma";
import { BrandManager } from "./BrandManager";

export default async function BrandsPage() {
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const brands = await prisma.productBrand.findMany({
    include: { type: { select: { name: true } }, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <BrandManager types={types} brands={brands} />;
}
