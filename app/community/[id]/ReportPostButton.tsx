"use client";

import { reportPost } from "@/lib/actions/report";

export function ReportPostButton({ postId }: { postId: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const reason = prompt("신고 사유를 입력해주세요");
        if (!reason) return;
        const res = await reportPost(postId, reason);
        if (res.success) alert("신고가 접수되었습니다.");
        else if (res.message) alert(res.message);
      }}
      className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
    >
      신고
    </button>
  );
}
