export function ContentRenderer({ content }: { content: string }) {
  const parts = content.split(/(\[image:[^\]]+\]|\[video:[^\]]+\])/g);

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        const imgMatch = part.match(/^\[image:([^\]]+)\]$/);
        const vidMatch = part.match(/^\[video:([^\]]+)\]$/);

        if (imgMatch) {
          return (
            <div key={i} className="flex justify-center">
              <img src={imgMatch[1]} alt="" className="max-w-full rounded-lg" />
            </div>
          );
        }

        if (vidMatch) {
          return (
            <div key={i} className="rounded-lg overflow-hidden bg-black">
              <video src={vidMatch[1]} className="w-full max-h-[400px] object-contain" controls />
            </div>
          );
        }

        if (part.trim()) {
          return <p key={i} className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{part}</p>;
        }

        return null;
      })}
    </div>
  );
}
