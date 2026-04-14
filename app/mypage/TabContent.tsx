"use client";

import { useState } from "react";

type Tab = "posts" | "comments" | "scraps";

export function TabContent({
  postCount,
  commentCount,
}: {
  postCount: number;
  commentCount: number;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "posts", label: "작성글", count: postCount },
    { key: "comments", label: "작성댓글", count: commentCount },
    { key: "scraps", label: "스크랩", count: 0 },
  ];

  return (
    <section className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-[#d4d4d4]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 h-12 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "text-[#18202A] border-b-2 border-[#18202A]"
                : "text-[#5F6B7C] hover:text-[#18202A]"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-6">
        {activeTab === "posts" && (
          <div className="text-center text-sm text-muted py-8">
            {postCount > 0
              ? "작성한 글 목록이 여기에 표시됩니다."
              : "아직 작성한 글이 없습니다."}
          </div>
        )}
        {activeTab === "comments" && (
          <div className="text-center text-sm text-muted py-8">
            {commentCount > 0
              ? "작성한 댓글 목록이 여기에 표시됩니다."
              : "아직 작성한 댓글이 없습니다."}
          </div>
        )}
        {activeTab === "scraps" && (
          <div className="text-center text-sm text-muted py-8">
            아직 스크랩한 글이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
