"use client";

import { useState } from "react";

type DataPoint = { date: string; count: number };

function BarChart({ data, color, label }: { data: DataPoint[]; color: string; label: string }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = Math.max(8, Math.min(40, Math.floor(600 / (data.length || 1)) - 4));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted">데이터가 없습니다</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Y축 라벨 */}
        <div className="flex items-end gap-[2px] h-40 px-2 relative">
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-muted pr-1">
            <span>{maxCount}</span>
            <span>{Math.round(maxCount / 2)}</span>
            <span>0</span>
          </div>
          <div className="ml-8 flex items-end gap-[2px] flex-1">
            {data.map((d) => {
              const height = Math.max((d.count / maxCount) * 140, 2);
              return (
                <div key={d.date} className="flex flex-col items-center flex-1 group relative">
                  <div className="absolute -top-6 bg-foreground text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.date.slice(5)} : {d.count}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all ${color} group-hover:opacity-80`}
                    style={{ height: `${height}px`, maxWidth: `${barWidth}px` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* X축 라벨 */}
        <div className="ml-8 flex gap-[2px] mt-1">
          {data.map((d, i) => (
            <div key={d.date} className="flex-1 text-center">
              {data.length <= 14 || i % Math.ceil(data.length / 10) === 0 ? (
                <span className="text-[8px] text-muted">{d.date.slice(5)}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsCharts({ dailyViews, dailyRegistrations, dailyPosts }: {
  dailyViews: DataPoint[];
  dailyRegistrations: DataPoint[];
  dailyPosts: DataPoint[];
}) {
  const [activeTab, setActiveTab] = useState<"views" | "registrations" | "posts">("views");

  const tabs = [
    { key: "views" as const, label: "방문수", color: "bg-blue-400", data: dailyViews },
    { key: "registrations" as const, label: "가입수", color: "bg-green-400", data: dailyRegistrations },
    { key: "posts" as const, label: "게시글", color: "bg-purple-400", data: dailyPosts },
  ];

  const active = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-[#f8fafc] flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">일별 추이</h3>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition-colors ${
                activeTab === t.key ? "bg-foreground text-white" : "text-muted hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        <BarChart data={active.data} color={active.color} label={active.label} />
        <div className="flex items-center justify-end gap-4 mt-3 text-[10px] text-muted">
          <span>합계: {active.data.reduce((s, d) => s + d.count, 0).toLocaleString()}</span>
          <span>평균: {active.data.length > 0 ? Math.round(active.data.reduce((s, d) => s + d.count, 0) / active.data.length) : 0}/일</span>
          <span>최대: {Math.max(...active.data.map((d) => d.count), 0)}/일</span>
        </div>
      </div>
    </div>
  );
}
