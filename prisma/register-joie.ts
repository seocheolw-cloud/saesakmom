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
const BRAND_ID = "cmo55mqr9000atgtc5pz5qz4n"; // 조이 (Joie)
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
  price: number | null;
  description: string;
  imageUrl: string | null;
  specs: {
    size: string;
    weight: string;
    height: string;
    age: string;
    cert: string;
    feature: string;
  };
};

// 조이(Joie) 카시트 11종. 공식 한국 사이트 joiebaby.co.kr의 카시트 카테고리 목록 파싱.
// [1+1] 번들 상품은 단품과 동일 모델이므로 제외. 사이즈/중량은 상세 페이지에 이미지로만 제공되어 공란.
// i-Size(UN R129) 인증은 제품명에 "아이사이즈" 또는 "R129" 표기 기준으로 판단.
const products: Product[] = [
  {
    name: "조이 아이스핀360 메쉬 아이사이즈 회전형 신생아 카시트",
    price: 698000,
    description:
      "신생아부터 약 4세까지 사용하는 360° 회전형 i-Size 카시트. ISOFIX + 지지대 설치 방식이며, 통기성을 높인 메쉬 원단을 적용했습니다. 아이 태우고 내리기 편한 360° 회전 시트와 R129(i-Size) 인증을 갖춘 조이 대표 회전형 모델.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202502/f551fdacebd11223c34891f25fe07c03.jpg",
    specs: {
      size: "",
      weight: "",
      height: "40-105",
      age: "신생아 ~ 약 4세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, 메쉬 원단, ISOFIX + 지지대, 후방/전방 장착 전환, 리클라인 조절",
    },
  },
  {
    name: "조이 아이스핀360 메쉬 시그니처 아이사이즈 회전형 신생아 카시트",
    price: 798000,
    description:
      "아이스핀360 메쉬의 시그니처 라인. 프리미엄 패브릭과 마감을 적용한 업그레이드 모델로 360° 회전과 메쉬 통기성은 그대로, 외관과 디테일을 강화했습니다. R129(i-Size) 인증.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202511/4490575fd28b85d62bb57f1976a232d9.jpg",
    specs: {
      size: "",
      weight: "",
      height: "40-105",
      age: "신생아 ~ 약 4세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "시그니처 패브릭, 360° 회전, 메쉬 원단, ISOFIX + 지지대, 후방/전방 장착 전환",
    },
  },
  {
    name: "조이 아이스핀360 아이사이즈 회전형 신생아 카시트",
    price: 628000,
    description:
      "아이스핀360 메쉬의 기본형. 신생아부터 약 4세까지 i-Size 인증으로 사용 가능한 360° 회전형 카시트로 ISOFIX + 지지대 설치를 지원합니다. 메쉬 원단이 아닌 기본 패브릭 모델.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202502/29d0f4f266ddd9151ec1bf49ea2146fd.jpg",
    specs: {
      size: "",
      weight: "",
      height: "40-105",
      age: "신생아 ~ 약 4세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, ISOFIX + 지지대, 후방/전방 장착 전환, 리클라인 조절",
    },
  },
  {
    name: "조이 아이피벗360 아이사이즈 회전형 ISOFIX 카시트",
    price: 448000,
    description:
      "아이스핀의 보급형인 360° 회전형 i-Size ISOFIX 카시트. 후방/전방 전환과 360° 회전을 지원해 일상 사용 편의를 높였으며 R129(i-Size) 인증 기준을 충족합니다.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202506/4cad1ab133e955afe14d965fc5fa2f4a.jpg",
    specs: {
      size: "",
      weight: "",
      height: "40-105",
      age: "신생아 ~ 약 4세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "360° 회전, ISOFIX + 지지대, 후방/전방 장착 전환, 리클라인 조절",
    },
  },
  {
    name: "조이 아이피벗 그로우 회전형 올인원 카시트 (0~10세)",
    price: 698000,
    description:
      "신생아부터 약 10세까지 한 대로 사용하는 회전형 올인원(Infant → Toddler → Junior) 카시트. 5점식 하네스, 헤드레스트 다단 조절, 360° 회전 기능을 갖춰 성장에 따라 오래 쓸 수 있는 롱유즈 모델.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202508/b38ac7edfe2c963981fb06dbebb309dd.jpg",
    specs: {
      size: "",
      weight: "",
      height: "",
      age: "신생아 ~ 약 10세",
      cert: "KC 안전확인",
      feature: "올인원(0-10세), 360° 회전, 5점식 하네스, 헤드레스트 조절, ISOFIX + 지지대",
    },
  },
  {
    name: "조이 아이주바 아이사이즈 인펀트 카시트",
    price: 128000,
    description:
      "신생아 전용 i-Size 인펀트(바구니형) 카시트. 약 40-85cm(대략 15개월까지) 구간에서 사용하며, 차량 장착과 분리 후 실내 이동(바구니)을 겸할 수 있습니다. R129(i-Size) 인증.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202505/5964530cf0966fa3ea0caf5ae2a3dba0.jpg",
    specs: {
      size: "",
      weight: "",
      height: "40-85",
      age: "신생아 ~ 약 15개월",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "인펀트(바구니형), 3/5점식 안전벨트, 캐리어 겸용, 차량 벨트 또는 전용 베이스 장착",
    },
  },
  {
    name: "조이 스테디 R129 신생아 컨버터블 카시트",
    price: 198000,
    description:
      "신생아부터 약 4세까지 사용하는 컨버터블 R129(i-Size) 카시트. 후방/전방 전환을 지원하며 헤드레스트 다단 조절과 5점식 하네스를 갖춘 실용형 모델. 가성비 중심의 컨버터블 라인.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202509/fe73f75e616aff4d1007b385db5ac6f8.jpg",
    specs: {
      size: "",
      weight: "",
      height: "40-105",
      age: "신생아 ~ 약 4세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "컨버터블, 후방/전방 장착 전환, 5점식 하네스, 헤드레스트 조절",
    },
  },
  {
    name: "조이 아이어바나 아이사이즈 토들러 주니어 카시트",
    price: 368000,
    description:
      "약 15개월부터 12세까지 길게 쓰는 토들러/주니어 i-Size 카시트. 5점식 하네스(초기 구간) → 차량 안전벨트(부스터 구간)로 전환해 사용하며, 측면 충돌 보호(Guard Surround Safety)와 헤드레스트 조절을 갖췄습니다.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202502/b50a67d9c40f7df7bfc9ef802b589c23.jpg",
    specs: {
      size: "",
      weight: "",
      height: "76-150",
      age: "약 15개월 ~ 12세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "토들러/주니어 겸용, 5점식 → 차량벨트 전환, 측면충돌 보호, 헤드레스트 조절, ISOFIX",
    },
  },
  {
    name: "조이 아이트래버 시그니처 아이사이즈 주니어 카시트",
    price: 298000,
    description:
      "100-150cm 구간 주니어 i-Size 카시트. 차량 안전벨트로 고정하는 하이백 부스터 방식이며, 머리·어깨·엉덩이까지 감싸는 측면 충돌 보호와 헤드레스트 다단 조절을 적용했습니다. R129(i-Size) 인증.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202502/4b2f93794861831db9521893fc27272a.jpg",
    specs: {
      size: "",
      weight: "",
      height: "100-150",
      age: "약 3세 ~ 12세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "하이백 부스터, 차량 안전벨트 고정, 측면충돌 보호, 헤드레스트 조절, ISOFIX 연결",
    },
  },
  {
    name: "조이 엘리베이트 R129 토들러 주니어 카시트",
    price: 188000,
    description:
      "R129(i-Size) 인증 토들러/주니어 카시트. 5점식 하네스로 시작해 성장하면 차량 안전벨트로 전환해 부스터로 사용할 수 있는 실용형 모델. 가성비 중심의 토들러/주니어 라인.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202509/f7ae3f8c745a00a2fec535d2b3ca8017.jpg",
    specs: {
      size: "",
      weight: "",
      height: "76-150",
      age: "약 15개월 ~ 12세",
      cert: "KC 안전확인, UN R129 (i-Size)",
      feature: "토들러/주니어 겸용, 5점식 → 차량벨트 전환, 헤드레스트 조절",
    },
  },
  {
    name: "조이 듀알로 주니어 카시트",
    price: 218000,
    description:
      "15-36kg(약 3-12세) 구간 주니어 부스터 카시트. ISOFIX 커넥터로 차량에 고정하고 차량 안전벨트로 아이를 보호하는 하이백 부스터 방식. 측면 충돌 보호와 헤드레스트 조절을 갖춘 롱셀러 모델.",
    imageUrl: "https://joiebaby.co.kr/web/product/big/202502/e64e24be51f600713cdce077198a5858.jpg",
    specs: {
      size: "",
      weight: "",
      height: "",
      age: "약 3세 ~ 12세 (15-36kg)",
      cert: "KC 안전확인",
      feature: "하이백 부스터, ISOFIX 고정 + 차량 안전벨트, 측면충돌 보호, 헤드레스트 조절",
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

    let publicUrl: string | null = null;
    if (p.imageUrl) {
      try {
        const imgRes = await fetch(p.imageUrl, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://joiebaby.co.kr/" },
          redirect: "follow",
        });
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.length < 1000) throw new Error(`too small (${buf.length}B)`);
        const lower = p.imageUrl.toLowerCase().split("?")[0];
        const ext = lower.endsWith(".png") ? "png" : "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        await fs.writeFile(path.join(dir, fileName), buf);
        publicUrl = `/uploads/products/${fileName}`;
        console.log(`  이미지 OK: ${Math.round(buf.length / 1024)}KB`);
      } catch (e) {
        console.log(`  이미지 실패 (${(e as Error).message}) — 공란 처리: ${p.name}`);
        publicUrl = null;
      }
    }

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
      const specEntries: Array<{ fieldId: string; value: string }> = [];
      if (p.specs.size) specEntries.push({ fieldId: SPEC.size, value: p.specs.size });
      if (p.specs.weight) specEntries.push({ fieldId: SPEC.weight, value: p.specs.weight });
      if (p.specs.height) specEntries.push({ fieldId: SPEC.height, value: p.specs.height });
      if (p.specs.age) specEntries.push({ fieldId: SPEC.age, value: p.specs.age });
      if (p.specs.cert) specEntries.push({ fieldId: SPEC.cert, value: p.specs.cert });
      if (p.specs.feature) specEntries.push({ fieldId: SPEC.feature, value: p.specs.feature });
      if (specEntries.length > 0) {
        await tx.productSpecValue.createMany({
          data: specEntries.map((s) => ({ productId: product.id, ...s })),
        });
      }
    });
    console.log(
      `ADD: ${p.name} — ${p.price ? p.price.toLocaleString() + "원" : "가격미표기"} — ${publicUrl ?? "이미지공란"}`,
    );
    created++;
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n완료 — 생성: ${created}, 스킵: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
