import fs from "node:fs/promises";

async function main() {
  const html = await fs.readFile("C:/temp/joie.html", "utf-8");

  const itemRe = /<li id="anchorBoxId_(\d+)"[\s\S]*?(?=<li id="anchorBoxId_|<\/ul>)/g;
  const items = html.match(itemRe) ?? [];

  const products: Array<{
    id: string;
    name: string;
    price: number | null;
    imageUrl: string;
    detailUrl: string;
  }> = [];

  for (const item of items) {
    const idMatch = item.match(/anchorBoxId_(\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const nameMatch = item.match(
      /<span class="title displaynone">[\s\S]*?상품명<\/span>[\s\S]*?<span[^>]*>([^<]+)<\/span>/,
    );
    const name = nameMatch?.[1].trim() ?? "";

    const priceMatch = item.match(/ec-data-price="(\d+)"/);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : null;

    const imgMatch = item.match(/<img src="(\/\/joiebaby\.co\.kr\/web\/product\/big\/[^"]+)"/);
    const imgMatchMed = item.match(/<img src="(\/\/joiebaby\.co\.kr\/web\/product\/medium\/[^"]+)"/);
    const imageUrl = imgMatch ? `https:${imgMatch[1]}` : imgMatchMed ? `https:${imgMatchMed[1]}` : "";

    const detailMatch = item.match(/href="(\/product\/[^"]+\/\d+\/category\/\d+\/[^"]*)"/);
    const detailUrl = detailMatch ? `https://joiebaby.co.kr${detailMatch[1]}` : "";

    if (name) products.push({ id, name, price, imageUrl, detailUrl });
  }

  console.log(`총 ${products.length}개\n`);
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error);
