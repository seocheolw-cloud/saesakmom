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
const BRAND_ID = "cmo55r26i000utgtcnjybtnhk"; // 시크 (SEEC)
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

// 시크(SEEC) 공식 사이트 GNB 기준 현행 카시트 7종.
// 이미지는 SEEC 공식 제품 페이지의 대표 컬러 샷(흰 배경).
// 유모차(플립·미뇽·미뇽 샴페인·롤리팝2·클라씨) 제외.
const products: Product[] = [
  {
    name: "아이 폴드 (iFold)",
    price: 224000,
    description:
      "100~150cm 주니어 대상 경량 휴대용 부스터. 6kg의 접이식 구조로 백팩 스타일 이동 가방이 포함돼 기내 반입·공유차량 탑승에 유리합니다. ISO-FIX 설치 시스템과 SIP 측면 범퍼, EPP 충격 흡수제, 안전벨트 그린가이드를 갖춘 i-Size 인증 카시트입니다.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/13.ifold/product_ifold_color_01.png",
    specs: {
      size: "W450 / L430 / H660 (펼침) / L200 (접음)",
      weight: "6",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature: "접이식 휴대용(기내반입 가능), ISO-FIX 고정, SIP 측면 범퍼, EPP 충격 흡수제, 백팩 이동 가방",
    },
  },
  {
    name: "아이 폴드 T (iFold T)",
    price: 279000,
    description:
      "아이폴드의 업그레이드 버전. 분리형 백레스트와 개선된 측면 보호 구조를 적용했으며, 접이식 휴대성과 ISOFIX 고정 구조는 동일하게 유지됩니다.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/21.iFOLDT/product_ifoldT_color_01.png",
    specs: {
      size: "W460 / L440 / H680 (펼침)",
      weight: "6.2",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature: "접이식 휴대용(기내반입 가능), 분리형 백레스트, ISO-FIX 고정, 측면충돌 보호 강화",
    },
  },
  {
    name: "맥스 아이진 2 (Max iZin 2)",
    price: 398000,
    description:
      "3세부터 12세까지 사용하는 i-Size 주니어 카시트. 9단 헤드레스트와 4단 SIP 측면 범퍼(어깨 폭) 조절, 4단 등받이 각도 조절로 아이 체형에 정밀하게 맞춥니다. UPF 50+ 선쉐이드와 통기 메시 원단, 컵홀더가 기본 포함됩니다.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/15.maxizin2/product_maxizin2_color_01.png",
    specs: {
      size: "W470 / L440 / H660-850",
      weight: "6.8",
      height: "100-150",
      age: "약 3~12세 (15~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature: "9단 헤드레스트, 4단 SIP 측면 범퍼 폭 조절, 4단 등받이 각도, UPF50+ 선쉐이드, 메시 통기 원단, 컵홀더",
    },
  },
  {
    name: "맥스 아이보스 2 (Max iBoss 2)",
    price: 476000,
    description:
      "9개월부터 12세까지 사용하는 토들러+주니어 i-Size 카시트. 9~18kg 구간은 5점식 하네스, 이후는 차량 안전벨트로 전환되는 All-in-two 구조입니다. 13단 헤드레스트와 5단 등받이 각도, 벌집 구조 EPP 충격 흡수제 + ABS SIP 측면 보호 시스템을 탑재했습니다.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/20.maxiboss2/product_maxiboss2_color_01.png",
    specs: {
      size: "W470 / L520 / H670-850",
      weight: "9.5",
      height: "76-150",
      age: "약 9개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature:
        "5점식 하네스 → 안전벨트 전환, 13단 헤드레스트, 5단 등받이, 벌집형 EPP + ABS SIP 측면 보호, ISOFIX 고정",
    },
  },
  {
    name: "맥스 아이리스 (Max iRis)",
    price: 520000,
    description:
      "SEEC 주니어 라인의 상위 모델. 아이보스 2 기반에 프리미엄 패브릭과 추가 쿠션, 고급 마감을 적용했습니다. 9개월~12세 전구간 사용 가능하며 토들러 모드에서는 5점식 하네스, 주니어 모드에서는 차량 안전벨트로 전환됩니다.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/19.maxiRis/product_maxiris_color_01.png",
    specs: {
      size: "W470 / L520 / H670-850",
      weight: "9.7",
      height: "76-150",
      age: "약 9개월 ~ 12세 (9~36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature: "프리미엄 패브릭, 5점식 하네스 → 안전벨트 전환, 13단 헤드레스트, 벌집형 EPP + SIP 측면 보호, ISOFIX 고정",
    },
  },
  {
    name: "아이 플랜 360 (iPlan 360)",
    price: 580000,
    description:
      "신생아부터 12세까지 한 제품으로 사용하는 360° 전연령 회전 카시트. 포지션과 등받이 각도와 무관하게 회전이 가능하며, 5점식 하네스와 서포트 레그, 리바운드 스토퍼, 사이드 헤드 프로텍션을 갖추고 있습니다. 4색 컬러(모카 브라운 / 포그 베이지 / 문빔 그레이 / 시크 블랙) 전개.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/18.iPlan360/product_iPlan360_color_01.png",
    specs: {
      size: "W470 / L710 / H670-820",
      weight: "15",
      height: "40-150",
      age: "신생아 ~ 약 12세 (최대 36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature:
        "360° 전연령 회전(포지션 무관), 신생아~12세 올에이지, 5점식 하네스, 서포트 레그, 리바운드 스토퍼, 사이드 헤드 프로텍션, ISO-FIX",
    },
  },
  {
    name: "NEW 제로맥스 360E",
    price: 623100,
    description:
      "SEEC의 베스트셀러 전연령 회전형 카시트 최신 버전. 신생아부터 12세까지 한 제품으로 사용하며, 세이프 인디케이터로 ISOFIX·서포팅 레그·5점식 안전벨트·회전 시트 고정 여부를 시각적으로 확인합니다. 업그레이드된 측면 충돌 보호와 통풍 패브릭이 특징입니다.",
    imageUrl: "https://www.seecbaby.co.kr/ko/img/17.NEWZeromax360E/product_NEWZeroMax360E_color_01.png",
    specs: {
      size: "W470 / L710 / H670-820",
      weight: "15",
      height: "40-150",
      age: "신생아 ~ 약 12세 (최대 36kg)",
      cert: "KC 안전확인, UN R129 (i-Size), ECE, CCC",
      feature:
        "360° 전연령 회전, 세이프 인디케이터(시각 확인), 5점식 안전벨트, 서포팅 레그, 측면충돌 보호 업그레이드, 통풍 패브릭",
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

    const imgRes = await fetch(p.imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.seecbaby.co.kr/ko/" },
      redirect: "follow",
    });
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
