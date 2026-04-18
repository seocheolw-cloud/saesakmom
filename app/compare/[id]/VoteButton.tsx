"use client";

import { useTransition } from "react";
import { castVote } from "@/lib/actions/comparison";

export function VoteButton({ comparisonId, userChoice, productAName, productBName, isLoggedIn }: { comparisonId: string; userChoice: "A" | "B" | null; productAName: string; productBName: string; isLoggedIn: boolean }) {
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-muted">투표하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => startTransition(() => castVote(comparisonId, "A"))}
        disabled={pending}
        className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer ${
          userChoice === "A"
            ? "bg-blue-500 text-white shadow-md shadow-blue-200"
            : "border-2 border-blue-200 text-blue-500 hover:bg-blue-50 hover:border-blue-400"
        }`}
      >
        {userChoice === "A" && <span className="mr-1">&#10003;</span>}
        <span className="truncate">{productAName}</span>
      </button>
      <button
        type="button"
        onClick={() => startTransition(() => castVote(comparisonId, "B"))}
        disabled={pending}
        className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer ${
          userChoice === "B"
            ? "bg-red-500 text-white shadow-md shadow-red-200"
            : "border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400"
        }`}
      >
        {userChoice === "B" && <span className="mr-1">&#10003;</span>}
        <span className="truncate">{productBName}</span>
      </button>
    </div>
  );
}
