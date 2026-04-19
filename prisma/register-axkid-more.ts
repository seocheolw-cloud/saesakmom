import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";

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
  imageSrc: string; // 로컬 파일 (이미 다운로드한 이미지) 또는 URL
  whiteBoxes?: [number, number, number, number][]; // 마케팅 오버레이 제거 박스 (1000x1000 기준)
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
    name: "악스키드 스핀키드 (Axkid Spinkid)",
    price: 930000,
    description:
      "신생아부터 약 4세(18kg/105cm)까지 사용하는 360° 회전 i-Size 카시트. 스웨덴 Axkid의 회전형 라인 기본 모델로, ISOFIX + 서포트 레그 베이스에 장착되며 후향/전향 전환이 가능합니다. 5점식 하네스와 측면충돌 보호가 기본 탑재되어 있습니다.",
    imageSrc: "ax-g-spinkid.png",
    specs: {
      size: "W450 / L660 / H640",
      weight: "14",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, 후향/전향 전환, ISOFIX + 서포트 레그, 5점식 하네스, 측면충돌 보호",
    },
  },
  {
    name: "악스키드 스핀키드 에어셀 (Axkid Spinkid Air Cell)",
    price: 950000,
    description:
      "스핀키드의 에어메시 변종. 통풍성이 강화된 에어셀 패브릭과 개선된 쿠션 구조로 여름 주행에 쾌적하며, 360° 회전 메커니즘과 ISOFIX + 서포트 레그 베이스 구조는 동일합니다.",
    imageSrc: "ax-prev-spinkid-aircell.jpg",
    whiteBoxes: [
      [0, 0, 1000, 290], // 상단 "AXKID SPINKID / AIR CELL BEIGE" 텍스트
      [0, 910, 260, 1000], // 좌하단 AXKID 로고
    ],
    specs: {
      size: "W450 / L660 / H640",
      weight: "14",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, 에어셀 통풍 패브릭, 후향/전향 전환, ISOFIX + 서포트 레그, 5점식 하네스, 측면충돌 보호",
    },
  },
  {
    name: "악스키드 업 (Axkid Up)",
    price: 839000,
    description:
      "100~150cm 주니어 대상 i-Size 하이백 부스터. ISOFIX로 차량에 단단히 고정되고, 차량 3점식 벨트로 아이를 고정합니다. 스웨덴 Axkid의 프리미엄 마감과 측면충돌 보호 구조를 계승하며 헤드레스트·숄더 폭 조절을 제공합니다.",
    imageSrc: "ax-g-up.png",
    specs: {
      size: "W450 / L450 / H640-820",
      weight: "7.5",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "ISOFIX 고정, 헤드레스트·숄더 폭 조절, 측면충돌 보호, 통풍 메시 원단, 분리형 백레스트",
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

    const srcPath = path.resolve(p.imageSrc);
    let processedBuf: Buffer;
    let ext: string;

    if (p.whiteBoxes && p.whiteBoxes.length > 0) {
      const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
      const out = Buffer.from(data);
      // near-white 화이트닝
      for (let i = 0; i < out.length; i += info.channels) {
        if (out[i] >= 210 && out[i + 1] >= 210 && out[i + 2] >= 210) {
          out[i] = 255;
          out[i + 1] = 255;
          out[i + 2] = 255;
        }
      }
      // 오버레이 제거 박스
      for (const [x1, y1, x2, y2] of p.whiteBoxes) {
        for (let y = Math.max(0, y1); y < Math.min(info.height, y2); y++) {
          for (let x = Math.max(0, x1); x < Math.min(info.width, x2); x++) {
            const i = (y * info.width + x) * info.channels;
            out[i] = 255;
            out[i + 1] = 255;
            out[i + 2] = 255;
          }
        }
      }
      processedBuf = await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
        .jpeg({ quality: 92 })
        .toBuffer();
      ext = "jpg";
    } else {
      processedBuf = await fs.readFile(srcPath);
      ext = p.imageSrc.endsWith(".png") ? "png" : "jpg";
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const destPath = path.join(dir, fileName);
    await fs.writeFile(destPath, processedBuf);
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
    console.log(`ADD: ${p.name} — ${p.price.toLocaleString()}원 — ${publicUrl} (${Math.round(processedBuf.length / 1024)}KB)`);
    created++;
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
