import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

// 패브릭/쿠션만 다른 변종 — 베이스 모델과 안전 구조 동일하므로 비교용으로 중복.
const variantsToDelete = [
  "베이비세이프 프로 럭스 i-Size",
  "베이비세이프 프로 그린센스 i-Size",
  "듀얼픽스 플러스 스타일 i-Size",
  "듀얼픽스 플러스 써모 i-Size",
  "듀얼픽스 프로 스타일 i-Size",
  "듀얼픽스 프로 럭스 i-Size",
  "어드밴스픽스 프로 스타일 i-Size",
  "어드밴스픽스 프로 럭스 i-Size",
  "키드픽스 프로 럭스 i-Size",
];

async function main() {
  const brand = await prisma.productBrand.findFirst({
    where: { name: { contains: "브라이텍스" }, typeId: "cmo05l6or003f2otcf3pswzwo" },
  });
  if (!brand) throw new Error("브라이텍스 brand not found");

  let deleted = 0;
  for (const name of variantsToDelete) {
    const product = await prisma.product.findFirst({ where: { name, brandId: brand.id } });
    if (!product) {
      console.log(`SKIP (없음): ${name}`);
      continue;
    }

    // 이미지 파일도 삭제
    if (product.imageUrl) {
      const imgPath = path.join(process.cwd(), "public", product.imageUrl);
      await fs.rm(imgPath, { force: true });
    }

    await prisma.product.delete({ where: { id: product.id } });
    console.log(`DEL: ${name}`);
    deleted++;
  }

  const remaining = await prisma.product.findMany({
    where: { brandId: brand.id },
    orderBy: { price: "asc" },
    select: { name: true, price: true },
  });
  console.log(`\n남은 브라이텍스 제품 (${remaining.length}개):`);
  remaining.forEach((p) => console.log(`  - ${p.name} — ${p.price?.toLocaleString()}원`));
  console.log(`\n완료 — 삭제: ${deleted}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
