"use client";

import { changeUserStatus } from "@/lib/actions/admin-user";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성", color: "text-green-700 bg-green-50" },
  { value: "SUSPENDED", label: "정지", color: "text-orange-700 bg-orange-50" },
  { value: "BANNED", label: "차단", color: "text-red-700 bg-red-50" },
] as const;

export function UserStatusSelect({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const current = STATUS_OPTIONS.find((o) => o.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <select
      defaultValue={currentStatus}
      onChange={async (e) => {
        const val = e.target.value;
        const label = val === "SUSPENDED" ? "7일 댓글 정지" : val === "BANNED" ? "차단 (로그인 불가)" : "활성으로 복구";
        if (confirm(`이 회원을 "${label}" 하시겠습니까?`)) {
          await changeUserStatus(userId, val as "ACTIVE" | "SUSPENDED" | "BANNED");
        } else {
          e.target.value = currentStatus;
        }
      }}
      className={`text-[11px] font-medium px-1.5 py-0.5 rounded border-0 cursor-pointer focus:outline-none ${current.color}`}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
