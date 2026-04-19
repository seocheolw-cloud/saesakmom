import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

type ImageMap = { productName: string; url: string; ext: string };

// Nuna 공식 한국 카탈로그(nunababy.com/kr) 제품 이미지 — 흰 배경, 로고 오버레이 없음
const images: ImageMap[] = [
  {
    productName: "피파 넥스트 (PIPA next)",
    url: "https://nunababy.com/media/catalog/product/N/u/Nuna_PIPAnext_Biscotti_GHOST_BASEcurv_Profile_OP_GL_web_c3d6.png",
    ext: "png",
  },
  {
    productName: "토들 넥스트 (TODL next)",
    url: "https://nunababy.com/media/catalog/product/N/u/Nuna_TODLnext_Biscotti_GHOST_BASEcurv_OP_GL_web_162f.png",
    ext: "png",
  },
  {
    productName: "에이스 LX (AACE lx)",
    url: "https://nunababy.com/media/catalog/product/n/u/nuna_aaceix_calla_front_hru_1_sip_gl_web.png",
    ext: "png",
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
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${img.ext}`;
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
