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
const BRAND_ID = "cmo55mxjf000ctgtc8zoubjba"; // 비세이프 (BeSafe)
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

// 비세이프 코리아(besafekorea.com) 현행 5종 베이스 모델.
// 이미지는 BeSafe 글로벌 공식 CDN(inriverimages/commerce-besafe) 히어로 샷.
const products: Product[] = [
  {
    name: "고비욘드 i-Size (Go Beyond)",
    price: 1400000,
    description:
      "세계 최초로 주행 중에도 아이가 평평하게 누울 수 있는 바구니형 신생아 카시트. 베이스에서 가로로 회전할 수 있어 한 손으로 아이를 태우고 내릴 수 있으며, 피카부(까꿍) 선캐노피로 한쪽만 들어올려 아이를 관찰할 수 있습니다. Go Beyond 전용 베이스(포함)에 ISOFIX + 서포트 레그로 고정됩니다. 베이스 포함 구성 기준.",
    imageUrl:
      "https://www.besafe.com/4a86d9/globalassets/inriverimages/commerce-besafe/11036236_besafe_go-beyond_peak-mesh_right-01.png",
    specs: {
      size: "W440 / L700 / H580",
      weight: "4.5",
      height: "40-83",
      age: "신생아 ~ 약 12개월 (최대 13kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "세계 최초 평평한 배면 각도, 차량 내 회전, 피카부 선캐노피, ISOFIX + 서포트 레그 베이스 포함, 에어백(AIRBAG) 경고 표시",
    },
  },
  {
    name: "이지턴B i-Size (iZi Turn B)",
    price: 825000,
    description:
      "신생아부터 4세(105cm/18kg)까지 사용하는 360° 회전형 컨버터블 카시트. 수평계가 장착된 서포팅 레그로 차량 시트 각도와 무관하게 수평 설치가 가능하고, 신생아 전용 이너시트 베이비쉘이 기본 제공됩니다. 동일 베이스 플랫폼의 이지 트위스트 B가 ADAC 카시트 테스트 1.5점으로 컨버터블 상위 5%를 기록했습니다.",
    imageUrl:
      "https://www.besafe.com/49a3d4/globalassets/inriverimages/commerce-besafe/11009873_besafe_izi-turn-b-i-size_anthracite-mesh_right-01.png",
    specs: {
      size: "W460 / L680 / H660",
      weight: "13",
      height: "40-105",
      age: "신생아 ~ 약 4세 (최대 18kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "360° 회전, 수평계 장착 서포팅 레그, 베이비쉘 신생아 이너시트 포함, ISOFIX 고정, SIP+ 측면충돌 보호",
    },
  },
  {
    name: "비욘드 360 i-Size (Beyond 360)",
    price: 1300000,
    description:
      "신생아부터 6세(125cm/22kg)까지 사용하는 360° 회전 토들러 카시트. Smart Locking Mechanism이 88cm 미만까지는 후향 장착을 강제해 장기 확장형 후방 장착(Extended Rear-Facing)을 보장합니다. 헤드레스트에 Dynamic Force Absorber™, 측면 SIP+ 옵션으로 충돌 에너지를 흡수합니다. 한 손으로 회전과 리클라인 조작이 가능합니다.",
    imageUrl:
      "https://www.besafe.com/49a417/globalassets/inriverimages/commerce-besafe/11036247_besafe_beyond-360_fresh-black-cab_right-01.png",
    specs: {
      size: "W460 / L700 / H650",
      weight: "14",
      height: "40-125",
      age: "신생아 ~ 약 6세 (최대 22kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "360° 회전, Smart Locking(88cm 미만 후향 강제), Dynamic Force Absorber 헤드레스트, SIP+ 측면충돌 보호, 한손 조작 리클라인",
    },
  },
  {
    name: "스트레치 B i-Size (Stretch B)",
    price: 1030000,
    description:
      "신생아부터 7세까지 하나의 카시트로 사용하는 통합형 확장 후방 장착 카시트. 특별한 베이비 이너시트, 헤드레스트/레그룸 조절로 아이의 성장에 맞춰 공간이 확장됩니다. 차량 3점식 안전벨트로 장착되며(ISOFIX 미사용) 후방 장착 전용 설계로 측면 충돌 시 머리와 목을 보호합니다. 2023년 출시.",
    imageUrl:
      "https://www.besafe.com/4a86c2/globalassets/inriverimages/commerce-besafe/11025670_besafe_stretch-b_anthracite-mesh_right-01.png",
    specs: {
      size: "W440 / L600 / H830",
      weight: "12.5",
      height: "40-125",
      age: "신생아 ~ 약 7세 (최대 25kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "신생아~7세 통합 (올인원), 후방 장착 전용(Extended Rear-Facing), 3점식 벨트 고정, 서포팅 레그, 리바운드 스토퍼, SIP+ 측면충돌 보호",
    },
  },
  {
    name: "이지플렉스 픽스 2 i-Size (Flex Fix 2)",
    price: 620000,
    description:
      "100~150cm 주니어 전용 i-Size 하이백 부스터. 모듈러 측면 보호 시스템을 탑재해 업계 최고 수준의 안전성을 제공하며, 뒷좌석 3인 탑승이 가능할 만큼 슬림한 디자인입니다. ISOFIX로 단단히 고정되고 차량 3점식 벨트로 아이를 고정합니다. 2023 'Best Premium Choice'(전 세대 Flex Fix i-Size) 수상 계보의 상위 모델.",
    imageUrl:
      "https://www.besafe.com/4aab2f/globalassets/inriverimages/commerce-besafe/11037469_besafe-flex-fix-2_darksand-softbreeze_right-01.png",
    specs: {
      size: "W450 / L430 / H660-830",
      weight: "6.6",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature:
        "모듈러 측면 보호 시스템, ISOFIX 고정, 슬림 디자인(뒷좌석 3대 탑승), 헤드레스트/시트 폭 확장, 분리형 백레스트",
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
