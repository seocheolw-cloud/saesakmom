import { z } from "zod";

// Admin: ProductType
export const ProductTypeSchema = z.object({
  name: z.string().min(1, "종류명을 입력하세요").max(30),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈만 가능합니다"),
});

// Admin: ProductBrand
export const ProductBrandSchema = z.object({
  name: z.string().min(1, "브랜드명을 입력하세요").max(50),
  typeId: z.string().min(1, "종류를 선택하세요"),
});

// Admin: ProductSpecField
export const ProductSpecFieldSchema = z.object({
  name: z.string().min(1, "항목명을 입력하세요").max(50),
  unit: z.string().max(20).optional(),
  typeId: z.string().min(1, "종류를 선택하세요"),
});

// Admin: Product
export const ProductSchema = z.object({
  name: z.string().min(1, "상품명을 입력하세요").max(100),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().url("올바른 URL을 입력하세요").optional().or(z.literal("")),
  typeId: z.string().min(1, "종류를 선택하세요"),
  brandId: z.string().min(1, "브랜드를 선택하세요"),
});

// Public: ProductComment
export const ProductCommentSchema = z.object({
  content: z.string().min(1, "댓글을 입력하세요").max(1000),
});

// Public: Comparison creation
export const ComparisonSchema = z.object({
  productAId: z.string().min(1, "상품 A를 선택하세요"),
  productBId: z.string().min(1, "상품 B를 선택하세요"),
});

// Public: Comparison comment
export const ComparisonCommentSchema = z.object({
  content: z.string().min(1, "댓글을 입력하세요").max(1000),
});

export type AdminFormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;
