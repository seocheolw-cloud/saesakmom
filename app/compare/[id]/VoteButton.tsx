"use client";

import { useTransition } from "react";
import { castVote } from "@/lib/actions/comparison";

export function VoteButton({ comparisonId, userChoice, productAName, productBName }: { comparisonId: string; userChoice: "A" | "B" | null; productAName: string; productBName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-3 mt-4">
      <button onClick={() => startTransition(() => castVote(comparisonId, "A"))} disabled={pending} className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${userChoice === "A" ? "bg-blue-500 text-white" : "border border-blue-300 text-blue-500 hover:bg-blue-50"}`}>
        {productAName} 선택
      </button>
      <button onClick={() => startTransition(() => castVote(comparisonId, "B"))} disabled={pending} className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${userChoice === "B" ? "bg-red-500 text-white" : "border border-red-300 text-red-500 hover:bg-red-50"}`}>
        {productBName} 선택
      </button>
    </div>
  );
}
