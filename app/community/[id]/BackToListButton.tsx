"use client";

import { useRouter } from "next/navigation";

export function BackToListButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm text-muted hover:text-primary transition-colors"
    >
      ← 목록으로
    </button>
  );
}
