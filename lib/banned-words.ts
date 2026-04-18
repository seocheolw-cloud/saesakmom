const BANNED_WORDS = [
  // 성적/선정적
  "섹스", "sex", "성관계", "자위", "야동", "포르노", "porn", "노출", "성행위",
  "강간", "성폭행", "성추행", "몰카", "도촬", "불법촬영", "매춘", "성매매",
  "원조교제", "조건만남", "음란", "변태", "페티쉬", "fetish",
  // 자해/자살
  "자살", "자해", "극단적선택", "목매", "투신", "음독", "손목",
  // 욕설/비하
  "씨발", "시발", "ㅅㅂ", "병신", "ㅂㅅ", "지랄", "ㅈㄹ", "개새끼",
  "니미", "느금마", "년", "놈", "새끼", "꺼져", "죽어",
  // 마약/불법
  "대마", "마약", "필로폰", "코카인", "엑스터시", "본드흡입",
  // 도박
  "도박", "카지노", "토토", "슬롯", "바카라",
  // 차별/혐오
  "한남충", "한녀충", "김치녀", "맘충",
];

export function containsBannedWord(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word.toLowerCase()));
}

export function filterBannedKeywords<T extends { keyword: string }>(items: T[]): T[] {
  return items.filter((item) => !containsBannedWord(item.keyword));
}

export { BANNED_WORDS };
