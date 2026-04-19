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
const BRAND_ID = "cmo55qmt6000ttgtc6hyjz91n"; // 니스툴그로우 (Nistulgrow)
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

const products: Product[] = [
  {
    name: "빌트인 아이소픽스 주니어 카시트",
    price: 109800,
    description:
      "니스툴그로우의 빌트인 ISOFIX 주니어 카시트. 본체에 ISOFIX 커넥터가 내장되어 별도 벨트 없이 차량 시트에 단단히 장착되고, 분리형 백레스트로 백리스 부스터 전환이 가능합니다. 15~36kg(약 3~12세) 구간을 커버하며, 헤드레스트 높이를 단계별로 조절해 성장에 맞춰 사용할 수 있습니다. 오프화이트·그레이·블루·퍼플 4색 전개.",
    imageUrl: "https://nistulgrow.co.kr/web/product/big/202306/07a4e0e9d396870328ebf47f0b9e96b4.jpg",
    specs: {
      size: "W430 / L400 / H700",
      weight: "4.2",
      height: "95-145",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인",
      feature:
        "빌트인 ISOFIX(벨트 불필요), 분리형 백레스트(백리스 부스터 변환), 헤드레스트 높이 조절, 이중 사이드 프로텍션, 세탁 가능한 커버",
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

    // 이미지 다운로드
    const imgRes = await fetch(p.imageUrl, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!imgRes.ok) throw new Error(`이미지 다운로드 실패 (${imgRes.status}): ${p.name}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
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
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
