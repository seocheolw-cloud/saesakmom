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
const BRAND_ID = "cmo55ng1u000htgtc2quuxfoi"; // 레카로 (Recaro)
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
    name: "프리비아 (Privia)",
    price: 450000,
    description:
      "독일 시트 명가 레카로의 바구니형 신생아 카시트. 5점식 하네스와 측면충돌 보호 구조, ISOFIX 픽스 베이스(별매) 호환으로 차량 탈착이 간편합니다. 이너시트와 헤드레스트 조절로 작은 체구의 아이도 안정적인 자세를 유지하며, 경량 3.7kg 구조로 휴대가 편리합니다.",
    imageUrl: "http://recaro-automotive.co.kr/data/file/kids/17_copy_25_1925899320_vIyzpsNb_9e10152e421cc257db29f58151cef2b5c72c0878.jpg",
    specs: {
      size: "W350 / L650 / H570",
      weight: "3.7",
      height: "45-87",
      age: "신생아 ~ 약 15개월 (최대 13kg)",
      cert: "KC 안전확인, ECE R44/04",
      feature: "5점식 하네스, ISOFIX 베이스 호환, 측면충돌 보호, 이너시트, 헤드레스트 조절",
    },
  },
  {
    name: "제로원 i-Size (Zero.1 i-Size)",
    price: 780000,
    description:
      "레카로의 360° 회전형 컨버터블 카시트. 신생아부터 약 6세(125cm)까지 후향/전향 전환이 가능하며, ISOFIX 베이스에 서포트 레그를 통합해 빨강·초록 시각 인디케이터로 올바른 설치를 바로 확인할 수 있습니다. 자동차 레이서의 목 보호 장치(HANS)에서 영감을 얻은 'HERO 시스템' 하네스 가이드가 적용되어 있습니다.",
    imageUrl: "http://recaro-automotive.co.kr/data/file/kids/thumb-16_copy_24_1925899320_9aPO087v_575f8210d20ea11dbc128e2bd19204274daaa36e_600x600.png",
    specs: {
      size: "W460 / L705 / H650",
      weight: "14",
      height: "45-125",
      age: "신생아 ~ 약 6세 (최대 18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, ISOFIX + 서포트 레그, HERO 시스템 하네스, 설치 인디케이터, 조립형 이너쿠션",
    },
  },
  {
    name: "제논 (Xenon i-Size)",
    price: 830000,
    description:
      "2025년 출시된 레카로 차세대 컨버터블 카시트. 신생아부터 약 6세까지 한 제품으로 사용하며, 360° 회전과 한 손 조절 시스템, 170° 리클라인 각도를 제공합니다. 5점식 하네스와 허니콤 메쉬 패널이 안전성과 통기성을 동시에 확보하며, ISOFIX 베이스에 서포트 레그가 통합되어 있습니다.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2025/04/17/15/1/501bec74-9d3f-48bd-8a26-574f9786eac7.jpg",
    specs: {
      size: "W460 / L700 / H630-700",
      weight: "11.9",
      height: "40-125",
      age: "신생아 ~ 약 6세 (최대 ~18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, 한 손 조절 시스템, 170° 리클라인, 5점식 하네스, ISOFIX + 서포트 레그, 허니콤 메쉬",
    },
  },
  {
    name: "마코엘리트 2 (Mako Elite 2 i-Size)",
    price: 480000,
    description:
      "100~150cm 주니어 대상 i-Size 하이백 부스터. 헤드레스트에 통합된 레카로 사운드 시스템(블루투스 스피커)과 통풍 구조가 특징이며, 높이 조절형 헤드레스트·확장형 레그레스트로 장시간 주행에도 편안한 자세를 유지합니다. ISOFIX로 단단히 고정되며 차량 3점식 벨트로 아이를 고정합니다.",
    imageUrl: "http://recaro-automotive.co.kr/data/file/kids/thumb-15_copy_23_1925899320_3kFrUT1A_990530a1b566c657f47ee945abd88de427249f79_600x600.png",
    specs: {
      size: "W440 / L530 / H605-805",
      weight: "7.5",
      height: "100-150",
      age: "약 3.5~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "헤드레스트 내장 블루투스 스피커, 통풍 구조, 높이 조절 헤드레스트, 확장형 레그레스트, ISOFIX 고정",
    },
  },
  {
    name: "몬자노바 EVO (Monza Nova EVO)",
    price: 390000,
    description:
      "레카로 몬자노바 시리즈의 EVO 버전 주니어 카시트. 11단 헤드레스트 조절과 메모리폼 쿠션이 적용된 팔걸이, 머리부터 골반까지 감싸는 풀 사이드 임팩트 프로텍션으로 안전성을 확보합니다. 인체공학 V자 시트 설계로 성장 단계에 맞는 밀착감을 제공합니다.",
    imageUrl: "http://recaro-automotive.co.kr/data/file/kids/thumb-6_copy_22_33254296_Zf2pKTzW_7b0dad782f16ae6c95b49af16fdafed733ec414d_600x600.png",
    specs: {
      size: "W540 / L450 / H670-810",
      weight: "6.5",
      height: "95-150",
      age: "약 3~11세 (15~36kg)",
      cert: "KC 안전확인, ECE R44/04",
      feature: "11단 헤드레스트, 메모리폼 팔걸이, 풀 사이드 임팩트 프로텍션, V자 인체공학 시트",
    },
  },
  {
    name: "액시언 (Axion i-Size)",
    price: 520000,
    description:
      "2025년 출시된 레카로 주니어 카시트. 업계 최초 이중 레이어 측면 프레임 '세이프티 존'과 8중 측면 충돌 보호, 헥사고날 내부 설계를 적용해 안전성을 강화했으며, 12단 헤드레스트와 V형 성장 확장 구조로 체형에 맞춰 폭이 벌어집니다. 2025 ADAC 카시트 테스트에서 주니어 카시트 중 최고점인 2.1점(좋음)을 기록했습니다.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2025/04/16/15/2/dee53ca9-04c1-4a57-9711-66b1116d116b.jpg",
    specs: {
      size: "W450 / L510 / H630-820",
      weight: "7.8",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size), ADAC 2.1 (2025)",
      feature:
        "세이프티 존 이중 레이어 프레임, 8중 측면 충돌 보호, 헥사고날 구조, 12단 헤드레스트, V형 확장 시트, 메쉬 소재",
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
