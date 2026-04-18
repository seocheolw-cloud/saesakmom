import { prisma } from "@/lib/prisma";
import { TypeManager } from "./TypeManager";

export default async function TypesPage() {
  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true, brands: true } },
      specFields: { orderBy: { sortOrder: "asc" } },
    },
  });

  return <TypeManager types={types} />;
}
