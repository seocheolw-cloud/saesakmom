import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const TYPE_ID = "cmo05l6or003f2otcf3pswzwo";
const BRAND_ID = "cmo55m5qd0007tgtcs6xb9xqk";
const SPEC = {
  size: "cmo563z3p000ytgtc61xw95xl",
  weight: "cmo563z40000ztgtcd5j263io",
  height: "cmo563z4b0010tgtc272kvzwg",
  age: "cmo563z4m0011tgtcshlfcuvd",
  feature: "cmo563z4v0012tgtcu1xu4tx5",
};

type ProductData = {
  name: string;
  price: number;
  description: string;
  specs: { size: string; weight: string; height: string; age: string; feature: string };
};

const products: ProductData[] = [
  {
    name: "솔루션 G2",
    price: 450000,
    description: "100~150cm 주니어 대상 i-Size(UN R129/04) 부스터 카시트. ISOFIX와 3점식 벨트 겸용 가능하며 접이식 구조로 휴대성이 뛰어납니다.",
    specs: {
      size: "W590 / L380 / H550-800",
      weight: "5.8",
      height: "100-150",
      age: "약 3~12세 (15~50kg)",
      feature: "ISOFIX/벨트 겸용, 접이식, 휴대 손잡이",
    },
  },
  {
    name: "아노리스 T2 i-Size",
    price: 1390000,
    description: "임팩트쉴드에 통합 에어백을 탑재한 차세대 전방장착 카시트. 정면 충돌 시 머리·목·몸을 밀리초 단위로 보호하며, 일반 전방장착 대비 50% 향상된 안전성을 제공합니다.",
    specs: {
      size: "W440 / L710 / H750",
      weight: "12",
      height: "76-125",
      age: "15개월 ~ 약 7세 (최대 21kg)",
      feature: "통합 에어백 임팩트쉴드, ISOFIX + 로드레그, 8단 쉴드 깊이 조절",
    },
  },
  {
    name: "솔루션 T Comfort",
    price: 550000,
    description: "프리미엄 컴포트 패브릭을 적용한 i-Size 주니어 카시트. 12단 헤드레스트와 리클라인 기능으로 장거리 이동에도 편안합니다.",
    specs: {
      size: "W505 / L390 / H625-800",
      weight: "7.2",
      height: "100-150",
      age: "약 3~12세 (15~50kg)",
      feature: "컴포트 패브릭, 12단 헤드레스트, 리클라인 2단",
    },
  },
  {
    name: "에이톤 S2 i-Size",
    price: 420000,
    description: "초경량 4.2kg의 바구니형 신생아 카시트. LSP(Linear Side-impact Protection) 측면충돌보호와 11단 헤드레스트로 24개월까지 사용 가능합니다.",
    specs: {
      size: "W440 / L660 / H390",
      weight: "4.2",
      height: "~87",
      age: "신생아 ~ 약 24개월 (최대 13kg)",
      feature: "LSP 측면충돌보호, 11단 헤드레스트, 신생아 인레이",
    },
  },
  {
    name: "솔루션 T Plus",
    price: 720000,
    description: "최신 i-Size(UN R129/03) 주니어 카시트. 3D 메시 통풍 구조와 12단 헤드레스트로 통기성과 맞춤 착용감을 동시에 제공합니다.",
    specs: {
      size: "W505 / L390 / H625-800",
      weight: "7.2",
      height: "100-150",
      age: "약 3~12세 (15~50kg)",
      feature: "i-Size R129 인증, 3D 메시 통풍, 12단 헤드레스트",
    },
  },
  {
    name: "제로나 Zi i-Size",
    price: 950000,
    description: "360° 회전형 컨버터블 카시트. 신생아부터 약 4세까지 후방·전방 전환이 가능하며, 통합 베이스에 로드레그와 ISOFIX를 기본 장착했습니다.",
    specs: {
      size: "W430 / L700 / H635",
      weight: "14",
      height: "45-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      feature: "360° 회전, 후방/전방 전환, 통합 베이스(로드레그+ISOFIX), 리클라인 5단",
    },
  },
  {
    name: "솔루션 Z i-Fix Plus",
    price: 490000,
    description: "Z 라인 하이백 부스터 카시트의 Plus 에디션. 고급 트윌 패브릭과 12단 헤드레스트, 자동 너비 조절을 제공합니다.",
    specs: {
      size: "W530 / L405 / H625",
      weight: "7.2",
      height: "100-150",
      age: "약 3~12세 (15~50kg)",
      feature: "트윌 고급 패브릭, 자동 너비 조절, 12단 헤드레스트",
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
