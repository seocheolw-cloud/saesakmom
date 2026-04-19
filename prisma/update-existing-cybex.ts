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
  feature: "cmo563z4v0012tgtcu1xu4tx5",
};

type Update = {
  name: string;
  description: string;
  specs: { size: string; weight: string; height: string; age: string; feature: string };
};

const updates: Update[] = [
  {
    name: "제로나 T",
    description:
      "신생아부터 약 4세까지 사용 가능한 360° 회전형 컨버터블 카시트. Base T 베이스에 로드레그와 ISOFIX로 안정적으로 설치되며, 회전 구조 덕분에 차량 내 승하차가 한결 수월합니다.\n\n전/후향 모두 5단 리클라인과 12단 헤드레스트로 성장에 맞춰 조절할 수 있으며, LSP(Linear Side-impact Protection) 시스템이 측면 충돌 에너지를 흡수합니다. 신생아 인레이가 기본 제공되어 작은 체구의 아이도 이상적인 자세로 탑승할 수 있습니다.",
    specs: {
      size: "W430 / L715 / H680",
      weight: "15 (베이스 포함)",
      height: "45-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      feature:
        "360° 회전, 12단 헤드레스트, 전/후향 5단 리클라인, LSP 측면충돌보호, 신생아 인레이 포함",
    },
  },
  {
    name: "제로나 Gi",
    description:
      "ADAC · Stiftung Warentest(2024) Best in Class를 수상한 플래그십 360° 회전 카시트. 통합 베이스에 ISOFIX와 로드레그를 기본 탑재하여 설치가 간편하고, 시각 인디케이터로 올바른 장착을 바로 확인할 수 있습니다.\n\n신생아 인레이 사용 시 40cm부터 최대 105cm(20kg)까지 사용 가능하며, 12단 헤드레스트와 전/후향 5단 리클라인으로 모든 성장 단계에 맞춰 최적의 자세를 유지합니다. 통합형 LSP와 전면 통풍 구조로 안전성과 쾌적함을 동시에 제공합니다.",
    specs: {
      size: "W440 / L710 / H750",
      weight: "13",
      height: "61-105 (인레이 시 40-)",
      age: "약 3개월 ~ 4세 (최대 20kg, 인레이 사용 시 신생아부터)",
      feature:
        "360° 회전, 12단 헤드레스트, 전/후향 5단 리클라인, 통합 LSP, ADAC Best in Class 2024",
    },
  },
  {
    name: "클라우드T (T모듈 시스템)",
    description:
      "신생아부터 약 24개월까지 사용하는 바구니형 인펀트 카시트. 4.5kg의 경량 설계로 휴대가 쉬우며, T 모듈 시스템 기반으로 Base T에 장착하면 차량용 카시트로, 호환 유모차에 결합하면 모듈형 트래블 시스템으로 전환됩니다.\n\nLSP 측면충돌보호가 기본 탑재되어 측면 충돌 에너지를 최대 25% 흡수하며, 12단 헤드레스트와 차량 내 리클라인·유모차 lie-flat 포지션으로 신생아의 기도 호흡을 편안하게 유지합니다. UPF50+ 선캐노피와 통풍 구조로 장시간 이동에도 쾌적합니다.",
    specs: {
      size: "W440 / L645 / H380-600",
      weight: "4.5",
      height: "45-87",
      age: "신생아 ~ 약 24개월 (최대 13kg)",
      feature:
        "초경량 4.5kg, 12단 헤드레스트, LSP 측면충돌보호, UPF50+ 선캐노피, 유모차 lie-flat 도킹 지원",
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
      await tx.product.update({
        where: { id: product.id },
        data: { description: u.description },
      });

      const pairs = [
        [SPEC.size, u.specs.size],
        [SPEC.weight, u.specs.weight],
        [SPEC.height, u.specs.height],
        [SPEC.age, u.specs.age],
        [SPEC.feature, u.specs.feature],
      ] as const;

      for (const [fieldId, value] of pairs) {
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
