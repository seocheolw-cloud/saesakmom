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
 * 제품 이미지에서 밝은 배경 그라데이션과 코너 뱃지(i-Size, NEW 등)를 제거해
 * 순백 배경으로 가공한다.
 *
 * 접근:
 *  1) 배경 화이트닝 — RGB 전 채널 200 이상이면 255 pure white.
 *  2) 제거 박스(픽셀 좌표 기반) — 뱃지가 차지하는 직사각형을 지정해
 *     해당 영역 픽셀을 조건 없이 순백으로 덮는다. 제품 본체가 해당 박스
 *     밖에 위치하므로 안전.
 *
 * 원본 상품 사진은 모두 400x400 → 400 기준으로 박스 좌표를 맞춤.
 */
type Job = {
  productName: string;
  src: string;
  bgThreshold?: number; // 기본 200
  whiteBoxes?: [number, number, number, number][]; // [x1, y1, x2, y2]
  // productRect 내부만 유지, 외부는 pure white로 덮음. 그림자 같은
  // 제품 바깥 어두운 그라데이션을 깔끔히 지울 때 사용.
  productRect?: [number, number, number, number]; // [x1, y1, x2, y2]
};

const jobs: Job[] = [
  {
    productName: "니스툴그로우 빌트인 아이소픽스 주니어 카시트",
    // 원본 1250x1250 스튜디오 렌더. 제품 주변 그림자 풀을 지우려면
    // productRect 외부를 전부 순백으로 덮는 방식이 깔끔하다.
    src: "1776588987337-v8vtpi.jpg",
    bgThreshold: 220,
    productRect: [120, 0, 1100, 1080],
  },
  {
    productName: "원픽스 360 시즌3 에어 i-Size",
    src: "1776590120616-31h5x9.jpg",
    bgThreshold: 205,
    whiteBoxes: [[0, 0, 155, 220]], // NEW + AIR MESH + EXTRA LEGROOM 스택
  },
  {
    productName: "원픽스 360 리우 i-Size",
    src: "1776590121045-hpcmsr.jpg",
    bgThreshold: 205,
    whiteBoxes: [[0, 0, 95, 95]], // 노란 i-Size 뱃지
  },
  {
    productName: "블리바 360 시즌2 i-Size",
    src: "1776590121452-5z2t4h.jpg",
    bgThreshold: 205,
    whiteBoxes: [[0, 0, 95, 95]], // 노란 i-Size 뱃지
  },
  {
    productName: "이노픽스 프라임 주니어 ISOFIX",
    src: "1776590122719-svy9x4.jpg",
    bgThreshold: 205,
    whiteBoxes: [[300, 0, 400, 100]], // 우상단 노란 i-Size 뱃지
  },
];

function processImage(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
  bgThreshold: number,
  whiteBoxes: [number, number, number, number][],
  productRect?: [number, number, number, number],
) {
  // 1. 배경 화이트닝
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r >= bgThreshold && g >= bgThreshold && b >= bgThreshold) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  // 2. productRect 외부는 조건 없이 pure white
  if (productRect) {
    const [px1, py1, px2, py2] = productRect;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x >= px1 && x < px2 && y >= py1 && y < py2) continue;
        const i = (y * width + x) * channels;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }
  }

  // 3. 제거 박스
  for (const [x1, y1, x2, y2] of whiteBoxes) {
    for (let y = Math.max(0, y1); y < Math.min(height, y2); y++) {
      for (let x = Math.max(0, x1); x < Math.min(width, x2); x++) {
        const i = (y * width + x) * channels;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }
  }
}

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "products");

  for (const j of jobs) {
    const srcPath = path.join(dir, j.src);
    const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
    const out = Buffer.from(data);
    processImage(out, info.width, info.height, info.channels, j.bgThreshold ?? 200, j.whiteBoxes ?? [], j.productRect);

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const destPath = path.join(dir, fileName);
    await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .jpeg({ quality: 92 })
      .toFile(destPath);

    const publicUrl = `/uploads/products/${fileName}`;
    const updated = await prisma.product.updateMany({
      where: { name: j.productName },
      data: { imageUrl: publicUrl },
    });
    const size = (await fs.stat(destPath)).size;
    console.log(`OK: ${j.productName} → ${publicUrl} (${Math.round(size / 1024)}KB, updated ${updated.count})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
