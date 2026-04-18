"use client";

import { useActionState, useState, useRef } from "react";
import { createPost } from "@/lib/actions/post";

type Category = { id: string; name: string; slug: string };
type Block = { id: string; type: "text"; content: string } | { id: string; type: "image"; url: string } | { id: string; type: "video"; url: string };

let blockIdCounter = 0;
function newId() { return `b-${++blockIdCounter}`; }

export function PostForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createPost, undefined);
  const [uploading, setUploading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([{ id: newId(), type: "text", content: "" }]);
  const [activeBlockId, setActiveBlockId] = useState(blocks[0].id);

  function serialize() {
    return blocks.map((b) => {
      if (b.type === "text") return b.content;
      if (b.type === "image") return `[image:${b.url}]`;
      return `[video:${b.url}]`;
    }).join("\n");
  }

  function getMediaUrls() {
    return blocks.filter((b) => b.type !== "text").map((b) => (b as { url: string }).url);
  }

  function updateText(id: string, content: string) {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, content } : b));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      // 인접한 텍스트 블록 합치기
      const merged: Block[] = [];
      for (const b of filtered) {
        const last = merged[merged.length - 1];
        if (b.type === "text" && last?.type === "text") {
          merged[merged.length - 1] = { ...last, content: last.content + "\n" + b.content };
        } else {
          merged.push(b);
        }
      }
      if (merged.length === 0) merged.push({ id: newId(), type: "text", content: "" });
      return merged;
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) { alert(`${file.name}: ${isVideo ? "50MB" : "5MB"} 이하만 가능합니다.`); continue; }
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "posts");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          const mediaBlock: Block = data.type === "video"
            ? { id: newId(), type: "video", url: data.url }
            : { id: newId(), type: "image", url: data.url };

          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.id === activeBlockId);
            const insertAt = idx >= 0 ? idx + 1 : prev.length;
            const newBlocks = [...prev];
            newBlocks.splice(insertAt, 0, mediaBlock, { id: newId(), type: "text", content: "" });
            return newBlocks;
          });
        } else {
          alert(data.error || "업로드 실패");
        }
      } catch { alert("업로드에 실패했습니다."); }
    }
    setUploading(false);
    e.target.value = "";
  }

  const mediaCount = blocks.filter((b) => b.type !== "text").length;

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <input type="hidden" name="content" value={serialize()} />
      {getMediaUrls().map((url, i) => (
        <input key={i} type="hidden" name="images" value={url} />
      ))}

      <div>
        <label htmlFor="categoryId" className="block text-sm font-semibold mb-1.5 text-foreground">카테고리</label>
        <select id="categoryId" name="categoryId" required className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors">
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
        {state?.errors?.categoryId && <p className="text-xs text-error mt-1">{state.errors.categoryId[0]}</p>}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold mb-1.5 text-foreground">제목</label>
        <input id="title" name="title" type="text" required className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="제목을 입력하세요" />
        {state?.errors?.title && <p className="text-xs text-error mt-1">{state.errors.title[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-foreground">내용</label>
        <div className="rounded-lg border border-border bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors overflow-hidden">
          {/* 블록 에디터 */}
          <div className="min-h-[200px]">
            {blocks.map((block, blockIndex) => {
              if (block.type === "text") {
                const isFirst = blocks.findIndex((b) => b.type === "text") === blockIndex;
                return (
                  <textarea
                    key={block.id}
                    value={block.content}
                    onChange={(e) => updateText(block.id, e.target.value)}
                    onFocus={() => setActiveBlockId(block.id)}
                    rows={Math.max(isFirst && blocks.length === 1 ? 6 : 1, block.content.split("\n").length + 1)}
                    className="w-full px-3 py-2 text-sm text-foreground bg-white focus:outline-none resize-none border-0"
                    placeholder={isFirst ? "내용을 입력하세요" : ""}
                  />
                );
              }
              if (block.type === "image") {
                return (
                  <div key={block.id} className="relative mx-3 my-2 flex justify-center">
                    <img src={block.url} alt="" className="max-w-full rounded-lg border border-[#d4d4d4]" />
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              }
              return (
                <div key={block.id} className="relative mx-3 my-2 rounded-lg overflow-hidden border border-[#d4d4d4] bg-black">
                  <video src={block.url} className="w-full max-h-[300px] object-contain" controls />
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* 하단 툴바 */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-[#f8fafc]">
            <label className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-[#5F6B7C] hover:bg-gray-200 transition-colors cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              {uploading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  업로드 중...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  미디어 첨부
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <span className="text-[10px] text-muted">
              {mediaCount > 0 && `${mediaCount}개 첨부 · `}
              이미지 JPG/PNG/WebP/GIF (5MB) · 동영상 MP4/WebM/MOV (50MB)
            </span>
          </div>
        </div>
        {state?.errors?.content && <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-error">{state.message}</p>}

      <div className="flex justify-end gap-2">
        <a href="/community" className="h-11 px-5 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center">취소</a>
        <button type="submit" disabled={pending || uploading} className="h-11 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
