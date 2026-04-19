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
 * 브라이텍스 전체 카시트 이미지 재처리 —
 * 우상단 britax 로고 swoosh 곡선까지 포함해 넓게 whiten.
 */
async function main() {
  const brand = await prisma.productBrand.findFirst({
    where: { name: { contains: "브라이텍스" }, typeId: "cmo05l6or003f2otcf3pswzwo" },
  });
  if (!brand) throw new Error("브라이텍스 brand not found");

  const products = await prisma.product.findMany({ where: { brandId: brand.id }, select: { id: true, name: true, imageUrl: true } });
  const dir = path.join(process.cwd(), "public", "uploads", "products");

  for (const p of products) {
    if (!p.imageUrl) continue;
    const srcFile = path.join(process.cwd(), "public", p.imageUrl);
    const { data, info } = await sharp(srcFile).raw().toBuffer({ resolveWithObject: true });
    const out = Buffer.from(data);
    const w = info.width, h = info.height, c = info.channels;

    // 1. near-white → pure white (shadow 제거)
    for (let i = 0; i < out.length; i += c) {
      if (out[i] >= 200 && out[i + 1] >= 200 && out[i + 2] >= 200) {
        out[i] = 255;
        out[i + 1] = 255;
        out[i + 2] = 255;
      }
    }
    // 2. 로고 전체 영역 (우상단 ~70% ~ 100% × 0 ~ 17%)
    const x1 = Math.floor(w * 0.70);
    const y2 = Math.floor(h * 0.17);
    for (let y = 0; y < y2; y++) {
      for (let x = x1; x < w; x++) {
        const i = (y * w + x) * c;
        out[i] = 255;
        out[i + 1] = 255;
        out[i + 2] = 255;
      }
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const destPath = path.join(dir, fileName);
    await sharp(out, { raw: { width: w, height: h, channels: c } }).jpeg({ quality: 90 }).toFile(destPath);
    const size = (await fs.stat(destPath)).size;
    const publicUrl = `/uploads/products/${fileName}`;
    await prisma.product.update({ where: { id: p.id }, data: { imageUrl: publicUrl } });
    console.log(`OK: ${p.name} → ${publicUrl} (${Math.round(size / 1024)}KB)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
