import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const url =
  "https://godomall.speedycdn.net/6d22881a620d8e2a870441b726532b6e/goods/1000000080/image/detail/1000000080_detail_016.jpg";
const productName = "제로나 T";

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(dir, { recursive: true });

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, buf);
  const publicUrl = `/uploads/products/${fileName}`;

  const updated = await prisma.product.updateMany({
    where: { name: productName },
    data: { imageUrl: publicUrl },
  });
  console.log(`OK: ${productName} → ${publicUrl} (updated ${updated.count})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
