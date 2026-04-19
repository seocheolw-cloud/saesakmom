import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function main() {
  // 상품 비교 관련
  await prisma.comparisonComment.deleteMany({});
  await prisma.comparisonVote.deleteMany({});
  await prisma.productComparison.deleteMany({});
  console.log("Comparisons cleared");

  // 상품
  await prisma.productComment.deleteMany({});
  await prisma.productSpecValue.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productSpecField.deleteMany({});
  await prisma.productBrand.deleteMany({});
  console.log("Products/brands/spec fields cleared");

  // 커뮤니티
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  console.log("Posts/comments/likes/reports/notifications cleared");

  // admin 제외 유저
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: { not: "ADMIN" } },
  });
  console.log(`Non-admin users deleted (${deletedUsers.count})`);

  const remaining = await prisma.user.findMany({
    select: { nickname: true, email: true, role: true },
  });
  console.log("Remaining users:", remaining);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
