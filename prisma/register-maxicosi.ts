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
const BRAND_ID = "cmo55mlro0009tgtcywhasvl4"; // 맥시코시 (Maxi-Cosi)
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

// 맥시코시 엠베이비(mbaby.co.kr) 공식 유통 기준 현행 카시트 4종.
// 이미지는 Maxi-Cosi 글로벌 공식 카탈로그(images.maxi-cosi.com) 히어로 샷.
const products: Product[] = [
  {
    name: "미카 360 프로 슬라이드 텍 i-Size",
    price: 1400000,
    description:
      "맥시코시의 최신 회전형 카시트. FlexiSpin 360° 회전에 시트가 차량 밖으로 170mm까지 미끄러지는 SlideTech® 구조가 더해져, 허리를 굽히지 않고 아이를 편하게 태우고 내릴 수 있습니다. 헤드레스트에 AirProtect® 안전 쿠션이 적용되어 측면 충격 시 머리 부상 위험을 최대 20% 감소시키며, ISOFIX + 서포트 레그 베이스 일체형으로 안정적인 설치가 가능합니다. 5단 리클라인과 신생아 인레이 기본 제공.",
    imageUrl:
      "https://images.maxi-cosi.co.uk/dorel-public-storage-prod/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/8/5/8549251110_2024_maxicosi_carseat_babytoddlercarseat_mica360pro_rearwardfacing_brown_authentictruffle_3qrtleft.png",
    specs: {
      size: "W440 / L660 / H650",
      weight: "14.9",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "FlexiSpin 360° 회전, SlideTech 170mm 슬라이드, AirProtect 헤드레스트, 5단 리클라인, ISOFIX + 서포트 레그, 신생아 인레이",
    },
  },
  {
    name: "미카 프로 에코 i-Size",
    price: 1150000,
    description:
      "100% 재활용 원단을 사용한 친환경 360° 회전형 카시트. G-CELL 2.0 측면충돌 보호 시스템이 다방향 3D 충격 흡수를 제공하며, 신생아부터 4세(105cm)까지 한 제품으로 후향·전향 전환이 가능합니다. 10단 헤드레스트와 리클라인 조절로 모든 성장 단계에 맞는 자세를 지원하며, ISOFIX + 서포트 레그 베이스가 통합되어 있습니다.",
    imageUrl:
      "https://images.maxi-cosi.com/dorel-public-storage-prod/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/8/5/8515550110_2025_maxicosi_carseat_babytoddlercarseat_micaproecoisize_rearwardfacing_grey_authenticgraphite_3qrtleft.png",
    specs: {
      size: "W470 / L680 / H630",
      weight: "14.7",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "360° 회전, G-CELL 2.0 측면충돌 보호, 100% 재활용 원단, 10단 헤드레스트, ISOFIX + 서포트 레그, 후향/전향 전환",
    },
  },
  {
    name: "타이탄 프로 i-Size",
    price: 660000,
    description:
      "9kg부터 36kg까지 한 제품으로 사용하는 토들러+주니어 겸용 i-Size 카시트. 9~18kg 구간은 5점식 하네스로, 15kg 이상부터는 차량 안전벨트로 사용 모드를 전환합니다. 11단 헤드레스트와 3단 리클라인, ClimaFlow 통풍 구조로 장시간 주행에도 쾌적하며, ISOFIX + 탑테더 고정이 기본 제공됩니다.",
    imageUrl:
      "https://images.maxi-cosi.com/dorel-public-storage-prod/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/8/6/8618251110_2024_maxicosi_carseat_toddlerchildcarseat_titanproisize_brown_authentictruffle_3qrtleft_.png",
    specs: {
      size: "W460 / L530 / H760",
      weight: "14",
      height: "76-150",
      age: "약 9개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "5점식 하네스 → 안전벨트 전환, 11단 헤드레스트, 3단 리클라인, ClimaFlow 통풍 구조, ISOFIX + 탑테더, 측면충돌 보호",
    },
  },
  {
    name: "로디픽스 프로 i-Size",
    price: 440000,
    description:
      "100~150cm 주니어 전용 i-Size 하이백 부스터. ISOFIX로 차량에 단단히 고정되고 차량 3점식 벨트로 아이를 고정하며, 분리형 백레스트로 백리스 부스터 전환이 가능합니다. 헤드레스트에 AirProtect® 쿠션이 내장되어 측면 충격 시 머리 보호 성능을 높였고, 3단 리클라인 위치와 확장 가능한 쇼울더/헤드 지지구조로 성장에 맞춰 사용합니다.",
    imageUrl:
      "https://images.maxi-cosi.com/dorel-public-storage-prod/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/8/8/8800251110_2024_maxicosi_carseat_childcarseat_rodifixpro2isize_brown_authentictruffle_3qrtleft.png",
    specs: {
      size: "W420 / L440 / H580",
      weight: "5.9",
      height: "100-150",
      age: "약 3.5~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "AirProtect 헤드레스트 쿠션, ISOFIX 고정, 3단 리클라인, 분리형 백레스트(부스터 변환), 확장형 쇼울더/헤드 서포트, 경량 5.9kg",
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
    const ext = p.imageUrl.toLowerCase().endsWith(".png") ? "png" : "jpg";
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
