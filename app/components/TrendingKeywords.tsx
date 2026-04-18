"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getTrendingKeywords } from "@/lib/actions/search";

type TrendingKeyword = {
  rank: number;
  keyword: string;
  trend: "up" | "down" | "stable" | "new";
};

function TrendIcon({ trend }: { trend: TrendingKeyword["trend"] }) {
  switch (trend) {
    case "up":
      return (
        <svg className="w-3 h-3 text-red-500" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 1L11 8H1L6 1Z" />
        </svg>
      );
    case "new":
      return (
        <span className="text-[10px] font-bold text-red-500 leading-none">NEW</span>
      );
    case "down":
      return (
        <svg className="w-3 h-3 text-blue-400" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 11L1 4H11L6 11Z" />
        </svg>
      );
    default:
      return (
        <span className="w-3 h-3 inline-flex items-center justify-center text-[10px] text-gray-400">-</span>
      );
  }
}

export function TrendingKeywords() {
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function fetchKeywords() {
      startTransition(async () => {
        const data = await getTrendingKeywords();
        setKeywords(data);
      });
    }

    fetchKeywords();
    const interval = setInterval(fetchKeywords, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#d4d4d4] p-5 sticky top-[108px] mt-[36px]">
        <h2 className="text-sm font-bold text-foreground mb-4">실시간 인기 검색어</h2>
        <p className="text-xs text-muted text-center py-4">검색 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#d4d4d4] p-5 sticky top-[108px] mt-[36px]">
      <h2 className="text-sm font-bold text-foreground mb-4">실시간 인기 검색어</h2>
      <ol className="space-y-2">
        {keywords.map((item) => (
          <li key={item.rank}>
            <Link
              href={`/search?q=${encodeURIComponent(item.keyword)}`}
              className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors"
            >
              <span
                className={`w-5 text-center text-xs font-bold ${
                  item.rank <= 3 ? "text-primary" : "text-muted"
                }`}
              >
                {item.rank}
              </span>
              <span className="text-foreground flex-1">{item.keyword}</span>
              <TrendIcon trend={item.trend} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
