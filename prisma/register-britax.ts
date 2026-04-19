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
const BRAND_ID = "cmo55mi8r0008tgtcjr3qrcan"; // 브라이텍스 (Britax)
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

// 세피앙몰(브라이텍스 공식 유통사) 현행 17종. 이미지는 Safian CDN(1024x1024).
// 우상단에 있는 britax 로고는 후처리 whiten으로 제거.
const products: Product[] = [
  // ─── 바구니 / 인펀트 ─────────────────────────────────
  {
    name: "베이비세이프 프로 i-Size",
    price: 545000,
    description:
      "신생아부터 15개월(40~85cm)까지 후방장착으로 사용하는 인펀트(바구니) 카시트. Ergo Recline 구조로 더 평평한 등받이 각도를 제공해 신생아의 자연스러운 자세를 지원합니다. 플렉스 베이스 iSENSE 또는 VARIO BASE 5Z(별매)에 도킹하거나 차량 3점식 벨트로도 설치 가능하며, 유모차(스마일 5Z·RIO 등)와 결합해 트래블 시스템으로 확장됩니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/c782912f88d9786d472572e3f8ffa7df.jpg",
    specs: {
      size: "W440 / L670 / H580",
      weight: "3.5",
      height: "40-85",
      age: "신생아 ~ 약 15개월 (최대 13kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "Ergo Recline, 5점식 하네스, ISOFIX 베이스 호환, 트래블 시스템 호환, UPF50+ 캐노피",
    },
  },
  {
    name: "베이비세이프 프로 럭스 i-Size",
    price: 625000,
    description:
      "베이비세이프 프로의 프리미엄 에디션. 고급 패브릭 커버와 메모리폼 쿠션이 적용된 인펀트 카시트로, Ergo Recline과 5점식 하네스는 동일하게 유지됩니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/f27c2af9786fc90d5ea36c1434410cc7.jpg",
    specs: {
      size: "W440 / L670 / H580",
      weight: "3.5",
      height: "40-85",
      age: "신생아 ~ 약 15개월 (최대 13kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "Ergo Recline, 프리미엄 패브릭, 메모리폼 쿠션, ISOFIX 베이스 호환",
    },
  },
  {
    name: "베이비세이프 프로 그린센스 i-Size",
    price: 585000,
    description:
      "재활용 원단과 친환경 소재를 적용한 베이비세이프 프로 그린센스 에디션. 안전 성능과 Ergo Recline 기능은 동일하게 유지되며 지속 가능성을 강화했습니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/1bab1d7063b2b1deed3428515bcb4309.jpg",
    specs: {
      size: "W440 / L670 / H580",
      weight: "3.5",
      height: "40-85",
      age: "신생아 ~ 약 15개월 (최대 13kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "Ergo Recline, 재활용 원단(GreenSense), 친환경 소재, ISOFIX 베이스 호환",
    },
  },
  {
    name: "베이비세이프 코어 i-Size",
    price: 280000,
    description:
      "베이비세이프 라인의 엔트리 인펀트 카시트. 차량 3점식 벨트 또는 ISOFIX 베이스로 장착 가능하며 경량 구조로 휴대가 쉽습니다. 5점식 하네스와 측면 충돌 보호가 기본 탑재되어 안전성의 기본을 확보합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/6de6a7ec81f4b1cab69e0888cf75fe6b.jpg",
    specs: {
      size: "W440 / L670 / H580",
      weight: "3.2",
      height: "40-87",
      age: "신생아 ~ 약 15개월 (최대 13kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "경량 3.2kg, 5점식 하네스, ISOFIX/벨트 장착, 측면충돌 보호",
    },
  },

  // ─── 360° 회전형 컨버터블 ─────────────────────────────
  {
    name: "듀얼픽스 프로 i-Size",
    price: 1220000,
    description:
      "브라이텍스의 플래그십 360° 회전 컨버터블 카시트. 신생아(40cm)부터 약 4세(105cm/19kg)까지 사용하며, 후향/전향 전환이 한 시트로 가능합니다. ISOFIX + 서포트 레그 베이스가 통합되어 설치가 간편하고, 측면충돌 보호와 리클라인 조절이 포함됩니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202602/9f797594df276ebdef877b21d0e83b08.jpg",
    specs: {
      size: "W440 / L740 / H630-730",
      weight: "13",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 19kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, 후향/전향 전환, ISOFIX + 서포트 레그, 리클라인, 측면충돌 보호",
    },
  },
  {
    name: "듀얼픽스 프로 스타일 i-Size",
    price: 1350000,
    description:
      "듀얼픽스 프로 기반의 스타일 에디션. 프리미엄 패브릭과 색상 조합, 추가 쿠션이 특징이며 회전·리클라인 등 핵심 구조는 동일합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/d00ff9e7a2eea5a7f90b8ec6922488bf.jpg",
    specs: {
      size: "W440 / L740 / H630-730",
      weight: "13",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 19kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, 스타일 프리미엄 패브릭, ISOFIX + 서포트 레그, 측면충돌 보호",
    },
  },
  {
    name: "듀얼픽스 프로 럭스 i-Size",
    price: 1380000,
    description:
      "듀얼픽스 프로의 최상위 럭스 에디션. 최고급 퀼팅 패브릭과 부드러운 이너쿠션을 적용했으며 360° 회전·ISOFIX 베이스·측면충돌 보호 기능은 동일합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/ff59f457acc250bdb7b0a8fd68d3142f.jpg",
    specs: {
      size: "W440 / L740 / H630-730",
      weight: "13",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 19kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, LUX 최고급 퀼팅 패브릭, ISOFIX + 서포트 레그, 측면충돌 보호",
    },
  },
  {
    name: "듀얼픽스 플러스 i-Size",
    price: 950000,
    description:
      "듀얼픽스 라인의 중가형 360° 회전 카시트. 12.5kg 본체와 44×74×73cm 치수, 분리형 커버(세탁 용이), 리클라인 조절을 제공합니다. ISOFIX + 서포트 레그로 안정적인 설치가 가능합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202602/2866f5e6b18f314e45ced402633c897f.jpg",
    specs: {
      size: "W440 / L740 / H730",
      weight: "12.5",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 19kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, 후향/전향 전환, 분리형 세탁 커버, ISOFIX + 서포트 레그, 측면충돌 보호",
    },
  },
  {
    name: "듀얼픽스 플러스 스타일 i-Size",
    price: 1050000,
    description:
      "듀얼픽스 플러스의 스타일 에디션. 기본 모델 대비 프리미엄 패브릭과 색상 디자인을 강화했으며 회전·안전 구조는 동일합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202602/917053a83bea115ad4b2c9fd23998eba.jpg",
    specs: {
      size: "W440 / L740 / H730",
      weight: "12.5",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 19kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, 스타일 프리미엄 패브릭, ISOFIX + 서포트 레그, 측면충돌 보호",
    },
  },
  {
    name: "듀얼픽스 플러스 써모 i-Size",
    price: 1050000,
    description:
      "듀얼픽스 플러스 기반의 써모(Thermo) 에디션. 여름에는 통풍 메시, 겨울에는 체온 보온을 돕는 듀얼 써모 패브릭을 적용했으며 회전·안전 구조는 동일합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/1e7d91a2766fe9bb3eac4028e2ecf94d.jpg",
    specs: {
      size: "W440 / L740 / H730",
      weight: "12.5",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 19kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, 듀얼 써모 패브릭(통풍·보온), ISOFIX + 서포트 레그, 측면충돌 보호",
    },
  },

  // ─── 토들러 + 주니어 (9~36kg / 15개월~12세) ─────────────
  {
    name: "어드밴스픽스 프로 i-Size",
    price: 785000,
    description:
      "15개월부터 12세까지 한 제품으로 사용하는 토들러+주니어 i-Size 카시트. 9~18kg 구간은 5점식 하네스로, 이후는 차량 안전벨트로 사용 모드를 전환합니다. ISOFIX + 탑테더 고정, XP-PAD 추가 안전 쿠션(옵션), 헤드레스트 다단 조절을 제공합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/d499b9cc64e176f89b8558cc973f475a.jpg",
    specs: {
      size: "W460 / L520 / H670-830",
      weight: "9",
      height: "76-150",
      age: "약 15개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "5점식 하네스 → 안전벨트 전환, ISOFIX + 탑테더, 헤드레스트 다단 조절, 분리형 백레스트",
    },
  },
  {
    name: "어드밴스픽스 프로 스타일 i-Size",
    price: 850000,
    description:
      "어드밴스픽스 프로의 스타일 에디션. 프리미엄 컬러 & 패브릭 매칭을 강화한 변형 모델로 안전 구조는 동일합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/091c591b14b26a07287917f5df97b8eb.jpg",
    specs: {
      size: "W460 / L520 / H670-830",
      weight: "9",
      height: "76-150",
      age: "약 15개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "5점식 하네스 → 안전벨트 전환, ISOFIX + 탑테더, 스타일 프리미엄 패브릭, 헤드레스트 다단 조절",
    },
  },
  {
    name: "어드밴스픽스 프로 럭스 i-Size",
    price: 890000,
    description:
      "어드밴스픽스 프로 라인의 LUX 에디션. 최고급 패브릭과 메모리폼 쿠션을 적용한 프리미엄 토들러+주니어 카시트입니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/6b6dcdb1cbd3c76a29cc30270adfc0b5.jpg",
    specs: {
      size: "W460 / L520 / H670-830",
      weight: "9",
      height: "76-150",
      age: "약 15개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "5점식 하네스 → 안전벨트 전환, LUX 최고급 패브릭, 메모리폼 쿠션, ISOFIX + 탑테더",
    },
  },
  {
    name: "베르사픽스 i-Size",
    price: 620000,
    description:
      "토들러+주니어 겸용 i-Size 카시트. 76~150cm 범위에 대응하며, 9~18kg은 5점식 하네스, 이후는 차량 안전벨트로 전환합니다. ISOFIX + 탑테더 장착과 헤드레스트·리클라인 조절이 제공됩니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/d25d4c5b983d04376ccd5b0bf9cf4e69.jpg",
    specs: {
      size: "W460 / L520 / H670-830",
      weight: "8.5",
      height: "76-150",
      age: "약 15개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "5점식 하네스 → 안전벨트 전환, ISOFIX + 탑테더, 리클라인 조절, 측면충돌 보호",
    },
  },

  // ─── 주니어 부스터 (15~36kg / 3~12세) ───────────────
  {
    name: "키드픽스 프로 i-Size",
    price: 645000,
    description:
      "100~150cm 주니어 전용 i-Size 하이백 부스터. 컴팩트 슬림 디자인으로 뒷좌석에 3대까지 설치 가능하며, ISOFIX로 단단히 고정됩니다. 차량 3점식 벨트로 아이를 고정하고, 헤드레스트·어깨 폭 자동 조절(3D 멀티가드) 기능을 제공합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/d98050c7279824844e0ed49314637c05.jpg",
    specs: {
      size: "W430 / L450 / H590-770",
      weight: "6.1",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "ISOFIX 고정, 3D 멀티가드 헤드레스트·숄더 자동 조절, 컴팩트 슬림 디자인, 측면충돌 보호",
    },
  },
  {
    name: "키드픽스 프로 럭스 i-Size",
    price: 680000,
    description:
      "키드픽스 프로의 LUX 에디션. 최고급 패브릭과 쿠션감을 강화했으며, 안전 구조와 3D 멀티가드는 동일합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202601/fef53b7b12b9fdc60fcb6f881ed270e9.jpg",
    specs: {
      size: "W430 / L450 / H590-770",
      weight: "6.1",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "ISOFIX 고정, LUX 최고급 패브릭, 3D 멀티가드 헤드레스트·숄더 자동 조절, 측면충돌 보호",
    },
  },
  {
    name: "하이포인트",
    price: 365000,
    description:
      "경량 휴대용 주니어 부스터. ISOFIX 커넥터로 장착되며 접이식 팔걸이와 간단한 구조로 2차량·할부모 차량용 서브 카시트로 적합합니다.",
    imageUrl: "https://safian.co.kr/web/product/big/202602/29f757ca1f1dd437bf65443815c45576.jpg",
    specs: {
      size: "W430 / L420 / H670",
      weight: "4.5",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인",
      feature: "경량 4.5kg, ISOFIX 커넥터 고정, 접이식 팔걸이, 분리형 백레스트",
    },
  },
];

