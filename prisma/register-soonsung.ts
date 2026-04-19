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
const BRAND_ID = "cmo55n5p0000etgtcn3bjzxl8"; // 순성 (Soonsung)
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

// 순성공식몰(soonsungmall.com) 카시트 카테고리 현행 9종 베이스 모델.
// 이미지는 대부분 쿠팡 벤더 단독 샷(흰 배경). 1+1 번들·악세서리·유모차 세트 제외.
const products: Product[] = [
  {
    name: "캐리 (Carry) 신생아 바구니",
    price: 169000,
    description:
      "순성의 엔트리 바구니형 신생아 카시트. 3.3kg 경량 구조에 3점식 차량 안전벨트로 장착되며, 이너시트와 차양막이 기본 포함되어 있습니다. 유모차(순성 코니·듀클 호환) 도킹으로 트래블 시스템 확장이 가능합니다.",
    imageUrl: "https://img1a.coupangcdn.com/image/vendor_inventory/5251/de6dccde2bb9bd365a69e49c96ad4ba576f2725880497e6b54d925bcdfab.jpg",
    specs: {
      size: "W410 / L630 / H500",
      weight: "3.3",
      height: "45-83",
      age: "신생아 ~ 약 12개월 (최대 13kg)",
      cert: "KC 안전확인",
      feature: "3점식 벨트 고정, 이너시트, 차양막(캐노피), 트래블 시스템 호환, 경량 3.3kg",
    },
  },
  {
    name: "우노 (Uno) 올인원 i-Size",
    price: 439000,
    description:
      "신생아부터 약 12세까지 한 제품으로 사용하는 360° 회전형 올인원 카시트. ISOFIX + 서포트 레그에 ECE R129/03(i-Size) + KC + 중국 CCC 인증을 갖춰 안전성을 확보했습니다. 헤드레스트 조절과 3 모드(신생아/토들러/주니어) 전환을 지원합니다.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2023/06/27/9/5/05f101b0-b237-45be-8356-837f278bd10f.jpg",
    specs: {
      size: "W460 / L700 / H650",
      weight: "13.5",
      height: "40-150",
      age: "신생아 ~ 약 12세 (최대 36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size), CCC",
      feature: "360° 회전, 3모드(신생아/토들러/주니어) 전환, ISOFIX + 서포트 레그, 헤드레스트 조절, 측면충돌 보호",
    },
  },
  {
    name: "우노 에어 (Uno Air) 올인원 i-Size",
    price: 680000,
    description:
      "우노의 에어메시 상위 버전. 통기성 메시 패브릭과 개선된 쿠션 구조로 여름 주행에 쾌적하며, 360° 회전·3모드 전환·ISOFIX 서포트 레그 구조는 동일합니다. 선쉐이드 기본 포함.",
    imageUrl: "https://pimg.danawa.com/proxy/shop1.phinf.naver.net/20250206_278/1738821414906l2bYL_PNG/14439483416284694_10982615.png",
    specs: {
      size: "W460 / L700 / H650",
      weight: "13.5",
      height: "40-150",
      age: "신생아 ~ 약 12세 (최대 36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size), CCC",
      feature: "에어메시 통풍 패브릭, 360° 회전, 3모드 전환, ISOFIX + 서포트 레그, 선쉐이드 포함",
    },
  },
  {
    name: "아크 (Arc) 올인원 i-Size",
    price: 319000,
    description:
      "2024년 네이버 신상위크 단독 론칭 모델. 하단 ISOFIX 고정 + 상단 탑테더 이중 고정 방식을 갖추고, 메모리폼 충전재의 4단계 충격 흡수 측면 보호 구조를 제공합니다. 신생아부터 12세까지 한 제품으로 사용하는 올인원 회전형 카시트입니다.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2024/09/30/10/7/cdf944c3-18df-4463-b5f4-03a6aec1b9c3.jpg",
    specs: {
      size: "W460 / L700 / H650",
      weight: "13",
      height: "40-150",
      age: "신생아 ~ 약 12세 (최대 36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "360° 회전, ISOFIX + 탑테더 이중 고정, 메모리폼 4단 측면충돌 보호, 올인원(신생아~12세)",
    },
  },
  {
    name: "브릭 프로 (Brick Pro) 토들러 주니어 ISOFIX",
    price: 420000,
    description:
      "12개월부터 12세까지 사용하는 토들러+주니어 겸용 ISOFIX 카시트. 9~18kg 구간은 5점식 하네스로, 15kg 이상은 차량 안전벨트로 전환됩니다. 브릭가드 측면충돌 보호, 레그레스트, 선쉐이드, 컵홀더가 기본 포함된 풀옵션 구성.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2026/03/16/17/6/5f292395-e533-4e65-809e-5dc8509746ce.jpg",
    specs: {
      size: "W470 / L510 / H670-820",
      weight: "9.5",
      height: "76-150",
      age: "약 12개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인",
      feature: "5점식 하네스 → 안전벨트 전환, ISOFIX + 탑테더, 브릭가드 측면보호, 레그레스트, 선쉐이드, 컵홀더",
    },
  },
  {
    name: "노바 (Nova) 주니어 i-Size",
    price: 199000,
    description:
      "4세부터 12세(100-150cm)까지 사용하는 주니어 i-Size 카시트. 고밀도 메모리폼 충전재의 10단 헤드레스트와 조절형 등받이 이너쿠션으로 아이 체형에 맞춰 조절되며, 고강도 일체형 PP 프레임이 충격을 흡수합니다. ECE R129/03 인증.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2023/01/25/17/5/3b770578-cdc5-40b4-a800-024562457474.jpg",
    specs: {
      size: "W430 / L440 / H660-820",
      weight: "5.8",
      height: "100-150",
      age: "약 4~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129/03 (i-Size)",
      feature: "10단 메모리폼 헤드레스트, 고강도 일체형 PP 프레임, 조절형 등받이 이너쿠션, 컵홀더, 킥매트",
    },
  },
  {
    name: "제나 주니어 플러스 (Zena Junior Plus)",
    price: 260000,
    description:
      "100~150cm 주니어 ISOFIX 하이백 부스터. ISOFIX로 차량에 단단히 고정하고 차량 3점식 벨트로 아이를 고정합니다. 헤드레스트 높이 조절과 분리형 백레스트(백리스 부스터 변환)를 제공하며, 컵홀더·킥매트가 기본 포함됩니다.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2023/01/25/17/0/8f84e8f6-3148-4eee-a293-e13579a54977.jpg",
    specs: {
      size: "W430 / L440 / H640-790",
      weight: "5.2",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인",
      feature: "ISOFIX 고정, 헤드레스트 높이 조절, 분리형 백레스트(부스터 변환), 컵홀더, 킥매트",
    },
  },
  {
    name: "버디 프로 (Buddy Pro) 부스터",
    price: 59000,
    description:
      "3.5세부터 12세(125-150cm)까지 사용하는 초경량 백리스 부스터. ISOFIX/벨트 겸용 고정 방식으로 본체만으로 간단히 설치 가능하며, 예비 차량·할부모 차량용 서브 카시트로 적합합니다. 컵홀더 포함.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2025/12/02/17/8/50656ae6-5543-4661-a1f2-c20b118af0fa.jpg",
    specs: {
      size: "W380 / L340 / H200",
      weight: "1.8",
      height: "125-150",
      age: "약 6~12세 (22~36kg)",
      cert: "KC 안전확인",
      feature: "백리스 부스터(하이백 없음), 경량 1.8kg, ISOFIX/벨트 겸용, 컵홀더, 휴대 편의 설계",
    },
  },
  {
    name: "빌리 프로 (Billy Pro) 휴대용",
    price: 254000,
    description:
      "전용 백에 넣어 들고 다니는 휴대용 카시트. 차량 3점식 벨트 구조에 별도 하네스를 통합해 택시·공유차량에서도 빠르게 장착할 수 있습니다. 전용 백·킥매트·쿨시트 기본 포함.",
    imageUrl: "https://img1a.coupangcdn.com/image/retail/images/2026/03/19/10/3/c04dfdc0-ffdf-4864-8e54-101a5cfe6366.jpg",
    specs: {
      size: "W380 / L420 / H580",
      weight: "2.8",
      height: "76-125",
      age: "약 15개월 ~ 6세 (9~22kg)",
      cert: "KC 안전확인",
      feature: "휴대용(전용 백 포함), 경량 2.8kg, 차량 벨트 통합 하네스, 킥매트·쿨시트 포함",
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
    const ext = p.imageUrl.toLowerCase().split("?")[0].endsWith(".png") ? "png" : "jpg";
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
