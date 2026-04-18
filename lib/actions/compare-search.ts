"use server";

import { prisma } from "@/lib/prisma";

export async function searchComparison(productAId: string, productBId: string) {
  if (!productAId || !productBId || productAId === productBId) return null;

  const comparison = await prisma.productComparison.findFirst({
    where: {
      OR: [
        { productAId, productBId },
        { productAId: productBId, productBId: productAId },
      ],
    },
    select: { id: true },
  });

  return comparison?.id ?? null;
}
