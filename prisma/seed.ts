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
  { name: "인기글", slug: "popular", sortOrder: 1 },
  { name: "임신", slug: "pregnancy", sortOrder: 2 },
  { name: "출산", slug: "birth", sortOrder: 3 },
  { name: "산후조리", slug: "postpartum", sortOrder: 4 },
  { name: "육아", slug: "parenting", sortOrder: 5 },
  { name: "수유/이유식", slug: "feeding", sortOrder: 6 },
  { name: "뷰티/다이어트", slug: "beauty", sortOrder: 7 },
  { name: "자유게시판", slug: "free", sortOrder: 8 },
];

async function main() {
  // 기존 카테고리 중 새 목록에 없는 것 삭제
  const oldSlugs = ["daily", "health"];
  for (const slug of oldSlugs) {
    await prisma.category.deleteMany({ where: { slug } });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
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
