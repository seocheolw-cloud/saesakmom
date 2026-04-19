"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Props = {
  markdown: string | null;
};

export function AIReviewSection({ markdown }: Props) {
  const router = useRouter();

  // 리뷰가 아직 없으면 주기적으로 refresh (백그라운드 생성 기다림)
  useEffect(() => {
    if (markdown) return;
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [markdown, router]);

  return (
    <div className="p-6 border-b border-border">
      <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI 리뷰
      </h2>

      {markdown ? (
        <article className="ai-review text-sm leading-relaxed text-foreground">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2 text-foreground">{children}</h3>,
              h2: ({ children }) => <h3 className="text-[13px] font-bold mt-4 mb-1.5 text-foreground flex items-center gap-1"><span className="w-0.5 h-3.5 bg-primary rounded"/>{children}</h3>,
              h3: ({ children }) => <h4 className="text-[13px] font-semibold mt-3 mb-1 text-foreground">{children}</h4>,
              p: ({ children }) => <p className="text-[13px] leading-[1.7] text-[#3b4048] mb-2">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-5 my-2 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-5 my-2 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="text-[13px] leading-[1.7] text-[#3b4048]">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="text-[#3b4048] italic">{children}</em>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{children}</a>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted italic">{children}</blockquote>,
              hr: () => <hr className="my-3 border-border"/>,
            }}
          >{markdown}</ReactMarkdown>
        </article>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-muted">AI가 두 제품을 분석해 리뷰를 생성하고 있습니다. 보통 15~30초 소요됩니다.</p>
          <p className="text-[10px] text-muted/60">페이지가 자동으로 새로고침됩니다.</p>
        </div>
      )}
    </div>
  );
}
