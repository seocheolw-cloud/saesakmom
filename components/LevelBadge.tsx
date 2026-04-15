import { getLevelIcon, getLevelColor } from "@/lib/level";

export function LevelBadge({ level }: { level: number }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${getLevelColor(level)}`}
    >
      {getLevelIcon(level)}{level}
    </span>
  );
}
