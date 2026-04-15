import { prisma } from "@/lib/prisma";
import { SpecFieldManager } from "./SpecFieldManager";

export default async function SpecFieldsPage() {
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const fields = await prisma.productSpecField.findMany({
    include: { type: { select: { name: true } } },
    orderBy: [{ type: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return <SpecFieldManager types={types} fields={fields} />;
}
