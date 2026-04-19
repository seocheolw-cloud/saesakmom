import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const MODEL = "claude-sonnet-4-6";

type ComparisonProductSpec = {
  field: { id: string; name: string; unit: string | null; sortOrder: number };
  value: string;
};

type ComparisonProduct = {
  name: string;
  price: number | null;
  description: string | null;
  type: { name: string };
  brand: { name: string };
  specValues: ComparisonProductSpec[];
};

function formatSpecs(p: ComparisonProduct): string {
  const sorted = [...p.specValues].sort((a, b) => a.field.sortOrder - b.field.sortOrder);
  const lines = sorted.map(
    (sv) => `- ${sv.field.name}: ${sv.value}${sv.field.unit ? ` ${sv.field.unit}` : ""}`,
  );
  return lines.join("\n");
}

function buildPrompt(a: ComparisonProduct, b: ComparisonProduct): string {
  return `당신은 육아용품(${a.type.name}) 전문 리뷰어입니다. 아래 두 제품을 비교해 구매 결정에 필요한 핵심만 간결하게 한국어로 작성해주세요.

## A: ${a.brand.name} — ${a.name}
${a.price ? `가격: ${a.price.toLocaleString()}원\n` : ""}설명: ${a.description ?? "(없음)"}
스펙:
${formatSpecs(a)}

## B: ${b.brand.name} — ${b.name}
${b.price ? `가격: ${b.price.toLocaleString()}원\n` : ""}설명: ${b.description ?? "(없음)"}
스펙:
${formatSpecs(b)}

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
- "제로나 Gi가 제로나 Gi보다" 같은 중복 표기 금지. 제품명은 스펙에 있는 그대로 사용.`;
}

/**
 * AI 비교 리뷰를 생성해 DB에 저장한다.
 * 이미 리뷰가 있으면 force=true일 때만 재생성.
 */
export async function generateComparisonReview(
  comparisonId: string,
  opts: { force?: boolean } = {},
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY 환경변수가 설정되어 있지 않습니다." };

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
          type: { select: { name: true } },
          brand: { select: { name: true } },
          specValues: { include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } } },
        },
      },
    },
  });
  if (!comparison) return { ok: false, error: "comparison not found" };
  if (comparison.aiReview && !opts.force) return { ok: true };

  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(comparison.productA, comparison.productB);

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.3,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        } as never,
      ],
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Anthropic API 오류: ${msg}` };
  }

  const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  const markdown = textBlocks.map((b) => b.text).join("\n\n").trim();
  if (!markdown) return { ok: false, error: "빈 응답" };

  await prisma.productComparison.update({
    where: { id: comparisonId },
    data: { aiReview: markdown, aiReviewAt: new Date() },
  });
  return { ok: true };
}
