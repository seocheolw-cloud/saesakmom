import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrandManager } from "./BrandManager";

export default async function BrandsPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const params = await searchParams;
  const typeFilter = params.type;
  const query = (params.q?.trim() || "").slice(0, 100);

  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });

  const where = {
    ...(typeFilter && { type: { slug: typeFilter } }),
    ...(query && { name: { contains: query, mode: "insensitive" as const } }),
  };

  const brands = await prisma.productBrand.findMany({
    where,
    include: { type: { select: { name: true, slug: true } }, _count: { select: { products: true } } },
    orderBy: [{ type: { sortOrder: "asc" } }, { name: "asc" }],
  });

  return <BrandManager types={types} brands={brands} typeFilter={typeFilter} query={query} />;
}
