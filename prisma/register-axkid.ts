import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const TYPE_ID = "cmo05l6or003f2otcf3pswzwo";
const BRAND_ID = "cmo55no26000jtgtcr8xj4yx3"; // 악스키드 (Axkid)
const SPEC = {
  size: "cmo563z3p000ytgtc61xw95xl",
  weight: "cmo563z40000ztgtcd5j263io",
  height: "cmo563z4b0010tgtc272kvzwg",
  age: "cmo563z4m0011tgtcshlfcuvd",
  cert: "cmo574wst0025tgtc13m4d3g5",
  feature: "cmo563z4v0012tgtcu1xu4tx5",
};

type Product = {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  specs: {
    size: string;
    weight: string;
    height: string;
    age: string;
    cert: string;
    feature: string;
  };
};

// Axkid 한국(axkidbaby.com) 현행 2종. 이미지는 Axkid 글로벌 공식 CDN(axkid.com) 단독 샷.
// 악스키드는 스웨덴 Plus Test 인증 + 장기 후방 장착(Extended Rear-Facing, ERF) 전문 브랜드.
const products: Product[] = [
  {
    name: "악스키드 원 (Axkid One)",
    price: 1320000,
    description:
      "6개월부터 약 7세(125cm/23kg)까지 후방 장착 전용으로 사용하는 스웨덴 Plus Test 인증 ERF(Extended Rear-Facing) 카시트. ISOFIX + 지지대 구조로 장착되며, UN R129 i-Size 인증을 받은 유일한 후방장착 카시트(최대 125cm/23kg) 중 하나입니다. 전방 충돌 시 아이의 머리와 목에 가해지는 부담을 획기적으로 줄입니다.",
    imageUrl: "https://axkid.com/app/uploads/One-3-Green-side-2.png",
    specs: {
      size: "W440 / L540 / H760",
      weight: "10",
      height: "61-125",
      age: "약 6개월 ~ 7세 (최대 23kg)",
      cert: "KC 안전확인, UN R129 (i-Size), 스웨덴 Plus Test",
      feature:
        "후방 장착 전용(ERF, ~125cm/23kg), ISOFIX + 지지대, 스웨덴 Plus Test 인증, 측면충돌 보호, 리클라인 조절",
    },
  },
  {
    name: "악스키드 원 플러스 (Axkid One Plus)",
    price: 1380000,
    description:
      "신생아(40cm)부터 약 7세(125cm/23kg)까지 후방 장착 전용으로 사용하는 스웨덴 Plus Test 인증 ERF 카시트. 신생아 전용 이너 인서트가 기본 포함되어 40cm부터 사용 가능하며, 그 외 사양은 Axkid One과 동일합니다. 유럽에서 가장 엄격한 장기 후방장착 안전 기준인 Plus Test를 통과한 프리미엄 모델입니다.",
    imageUrl: "https://axkid.com/app/uploads/Axkid-One-3-Driftwood-Beige-side-1.png",
    specs: {
      size: "W440 / L540 / H760",
      weight: "10",
      height: "40-125",
      age: "신생아 ~ 약 7세 (최대 23kg)",
      cert: "KC 안전확인, UN R129 (i-Size), 스웨덴 Plus Test",
      feature:
        "후방 장착 전용(ERF, 신생아~125cm/23kg), 신생아 이너 인서트 포함, ISOFIX + 지지대, 스웨덴 Plus Test 인증, 측면충돌 보호, 리클라인 조절",
    },
  },
];

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(dir, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const exists = await prisma.product.findFirst({
      where: { name: p.name, brandId: BRAND_ID },
    });
    if (exists) {
      console.log(`SKIP (이미 존재): ${p.name}`);
      skipped++;
      continue;
    }

    const imgRes = await fetch(p.imageUrl, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!imgRes.ok) throw new Error(`이미지 다운로드 실패 (${imgRes.status}): ${p.name}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ext = p.imageUrl.toLowerCase().split("?")[0].endsWith(".png") ? "png" : "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await fs.writeFile(path.join(dir, fileName), buf);
    const publicUrl = `/uploads/products/${fileName}`;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: publicUrl,
          typeId: TYPE_ID,
          brandId: BRAND_ID,
          status: "PUBLISHED",
        },
      });
      await tx.productSpecValue.createMany({
        data: [
          { productId: product.id, fieldId: SPEC.size, value: p.specs.size },
          { productId: product.id, fieldId: SPEC.weight, value: p.specs.weight },
          { productId: product.id, fieldId: SPEC.height, value: p.specs.height },
          { productId: product.id, fieldId: SPEC.age, value: p.specs.age },
          { productId: product.id, fieldId: SPEC.cert, value: p.specs.cert },
          { productId: product.id, fieldId: SPEC.feature, value: p.specs.feature },
        ],
      });
    });
    console.log(`ADD: ${p.name} — ${p.price.toLocaleString()}원 — ${publicUrl} (${Math.round(buf.length / 1024)}KB)`);
    created++;
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
