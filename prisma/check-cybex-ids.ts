import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  const types = await prisma.productType.findMany({ select: { id: true, slug: true, name: true } });
  const brands = await prisma.productBrand.findMany({ select: { id: true, name: true, typeId: true } });
  const fields = await prisma.productSpecField.findMany({
    select: { id: true, name: true, unit: true, typeId: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log("TYPES:", JSON.stringify(types, null, 2));
  console.log("BRANDS:", JSON.stringify(brands, null, 2));
  console.log("FIELDS:", JSON.stringify(fields, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
