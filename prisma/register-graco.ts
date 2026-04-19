import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const TYPE_ID = "cmo05l6or003f2otcf3pswzwo";
const BRAND_ID = "cmo55nzpj000mtgtc2sq11ype"; // 그라코 (Graco)
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
    name: "에이픽스",
    price: 178000,
    description:
      "그라코 대표 주니어 하이백 부스터 카시트. 상단 테더와 ISOCATCH(라이트-클릭) 커넥터로 좌석에 단단히 고정되며, 3점식 차량 벨트로 아이를 고정합니다. 헤드레스트 높이와 시트 폭이 함께 조절되는 SafeAdjust 시스템으로 성장 단계에 맞춰 사용할 수 있고, 분리형 백레스트로 백리스 부스터 전환이 가능합니다. 국내에서는 코스트코와 그라코 공식몰을 통해 유통됩니다.",
    specs: {
      size: "W440 / L400 / H620-820",
      weight: "4.5",
      height: "100-145",
      age: "약 4~12세 (15~36kg)",
      cert: "KC 안전확인 (ECE R44/04)",
      feature:
        "ISOCATCH 커넥터, 3점식 벨트, SafeAdjust 헤드레스트, 분리형 백레스트(부스터 변환), 컵홀더",
    },
  },
  {
    name: "로지코 LX 컴포트",
    price: 148000,
    description:
      "이중 EPS 폼과 강화 플라스틱 쉘로 측면 충격을 흡수하는 프리미엄 주니어 하이백 부스터. 헤드레스트에 통합된 안전벨트 가이드가 어깨 라인을 자연스럽게 잡아주며, 기계 세탁 가능한 커버와 분리형 백레스트로 백리스 부스터까지 한 제품으로 활용할 수 있습니다. ISOFIX 벨트 포함 에디션으로 국내 정식 판매됩니다.",
    specs: {
      size: "W400 / L400 / H690-820",
      weight: "3.65",
      height: "100-145",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인 (ECE R44/04)",
      feature:
        "이중 EPS 측면충돌보호, 6단 헤드레스트, ISOFIX 벨트 포함, 분리형 백레스트, 컵홀더",
    },
  },
  {
    name: "랠리 스포츠",
    price: 118000,
    description:
      "스포티한 디자인의 경량 주니어 부스터. 3.65kg의 가벼운 무게로 차량 이동과 장착이 간편하며, 헤드레스트 6단 조절과 분리형 백레스트로 아이의 성장에 맞춰 사용 형태를 바꿀 수 있습니다. 양쪽에 수납홀더(컵홀더)를 갖춰 주스·간식 보관이 편리합니다.",
    specs: {
      size: "W400 / L400 / H690-820",
      weight: "3.65",
      height: "90-145",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인 (ECE R44/04)",
      feature:
        "경량 3.65kg, 6단 헤드레스트, 분리형 백레스트, 양쪽 수납홀더, 안전벨트 고정 (ISOFIX 에디션 별매)",
    },
  },
  {
    name: "주니어 맥시",
    price: 98000,
    description:
      "그라코의 입문형 주니어 부스터 카시트. 국내 카시트 규격에 맞춘 가성비 모델로 3.65kg의 경량 구조, 헤드레스트 6단 조절, 컵홀더, 분리형 백레스트를 제공합니다. 보조석 이동이 잦은 차량이나 할부모 차량용 추가 시트로 적합합니다.",
    specs: {
      size: "W400 / L400 / H690-820",
      weight: "3.65",
      height: "90-145",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인 (ECE R44/04)",
      feature: "경량 3.65kg, 6단 헤드레스트, 분리형 백레스트, 양쪽 컵홀더, 안전벨트 고정",
    },
  },
  {
    name: "노틸러스",
    price: 398000,
    description:
      "9kg부터 36kg까지 한 제품으로 사용하는 3-in-1 하네스 부스터 카시트. 9~18kg 구간은 5점식 하네스로 고정하고, 15kg 이상부터는 하네스를 빼고 차량 3점식 벨트로 사용하는 하이백 부스터로 전환됩니다. 최종적으로 백레스트를 분리하면 백리스 부스터로도 사용 가능합니다. 고반발 EPS 헤드 서포트와 5단 높이 조절로 장기간 사용에 최적화되어 있습니다.",
    specs: {
      size: "W490 / L520 / H680-790",
      weight: "6.5",
      height: "70-145",
      age: "약 9개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인 (ECE R44/04)",
      feature:
        "3-in-1 하네스 부스터, 5점식 하네스(9~18kg), 하이백→백리스 변환, 5단 헤드레스트, 고반발 EPS",
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
