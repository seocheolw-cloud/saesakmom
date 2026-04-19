import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const MODEL = "claude-sonnet-4-6";

function formatSpecs(specValues: { value: string; field: { name: string; unit: string | null; sortOrder: number } }[]): string {
  return [...specValues]
    .sort((a, b) => a.field.sortOrder - b.field.sortOrder)
    .map((sv) => `- ${sv.field.name}: ${sv.value}${sv.field.unit ? ` ${sv.field.unit}` : ""}`)
    .join("\n");
}

async function generateOne(comparisonId: string): Promise<boolean> {
  const comparison = await prisma.productComparison.findUnique({
    where: { id: comparisonId },
    include: {
      productA: {
        include: {
          type: { select: { name: true } },
          brand: { select: { name: true } },
          specValues: { include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } } },
        },
      },
      productB: {
        include: {
          brand: { select: { name: true } },
          specValues: { include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } } },
        },
      },
    },
  });
  if (!comparison) return false;

  const a = comparison.productA;
  const b = comparison.productB;
  const prompt = `당신은 육아용품(${a.type.name}) 전문 리뷰어입니다. 아래 두 제품을 비교해 구매 결정에 필요한 핵심만 간결하게 한국어로 작성해주세요.

## A: ${a.brand.name} — ${a.name}
${a.price ? `가격: ${a.price.toLocaleString()}원\n` : ""}설명: ${a.description ?? "(없음)"}
스펙:
${formatSpecs(a.specValues)}

## B: ${b.brand.name} — ${b.name}
${b.price ? `가격: ${b.price.toLocaleString()}원\n` : ""}설명: ${b.description ?? "(없음)"}
스펙:
${formatSpecs(b.specValues)}

## 출력 형식 (반드시 아래 구조만 사용, Markdown 헤딩은 "선택 기준", "구매 전 확인사항" 두 개만 쓰기)

(여기에 요약 문단 2~3줄. 두 제품의 주요 차이점을 자연스러운 문장으로 서술하고, 가격대 언급 후 "~기준으로 선택하시면 좋습니다"로 마무리.)

## 선택 기준
(불릿 3~4개. 각 불릿은 "~하시면 ~가 유리합니다 / 적합합니다 / 만족도가 높을 수 있습니다" 형태로 상황별 추천. 각 불릿 한 줄.)

## 구매 전 확인사항
(1~2줄 자연 문단. 공식 판매처 정보·실사용 체감 차이·매장 방문 권장 등 구매 전에 챙길 점.)

## 규칙
- 위 세 블록만 출력. 다른 헤딩·섹션·불릿 리스트 추가 금지.
- 전체 350~450자 정도. 장황하지 않게.
- 경어체("~습니다", "~세요"). 한쪽이 일방적으로 낫다고 단정 금지.
- 웹 검색은 필요시만(ADAC·국내 리뷰). 인용·출처 각주 생략, 본문에 자연스럽게 녹여서.
- 제품명은 스펙에 있는 그대로 사용. 중복 표기 금지.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    temperature: 0.3,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 } as never],
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n\n")
    .trim();
  if (!text) return false;

  await prisma.productComparison.update({
    where: { id: comparisonId },
    data: { aiReview: text, aiReviewAt: new Date() },
  });
  return true;
}

async function main() {
  const force = process.argv.includes("--force");
  const missing = await prisma.productComparison.findMany({
    where: force ? {} : { aiReview: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, productA: { select: { name: true } }, productB: { select: { name: true } } },
  });
  console.log(`대상 비교: ${missing.length}개${force ? " (force 모드 — 전부 재생성)" : ""}`);
  for (const c of missing) {
    process.stdout.write(`  [${c.id}] ${c.productA.name} vs ${c.productB.name} ... `);
    try {
      const ok = await generateOne(c.id);
      console.log(ok ? "✓" : "✗ (빈 응답)");
    } catch (e) {
      console.log("✗", e instanceof Error ? e.message : e);
    }
    // rate limit 회피용 대기
    await new Promise((r) => setTimeout(r, 1000));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
