import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  const types = await prisma.productType.findMany({
    include: {
      brands: { orderBy: { name: "asc" } },
      specFields: { orderBy: { sortOrder: "asc" } },
    },
  });

  for (const t of types) {
    console.log(`\n=== TYPE: ${t.name} (${t.id}) ===`);
    console.log("-- brands --");
    for (const b of t.brands) console.log(`  ${b.id} | ${b.name}`);
    console.log("-- spec fields --");
    for (const f of t.specFields) console.log(`  ${f.id} | ${f.name}${f.unit ? ` (${f.unit})` : ""}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
