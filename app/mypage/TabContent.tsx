"use client";

import { useState } from "react";
import Link from "next/link";

type Post = { id: string; title: string; category: string; createdAt: string; viewCount: number; likeCount: number; commentCount: number };
type Comment = { id: string; content: string; createdAt: string; postId: string; postTitle: string };
type Tab = "posts" | "comments";

export function TabContent({ postCount, commentCount, posts, comments }: {
  postCount: number;
  commentCount: number;
  posts: Post[];
  comments: Comment[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "posts", label: "작성글", count: postCount },
    { key: "comments", label: "작성댓글", count: commentCount },
  ];

  return (
    <section className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
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

      <div>
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <div className="text-center text-sm text-muted py-8">아직 작성한 글이 없습니다.</div>
          ) : (
            <div>
              {posts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/community/${p.id}`}
                  className={`block px-5 py-3.5 hover:bg-[#f8faff] transition-colors ${i < posts.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-primary bg-blue-50 px-1.5 py-0.5 rounded">{p.category}</span>
                    <span className="text-[11px] text-muted">{new Date(p.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-1 mb-1">{p.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span>조회 {p.viewCount}</span>
                    <span>추천 {p.likeCount}</span>
                    <span>댓글 {p.commentCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === "comments" && (
          comments.length === 0 ? (
            <div className="text-center text-sm text-muted py-8">아직 작성한 댓글이 없습니다.</div>
          ) : (
            <div>
              {comments.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/community/${c.postId}`}
                  className={`block px-5 py-3.5 hover:bg-[#f8faff] transition-colors ${i < comments.length - 1 ? "border-b border-border" : ""}`}
                >
                  <p className="text-sm text-foreground line-clamp-2 mb-1.5">{c.content.replace(/\[(image|video):[^\]]+\]/g, "").trim()}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="text-primary">{c.postTitle}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
