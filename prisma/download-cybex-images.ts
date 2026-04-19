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

const images: ImageMap[] = [
  {
    productName: "솔루션 G2",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000098/image/detail/1000000098_detail_076.jpg",
  },
  {
    productName: "아노리스 T2 i-Size",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000095/image/detail/1000000095_detail_01.jpg",
  },
  {
    productName: "솔루션 T Comfort",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000092/image/detail/1000000092_detail_031.jpg",
  },
  {
    productName: "에이톤 S2 i-Size",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000091/image/detail/1000000091_detail_044.jpg",
  },
  {
    productName: "솔루션 T Plus",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000081/image/detail/1000000081_detail_01.jpg",
  },
  {
    productName: "제로나 Zi i-Size",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000012/image/detail/1000000012_detail_031.jpg",
  },
  {
    productName: "솔루션 Z i-Fix Plus",
    url: "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000011/image/detail/1000000011_detail_05.jpg",
  },
];

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(dir, { recursive: true });

  for (const img of images) {
    const res = await fetch(img.url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) {
      console.log(`FAIL (${res.status}): ${img.productName}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buf);
    const publicUrl = `/uploads/products/${fileName}`;

    const updated = await prisma.product.updateMany({
      where: { name: img.productName },
      data: { imageUrl: publicUrl },
    });
    console.log(`OK: ${img.productName} → ${publicUrl} (updated ${updated.count})`);
    await new Promise((r) => setTimeout(r, 200));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
