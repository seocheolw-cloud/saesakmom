// 레벨 정책
// Lv.1 새싹: 0 exp (가입)
// Lv.2 떡잎: 50 exp
// Lv.3 줄기: 150 exp
// Lv.4 꽃봉오리: 350 exp
// Lv.5 열매: 700 exp
//
// 경험치 획득:
// - 게시글 작성: +10
// - 댓글 작성: +3
// - 좋아요 받기: +2

const LEVEL_THRESHOLDS = [0, 50, 150, 350, 700];

const LEVEL_NAMES = ["새싹", "떡잎", "줄기", "꽃봉오리", "열매"];

const LEVEL_ICONS = ["🌱", "🌿", "🪴", "🌸", "🍎"];

export function getLevelFromExp(exp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level, 5) - 1] || LEVEL_NAMES[0];
}

export function getLevelIcon(level: number): string {
  return LEVEL_ICONS[Math.min(level, 5) - 1] || LEVEL_ICONS[0];
}

// 레벨별 배지 색상 (bg, text)
const LEVEL_COLORS = [
  "bg-green-100 text-green-700",      // Lv.1
  "bg-emerald-100 text-emerald-700",   // Lv.2
  "bg-sky-100 text-sky-700",           // Lv.3
  "bg-purple-100 text-purple-700",     // Lv.4
  "bg-amber-100 text-amber-700",       // Lv.5
];

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[Math.min(level, 5) - 1] || LEVEL_COLORS[0];
}

export function getNextLevelExp(level: number): number | null {
  if (level >= 5) return null;
  return LEVEL_THRESHOLDS[level];
}

export const EXP_REWARDS = {
  POST: 10,
  COMMENT: 3,
  LIKED: 2,
} as const;
