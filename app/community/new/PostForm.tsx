"use client";

import { useActionState } from "react";
import { createPost } from "@/lib/actions/post";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function PostForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createPost, undefined);

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <div>
        <label htmlFor="categoryId" className="block text-sm font-semibold mb-1.5 text-foreground">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state?.errors?.categoryId && (
          <p className="text-xs text-error mt-1">{state.errors.categoryId[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold mb-1.5 text-foreground">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full h-11 rounded-lg border border-border px-3 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          placeholder="제목을 입력하세요"
        />
        {state?.errors?.title && (
          <p className="text-xs text-error mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-semibold mb-1.5 text-foreground">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
          placeholder="내용을 입력하세요"
        />
        {state?.errors?.content && (
          <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <a
          href="/community"
          className="h-11 px-5 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={pending}
          className="h-11 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
