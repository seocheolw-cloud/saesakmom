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
const BRAND_ID = "cmo55n297000dtgtcb4sl8upk"; // 다이치 (Daiichi)
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
    name: "원픽스 360 시즌3 에어 i-Size",
    price: 990000,
    description:
      "다이치 회전형 카시트 플래그십. 에어메시 패브릭으로 통기성을 높인 시즌3 모델로, 360° 회전과 40mm 추가 레그룸으로 장거리 주행에서도 아이의 자세가 편안합니다. UN R129/03(i-Size) 인증을 획득했으며, 서포팅 레그와 리바운드 스토퍼, 측면충돌 보호가 기본 장착됩니다. 한국산(Made in Korea).",
    imageUrl: "https://www.babyseatmall.net/data/goods/16/1658/3_bk.view.jpg",
    specs: {
      size: "W440 / L640 / H660",
      weight: "13.4",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature:
        "360° 회전, 에어메시 통풍, 서포팅 레그, 리바운드 스토퍼, LSP 측면충돌보호, 40mm 추가 레그룸, 한국산",
    },
  },
  {
    name: "원픽스 360 리우 i-Size",
    price: 860000,
    description:
      "원픽스 360 라인의 중가 모델. 360° 회전 구조에 UN R129/03(i-Size) 인증을 받아, 국내 브랜드 최초로 뒤보기 기준 105cm·18kg까지 후향장착이 가능합니다. 서포팅 레그와 리바운드 스토퍼, 측면충돌 보호를 기본 탑재하고, 차량 벨트 없이 ISOFIX만으로 단단히 고정됩니다.",
    imageUrl: "https://www.babyseatmall.net/data/goods/17/1784/black.view.jpg",
    specs: {
      size: "W440 / L640 / H660",
      weight: "13.4",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature:
        "360° 회전, ISOFIX 고정, 서포팅 레그, 리바운드 스토퍼, 측면충돌 보호, 국내 브랜드 최초 18kg 후향장착",
    },
  },
  {
    name: "블리바 360 시즌2 i-Size",
    price: 640000,
    description:
      "신생아부터 약 7세까지 한 제품으로 사용하는 올인원 360° 회전 카시트. 후향·전향 전환이 가능하고, 최신 UN R129(i-Size) 안전 기준을 충족합니다. 블리바픽스 베이스 시스템과 결합해 모듈러 카시트 시스템을 구성할 수 있으며, 서포팅 레그와 측면 보호 패드가 포함되어 있습니다. 본 구성은 머시룸 색상, 베이스, 선바이저, 보호매트 포함.",
    imageUrl: "https://www.babyseatmall.net/data/goods/15/1569/mus_1.view.jpg",
    specs: {
      size: "W450 / L595 / H600",
      weight: "12.1",
      height: "40-125",
      age: "신생아 ~ 약 7세 (최대 25kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "360° 회전, 후향/전향 전환, 올인원 (신생아~7세), 서포팅 레그, 측면충돌 보호, 블리바픽스 모듈러 시스템 호환",
    },
  },
  {
    name: "브이가드 토들러 시즌3 에어 ISOFIX",
    price: 550000,
    description:
      "9kg부터 36kg까지 사용하는 에어메시 구조의 토들러+주니어 겸용 카시트. 5점식 하네스(9~18kg) → 차량 안전벨트(15~36kg)로 성장에 맞춰 모드를 전환할 수 있으며, 11단 헤드레스트와 V-SHAPE 확장 시트로 몸에 맞춰 폭이 벌어집니다. ISOFIX + 탑테더 고정.",
    imageUrl: "https://www.babyseatmall.net/data/goods/16/1673/3TO.view.jpg",
    specs: {
      size: "W500 / L400 / H640",
      weight: "9.5",
      height: "75-145",
      age: "약 9개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인",
      feature:
        "에어메시 통풍, V-SHAPE 확장 시트, 5점식 하네스 → 안전벨트 전환, 11단 헤드레스트, ISOFIX + 탑테더, 컵홀더·보호매트 포함",
    },
  },
  {
    name: "브이가드 주니어 시즌3 에어 ISOFIX",
    price: 470000,
    description:
      "15~36kg 주니어 전용 에어메시 ISOFIX 하이백 부스터. 차량 안전벨트로 아이를 고정하는 Group 2-3 규격이며, V-SHAPE 확장 시트로 폭을 자동 조절하고 11단 헤드레스트와 분리형 백레스트를 제공합니다. 컵홀더·보호매트 포함 패키지.",
    imageUrl: "https://www.babyseatmall.net/data/goods/16/1674/3JU.view.jpg",
    specs: {
      size: "W500 / L400 / H640",
      weight: "9.5",
      height: "100-145",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인",
      feature:
        "에어메시 통풍, V-SHAPE 확장 시트, 11단 헤드레스트, 분리형 백레스트, ISOFIX + 탑테더, 컵홀더·보호매트 포함",
    },
  },
  {
    name: "이노픽스 프라임 주니어 ISOFIX",
    price: 169000,
    description:
      "다이치의 가성비 주니어 ISOFIX 부스터. ISOFIX 히든 슬롯 구조로 차량에 단단히 고정되고, 차량 안전벨트로 아이를 고정합니다. 15~36kg 구간을 커버하며 경량 3.3kg으로 차량 이동과 2차량 장착이 간편합니다.",
    imageUrl: "https://www.babyseatmall.net/data/goods/18/1812/innofix2.view.jpg",
    specs: {
      size: "W400 / L400 / H690",
      weight: "3.3",
      height: "100-145",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인",
      feature:
        "ISOFIX 히든 슬롯, 경량 3.3kg, 분리형 백레스트(부스터 변환), 헤드레스트 높이 조절, 사이드 프로텍션",
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
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