// Safian 이미지의 우상단 Britax 로고 제거 (1024x1024 기준)
function stripBritaxLogo(data: Buffer, width: number, height: number, channels: number) {
  // 1. near-white → pure white
  for (let i = 0; i < data.length; i += channels) {
    if (data[i] >= 200 && data[i + 1] >= 200 && data[i + 2] >= 200) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  // 2. 로고 영역 (우상단 ~760-1024 × 0-110)
  const x1 = Math.floor(width * 0.76);
  const y2 = Math.floor(height * 0.11);
  for (let y = 0; y < y2; y++) {
    for (let x = x1; x < width; x++) {
      const i = (y * width + x) * channels;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
}

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
    const rawBuf = Buffer.from(await imgRes.arrayBuffer());

    // Britax 로고 제거 + 배경 화이트닝
    const { data, info } = await sharp(rawBuf).raw().toBuffer({ resolveWithObject: true });
    const processed = Buffer.from(data);
    stripBritaxLogo(processed, info.width, info.height, info.channels);

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const destPath = path.join(dir, fileName);
    await sharp(processed, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .jpeg({ quality: 90 })
      .toFile(destPath);

    const publicUrl = `/uploads/products/${fileName}`;
    const size = (await fs.stat(destPath)).size;

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
    console.log(`ADD: ${p.name} — ${p.price.toLocaleString()}원 — ${publicUrl} (${Math.round(size / 1024)}KB)`);
    created++;
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
