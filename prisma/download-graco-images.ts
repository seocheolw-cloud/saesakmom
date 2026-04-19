import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

type ImageMap = { productName: string; url: string };

// gracobaby.kr 공식 제품 이미지 (원 도메인 DNS 장애로 Wayback Machine의 보관 사본을 사용)
const images: ImageMap[] = [
  {
    productName: "에이픽스",
    url: "https://web.archive.org/web/20231215043710im_/http://www.gracobaby.kr/web/product/medium/201904/0363ecbe7838a72e240241b57ccffbdf.jpg",
  },
  {
    productName: "로지코 LX 컴포트",
    url: "https://web.archive.org/web/20231215043710im_/http://www.gracobaby.kr/web/product/medium/201802/51_shop1_197174.jpg",
  },
  {
    productName: "랠리 스포츠",
    url: "https://web.archive.org/web/20231215043710im_/http://www.gracobaby.kr/web/product/medium/201802/61_shop1_366775.jpg",
  },
  {
    productName: "주니어 맥시",
    url: "https://web.archive.org/web/20231215043710im_/http://www.gracobaby.kr/web/product/medium/201709/55_shop1_103271.jpg",
  },
  {
    productName: "노틸러스",
    url: "https://web.archive.org/web/20231215043710im_/http://www.gracobaby.kr/web/product/medium/201706/36_shop1_785238.jpg",
  },
];

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(dir, { recursive: true });

  for (const img of images) {
    const res = await fetch(img.url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`FAIL (${res.status}): ${img.productName}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) {
      console.log(`FAIL (too small, ${buf.length}B): ${img.productName}`);
      continue;
    }
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buf);
    const publicUrl = `/uploads/products/${fileName}`;

    const updated = await prisma.product.updateMany({
      where: { name: img.productName },
      data: { imageUrl: publicUrl },
    });
    console.log(
      `OK: ${img.productName} → ${publicUrl} (${Math.round(buf.length / 1024)}KB, updated ${updated.count})`,
    );
    await new Promise((r) => setTimeout(r, 300));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
