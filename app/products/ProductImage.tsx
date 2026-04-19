const CATEGORY_ICONS: Record<string, { emoji: string; bg: string }> = {
  카시트: { emoji: "🚗", bg: "from-blue-50 to-blue-100" },
  유모차: { emoji: "👶", bg: "from-pink-50 to-pink-100" },
  아기침대: { emoji: "🛏️", bg: "from-purple-50 to-purple-100" },
  젖병: { emoji: "🍼", bg: "from-sky-50 to-sky-100" },
  젖병소독기: { emoji: "✨", bg: "from-green-50 to-green-100" },
  분유쉐이커: { emoji: "🥤", bg: "from-orange-50 to-orange-100" },
  아기비데: { emoji: "🚿", bg: "from-cyan-50 to-cyan-100" },
  "기저귀 갈이대": { emoji: "🧸", bg: "from-amber-50 to-amber-100" },
  기저귀: { emoji: "👶", bg: "from-rose-50 to-rose-100" },
};

export function ProductImage({ imageUrl, typeName, productName, size = "md" }: {
  imageUrl: string | null;
  typeName: string;
  productName: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const heights = { xs: "h-20", sm: "h-28", md: "h-44", lg: "h-64" };
  const emojiSizes = { xs: "text-2xl", sm: "text-3xl", md: "text-5xl", lg: "text-7xl" };
  const icon = CATEGORY_ICONS[typeName] || { emoji: "📦", bg: "from-gray-50 to-gray-100" };

  if (imageUrl) {
    return (
      <div className={`w-full ${heights[size]} bg-white rounded-lg flex items-center justify-center overflow-hidden`}>
        <img src={imageUrl} alt={productName} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  return (
    <div className={`w-full ${heights[size]} bg-gradient-to-br ${icon.bg} rounded-lg flex flex-col items-center justify-center gap-0.5`}>
      <span className={emojiSizes[size]}>{icon.emoji}</span>
      {size !== "xs" && <span className="text-[10px] text-gray-400 font-medium">{typeName}</span>}
    </div>
  );
}
