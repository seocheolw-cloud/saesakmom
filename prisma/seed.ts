import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

const categories = [
  { name: "임신", slug: "pregnancy", sortOrder: 1 },
  { name: "출산", slug: "birth", sortOrder: 2 },
  { name: "육아일상", slug: "daily", sortOrder: 3 },
  { name: "수유/이유식", slug: "feeding", sortOrder: 4 },
  { name: "건강", slug: "health", sortOrder: 5 },
  { name: "자유게시판", slug: "free", sortOrder: 6 },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log("Categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
