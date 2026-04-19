import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const CERT_FIELD_ID = "cmo574wst0025tgtc13m4d3g5";

const certifications: { name: string; cert: string }[] = [
  { name: "제로나 T", cert: "UN R129/03 (i-Size)" },
  { name: "제로나 Gi", cert: "UN R129/03 (i-Size)" },
  { name: "클라우드T (T모듈 시스템)", cert: "UN R129/03 (i-Size)" },
  { name: "솔루션 G2", cert: "UN R129/04 (i-Size)" },
  { name: "아노리스 T2 i-Size", cert: "UN R129/03 (i-Size)" },
  { name: "솔루션 T Comfort", cert: "UN R129/03 (i-Size)" },
  { name: "에이톤 S2 i-Size", cert: "UN R129/03 (i-Size)" },
  { name: "솔루션 T Plus", cert: "UN R129/03 (i-Size)" },
  { name: "제로나 Zi i-Size", cert: "UN R129/03 (i-Size)" },
  { name: "솔루션 Z i-Fix Plus", cert: "UN R129/03 (i-Size)" },
];

async function main() {
  let updated = 0;
  let missing = 0;

  for (const c of certifications) {
    const product = await prisma.product.findFirst({ where: { name: c.name } });
    if (!product) {
      console.log(`MISS: ${c.name} 을(를) 찾을 수 없음`);
      missing++;
      continue;
    }

    await prisma.productSpecValue.upsert({
      where: { productId_fieldId: { productId: product.id, fieldId: CERT_FIELD_ID } },
      update: { value: c.cert },
      create: { productId: product.id, fieldId: CERT_FIELD_ID, value: c.cert },
    });
    console.log(`OK: ${c.name} → ${c.cert}`);
    updated++;
  }

  console.log(`\n완료 — 업데이트: ${updated}, 누락: ${missing}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
