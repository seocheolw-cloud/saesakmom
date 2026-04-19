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

/**
 * 브이가드 시즌3 토들러/주니어 단독 제품샷으로 교체.
 * 원본(coupang 벤더 단독 샷, 1225x1225 / 1238x1238)에서 컵홀더가 차지한
 * 우측 약 33% 영역을 잘라내고 제품 중앙 정렬로 정사각 캔버스에 배치.
 */
type Job = {
  productName: string;
  src: string; // 레포 루트 기준 파일명
  crop: { left: number; top: number; width: number; height: number };
};

const jobs: Job[] = [
  {
    productName: "브이가드 토들러 시즌3 에어 ISOFIX",
    src: "vg-cand-3340c132-bf71-4b53-abe2-67b1c7b2eccd.jpg",
    crop: { left: 40, top: 60, width: 740, height: 1120 },
  },
  {
    productName: "브이가드 주니어 시즌3 에어 ISOFIX",
    src: "vg-cand-dd15ef8c-af0e-442d-b0bc-063e7c3df6ba.jpg",
    crop: { left: 40, top: 20, width: 740, height: 1160 },
  },
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "uploads", "products");

  for (const j of jobs) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const destPath = path.join(outDir, fileName);

    // 정사각 캔버스 (흰 배경) 위에 크롭된 제품을 중앙 배치
    const side = Math.max(j.crop.width, j.crop.height);
    const cropped = await sharp(j.src).extract(j.crop).toBuffer();
    await sharp({
      create: { width: side, height: side, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([
        {
          input: cropped,
          left: Math.floor((side - j.crop.width) / 2),
          top: Math.floor((side - j.crop.height) / 2),
        },
      ])
      .jpeg({ quality: 92 })
      .toFile(destPath);

    const size = (await fs.stat(destPath)).size;
    const publicUrl = `/uploads/products/${fileName}`;
    const updated = await prisma.product.updateMany({
      where: { name: j.productName },
      data: { imageUrl: publicUrl },
    });
    console.log(`OK: ${j.productName} → ${publicUrl} (${Math.round(size / 1024)}KB, updated ${updated.count})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
