import { z } from "zod";

export const PostSchema = z.object({
  categoryId: z.string().min(1, "카테고리를 선택하세요"),
  title: z
    .string()
    .min(1, "제목을 입력하세요")
    .max(100, "제목은 100자 이하로 입력하세요"),
  content: z.string().min(1, "내용을 입력하세요").max(50000),
});

export type PostFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
