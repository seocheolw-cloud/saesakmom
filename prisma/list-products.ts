import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  const products = await prisma.product.findMany({
    include: {
      type: { select: { name: true } },
      brand: { select: { name: true } },
      specValues: { include: { field: { select: { name: true, unit: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`총 ${products.length}개 상품\n`);
  for (const p of products) {
    console.log(`[${p.status}] ${p.type.name} / ${p.brand.name} — ${p.name}`);
    console.log(`  가격: ${p.price ?? "-"} / 이미지: ${p.imageUrl ?? "-"}`);
    if (p.description) console.log(`  설명: ${p.description.slice(0, 60)}`);
    if (p.specValues.length > 0) {
      console.log(`  스펙:`);
      for (const sv of p.specValues) {
        console.log(`    - ${sv.field.name}${sv.field.unit ? `(${sv.field.unit})` : ""}: ${sv.value}`);
      }
    }
    console.log();
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
