import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const SPEC = {
  size: "cmo563z3p000ytgtc61xw95xl",
  weight: "cmo563z40000ztgtcd5j263io",
  height: "cmo563z4b0010tgtc272kvzwg",
  age: "cmo563z4m0011tgtcshlfcuvd",
  cert: "cmo574wst0025tgtc13m4d3g5",
  feature: "cmo563z4v0012tgtcu1xu4tx5",
};

// 팩트체크 반영: 롯데홈쇼핑 공식 상세페이지 기준으로 에이픽스 스펙 정정
// (3.65kg / W400×L400×H690-820mm / 3~12세)
// 노틸러스 치수는 북미 Nautilus LX 공식 스펙(46.7×58.4×72.4cm) 반영
type Update = {
  name: string;
  description?: string;
  specs: Partial<{
    size: string;
    weight: string;
    height: string;
    age: string;
    cert: string;
    feature: string;
  }>;
};

const updates: Update[] = [
  {
    name: "에이픽스",
    description:
      "그라코 대표 주니어 하이백 부스터 카시트. 차량 3점식 벨트로 아이를 고정하며 분리형 백레스트 구조로 백리스 부스터 전환이 가능합니다. 헤드레스트 6단 조절, 양쪽 컵홀더, 경량 3.65kg 구조로 차량 이동과 장착이 쉽습니다. 국내에서는 코스트코와 그라코 공식몰을 통해 유통되며 KC 안전확인을 획득했습니다.",
    specs: {
      size: "W400 / L400 / H690-820",
      weight: "3.65",
      age: "약 3~12세 (15~36kg)",
      feature:
        "분리형 백레스트(백리스 부스터 변환), 6단 헤드레스트, 양쪽 컵홀더, 3점식 벨트 고정, 경량 3.65kg",
    },
  },
  {
    name: "노틸러스",
    specs: {
      size: "W467 / L584 / H680-790",
      weight: "8.5",
      height: "70-145",
    },
  },
];

async function main() {
  for (const u of updates) {
    const product = await prisma.product.findFirst({ where: { name: u.name } });
    if (!product) {
      console.log(`MISS: ${u.name}`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      if (u.description) {
        await tx.product.update({
          where: { id: product.id },
          data: { description: u.description },
        });
      }
      const entries = Object.entries(u.specs) as [keyof typeof SPEC, string][];
      for (const [key, value] of entries) {
        const fieldId = SPEC[key];
        await tx.productSpecValue.upsert({
          where: { productId_fieldId: { productId: product.id, fieldId } },
          update: { value },
          create: { productId: product.id, fieldId, value },
        });
      }
    });

    console.log(`OK: ${u.name}`);
  }
  console.log(`\n완료`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
