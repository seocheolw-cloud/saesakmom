"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { containsBannedWord, filterBannedKeywords } from "@/lib/banned-words";

export async function logSearch(keyword: string) {
  const trimmed = keyword.trim().slice(0, 100);
  if (!trimmed) return;
  if (containsBannedWord(trimmed)) return;
  const session = await auth();
  if (!session?.user) return;
  await prisma.searchLog.create({ data: { keyword: trimmed } });
}

type TrendingKeyword = {
  rank: number;
  keyword: string;
  trend: "up" | "down" | "stable" | "new";
};

export async function getTrendingKeywords(): Promise<TrendingKeyword[]> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  // 24시간 기준 인기 검색어
  const allCounts = await prisma.$queryRaw<
    { keyword: string; cnt: bigint }[]
  >`
    SELECT keyword, COUNT(*) as cnt
    FROM "search_logs"
    WHERE "createdAt" >= ${oneDayAgo}
    GROUP BY keyword
    ORDER BY cnt DESC
    LIMIT 20
  `;

  const filtered = filterBannedKeywords(allCounts).slice(0, 10);
  if (filtered.length === 0) return [];

  // 최근 6시간 vs 이전 6~12시간 비교로 트렌드 계산
  const recentCounts = await prisma.$queryRaw<
    { keyword: string; cnt: bigint }[]
  >`
    SELECT keyword, COUNT(*) as cnt
    FROM "search_logs"
    WHERE "createdAt" >= ${sixHoursAgo}
    GROUP BY keyword
    ORDER BY cnt DESC
    LIMIT 20
  `;

  const prevCounts = await prisma.$queryRaw<
    { keyword: string; cnt: bigint }[]
  >`
    SELECT keyword, COUNT(*) as cnt
    FROM "search_logs"
    WHERE "createdAt" >= ${twelveHoursAgo} AND "createdAt" < ${sixHoursAgo}
    GROUP BY keyword
    ORDER BY cnt DESC
    LIMIT 20
  `;

  const recentMap = new Map(recentCounts.map((r) => [r.keyword, Number(r.cnt)]));
  const prevMap = new Map(prevCounts.map((r) => [r.keyword, Number(r.cnt)]));

  return filtered.map((row, i) => {
    const recentCount = recentMap.get(row.keyword) ?? 0;
    const prevCount = prevMap.get(row.keyword) ?? 0;

    let trend: TrendingKeyword["trend"];
    if (prevCount === 0 && recentCount > 0) {
      trend = "new";
    } else if (prevCount > 0 && recentCount > prevCount * 1.2) {
      trend = "up";
    } else if (prevCount > 0 && recentCount < prevCount * 0.8) {
      trend = "down";
    } else {
      trend = "stable";
    }

    return { rank: i + 1, keyword: row.keyword, trend };
  });
}
