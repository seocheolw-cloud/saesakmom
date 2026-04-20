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
const BRAND_ID = "cmo55nrpp000ktgtco5gvukuf"; // 에어보스 (Airboss)
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

// 에어보스(Airboss) 카시트 7종. 네이버 브랜드 스토어 자동 접근 불가로 공개 가격비교(다나와/nosearch/SSG) 기반 수집.
// 공식 브랜드 사이트(airboss.modoo.at)는 2025-06-26 서비스 종료. 일부 스펙은 원본에 미표기되어 공란 처리.
const products: Product[] = [
  {
    name: "에어보스 신생아 다기능 인펜트 바구니 카시트 (민트그레이)",
    price: 79800,
    description:
      "신생아부터 약 3세(13kg)까지 사용하는 바구니형 인펜트 카시트. 3점식 안전벨트와 측면 보호 패드를 적용했으며, 캐리어/바구니/카시트 다기능 일체형 구조로 차량 이동과 실내 휴대를 동시에 지원합니다. 2024년 출시.",
    imageUrl: "https://img.danuri.io/catalog-image/772/484/048/58a20a831e59428483756a9568666eb3.jpg",
    specs: {
      size: "",
      weight: "",
      height: "",
      age: "신생아 ~ 약 3세 (0-13kg)",
      cert: "",
      feature: "바구니형 인펜트, 3점식 안전벨트, 측면 보호 패드, 캐리어 겸용 다기능 일체형",
    },
  },
  {
    name: "에어보스 클레버 ISOFIX 접이식 휴대용 카시트 (윈드그레이)",
    price: 149000,
    description:
      "2~10세(9-25kg) 아이를 위한 접이식 휴대용 ISOFIX 카시트. 보관가방이 기본 포함되며, 5점식 안전벨트와 높이 조절 헤드레스트를 갖추어 여행·외출 시 접어 휴대할 수 있습니다. 중량 5.5kg의 경량 설계.",
    imageUrl: "https://img.danuri.io/catalog-image/727/788/020/47f235e1d96c4c4cb32c8d6e5a3ae815.jpg",
    specs: {
      size: "W430 / L420 / H560-730",
      weight: "5.5",
      height: "",
      age: "2 ~ 10세 (9-25kg)",
      cert: "",
      feature: "접이식 휴대용, ISOFIX 고정형, 5점식 안전벨트, 헤드레스트 조절, 보관가방 포함",
    },
  },
  {
    name: "에어보스 스위벨 회전형 카시트 ISOFIX (다크그레이)",
    price: 220000,
    description:
      "9~25kg(약 9개월~7세) 구간 컨버터블 회전형 카시트. ISOFIX + 탑테더 설치 방식으로 장착하며, 시트가 좌우로 회전해 아이 태우고 내리기가 수월합니다. 리클라인·헤드레스트 조절과 측면 보호 패드를 갖추고, 커버는 탈착 세탁 가능합니다.",
    imageUrl:
      "https://res.cloudinary.com/dkyyuk5ap/image/fetch/f_auto,c_limit,w_500,q_auto/https://crawl-cdn.nosearch.com/image/withBgRemove/2023/500000_399_840_img_20840399_1_jpg",
    specs: {
      size: "W460 / L430 / H660",
      weight: "9.8",
      height: "",
      age: "9-25kg (약 9개월 ~ 7세)",
      cert: "",
      feature: "컨버터블 회전형, ISOFIX + 탑테더, 측면 보호 패드, 리클라인/헤드레스트 조절, 커버 탈착 세탁, 차양막",
    },
  },
  {
    name: "에어보스 록키 휴대용 부스터 카시트 ISOFIX (블랙)",
    price: 59900,
    description:
      "3~12세(15-36kg) 아이를 위한 ISOFIX 고정형 휴대용 부스터 카시트. 가볍고 간소한 구조로 차량 이동·타 차량 활용이 쉬우며, ISOFIX 커넥터로 좌석에 단단히 고정됩니다. 2019년 출시 롱셀러.",
    imageUrl: "https://img.danuri.io/catalog-image/456/191/021/e359c353a3594bf9992800beb5260d09.jpg",
    specs: {
      size: "",
      weight: "",
      height: "",
      age: "3 ~ 12세 (15-36kg)",
      cert: "",
      feature: "휴대용 부스터, ISOFIX 고정형",
    },
  },
  {
    name: "에어보스 제이원 주니어 카시트 ISOFIX",
    price: 88500,
    description:
      "15~36kg 구간 주니어 ISOFIX 카시트. 8단 높이 조절 헤드레스트와 차량 안전벨트 사용 방식을 적용했으며, 등받이 분리 및 커버 탈착이 가능해 아이 성장에 맞춰 활용할 수 있습니다. KC 안전인증 제품.",
    imageUrl:
      "https://res.cloudinary.com/dkyyuk5ap/image/fetch/f_auto,c_limit,w_500,q_auto/https://crawl-cdn.nosearch.com/image/withBgRemove/2023/500000_222_786_img_20786222_1_jpg",
    specs: {
      size: "W460 / L400 / H700",
      weight: "5",
      height: "",
      age: "15-36kg (주니어)",
      cert: "KC 안전인증",
      feature: "주니어 ISOFIX, 헤드레스트 8단 조절, 등받이 분리, 커버 탈착, 차량 안전벨트 방식, 차양막",
    },
  },
  {
    name: "에어보스 제이세븐 주니어 카시트 ISOFIX (멜란지 그레이)",
    price: 139000,
    description:
      "6개월~8세 미만까지 사용하는 ISOFIX 벨트 포함 주니어 카시트. SSG 한정 500대로 출시된 모델로 아이소픽 벨트가 기본 제공되어 차량에 안전하게 고정할 수 있습니다. 어린이제품 안전인증(CA031R044-8003) 제품.",
    imageUrl: "https://sitem.ssgcdn.com/62/18/07/item/1000278071862_i1_1200.jpg",
    specs: {
      size: "",
      weight: "",
      height: "",
      age: "6개월 ~ 8세 미만",
      cert: "KC 어린이제품 안전인증 (CA031R044-8003)",
      feature: "주니어 카시트, ISOFIX 벨트 포함, 멜란지 그레이",
    },
  },
  {
    name: "에어보스 제이나인 5점식 주니어 카시트 고정형 (그레이)",
    price: 122550,
    description:
      "5점식 안전벨트를 적용한 주니어 고정형 카시트. 헤드레스트와 등받이를 성장에 맞춰 조절할 수 있으며, 차량 벨트로 고정하는 방식을 사용합니다. 2020년 출시 모델.",
    imageUrl: "https://img.danuri.io/catalog-image/707/439/026/c6eb803bb6e94e56b06afd9df79f150b.jpg",
    specs: {
      size: "",
      weight: "",
      height: "",
      age: "",
      cert: "",
      feature: "주니어 고정형, 5점식 안전벨트, 헤드레스트 조절",
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
          headers: { "User-Agent": "Mozilla/5.0" },
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
