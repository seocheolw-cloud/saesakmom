import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const TYPE_ID = "cmo05l6or003f2otcf3pswzwo";
const BRAND_ID = "cmo55mu8t000btgtcrtz99ky3"; // 뉴나 (Nuna)
const SPEC = {
  size: "cmo563z3p000ytgtc61xw95xl",
  weight: "cmo563z40000ztgtcd5j263io",
  height: "cmo563z4b0010tgtc272kvzwg",
  age: "cmo563z4m0011tgtcshlfcuvd",
  cert: "cmo574wst0025tgtc13m4d3g5",
  feature: "cmo563z4v0012tgtcu1xu4tx5",
};

type ProductData = {
  name: string;
  price: number;
  description: string;
  specs: {
    size: string;
    weight: string;
    height: string;
    age: string;
    cert: string;
    feature: string;
  };
};

const products: ProductData[] = [
  {
    name: "피파 넥스트 (PIPA next)",
    price: 670000,
    description:
      "Next System 전용 인펀트(바구니) 카시트. 신생아부터 약 13kg까지 후방장착으로 사용하며, BASE next 또는 부가부 유모차와 도킹해 트래블 시스템으로 확장할 수 있습니다. Tailor Tech 메모리폼 헤드레스트가 7단계로 조절되고, Smart SIP 측면충돌보호가 장착되어 있습니다. Dream Drape 매그네틱 캐노피(UPF 50+)와 TUV 항공 승인을 갖춘 경량 2.8kg 구조가 특징입니다.",
    specs: {
      size: "W440 / L670 / H590",
      weight: "2.8",
      height: "40-83",
      age: "신생아 ~ 약 12개월 (최대 13kg)",
      cert: "UN R129 (i-Size), ADAC 4★ (2022)",
      feature:
        "Next System 호환, Tailor Tech 7단 헤드레스트, Smart SIP 측면충돌보호, Dream Drape 캐노피(UPF50+), 경량 2.8kg, TUV 항공 인증",
    },
  },
  {
    name: "토들 넥스트 (TODL next)",
    price: 1010000,
    description:
      "360° 회전형 컨버터블 카시트. Next System의 BASE next와 결합되어 신생아부터 약 4세(최대 18kg)까지 사용하며, 후향(40~105cm)과 전향(76~105cm, 15개월 이상)을 한 시트로 전환할 수 있습니다. 6단 헤드레스트와 5단 리클라인, 메모리폼 측면충돌보호, 통기성 메시 패널로 안전성과 쾌적함을 동시에 제공합니다. 2022 ADAC 카시트 테스트에서 BASE next와 함께 전체 2.3점(4성)을 기록했습니다.",
    specs: {
      size: "W460 / L760 / H500-680",
      weight: "14",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "UN R129/03 (i-Size), ADAC 4★ (2022)",
      feature:
        "360° 회전, Next System 호환, 6단 헤드레스트, 5단 리클라인, 메모리폼 측면충돌보호, 통기성 메시 패널, GREENGUARD Gold",
    },
  },
  {
    name: "에이스 LX (AACE lx)",
    price: 600000,
    description:
      "100~150cm 주니어 대상 하이백 부스터 카시트. 3D growth™ 성장 시스템이 헤드레스트를 17단계로 올리면 어깨 폭과 시트 깊이까지 함께 확장되어 미취학부터 초등 고학년까지 몸에 맞춘 지지를 유지합니다. ISOFIX로 차량에 단단히 고정하고, 분리 가능한 SIP 측면충돌 패드와 컬러 코드 벨트 가이드로 안전한 장착을 돕습니다. 2023 ADAC 테스트 1.9점(매우 좋음)을 기록했습니다.",
    specs: {
      size: "W450-570 / L430-700 / H640-850",
      weight: "6.7",
      height: "100-150",
      age: "약 4~12세 (100~150cm)",
      cert: "UN R129/03 (i-Size), ADAC 1.9 (2023)",
      feature:
        "3D growth 17단 헤드레스트, 확장형 숄더/시트 뎁스, 탈착형 SIP 측면충돌보호, ISOFIX 고정, 컬러 코드 벨트 가이드, GREENGUARD Gold",
    },
  },
];

async function main() {
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

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
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
    console.log(`ADD: ${p.name} — ${p.price.toLocaleString()}원`);
    created++;
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
