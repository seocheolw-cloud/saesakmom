# 육아용품 비교 기능 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a product database and comparison voting system for baby products, with admin management, public browsing, and head-to-head comparison pages.

**Architecture:** Replace the existing unused Product-related Prisma models with a new schema: ProductType → ProductBrand → Product with dynamic spec fields/values. Comparison system stores pairs of same-type products with denormalized vote counts. Admin pages use server actions with ADMIN role checks. Public pages follow existing community page patterns (server components + client interactive components).

**Tech Stack:** Next.js 16 App Router, Prisma 7 (PostgreSQL), Zod validation, React 19 useActionState/useTransition, Tailwind CSS 4

---

## File Structure

### Schema & Config
- **Modify:** `prisma/schema.prisma` — Replace existing Product/ProductSpec/ProductCertification/ProductReviewSummary/ProductScore models with new schema
- **Modify:** `prisma/seed.ts` — Add seed data for product types, brands, products, specs, comparisons

### Validations
- **Create:** `lib/validations/product.ts` — Zod schemas for all product/comparison forms

### Server Actions
- **Create:** `lib/actions/admin-product.ts` — CRUD for types, brands, products, spec fields, spec values
- **Create:** `lib/actions/product-comment.ts` — Product comment CRUD
- **Create:** `lib/actions/comparison.ts` — Comparison creation, voting, commenting

### Admin Pages
- **Create:** `app/admin/layout.tsx` — Admin layout with ADMIN role gate + navigation
- **Create:** `app/admin/products/page.tsx` — Product management dashboard (list/delete products)
- **Create:** `app/admin/products/types/page.tsx` — ProductType CRUD
- **Create:** `app/admin/products/types/TypeManager.tsx` — Client component for inline type management
- **Create:** `app/admin/products/brands/page.tsx` — ProductBrand CRUD
- **Create:** `app/admin/products/brands/BrandManager.tsx` — Client component for inline brand management
- **Create:** `app/admin/products/spec-fields/page.tsx` — ProductSpecField CRUD
- **Create:** `app/admin/products/spec-fields/SpecFieldManager.tsx` — Client component for inline spec field management
- **Create:** `app/admin/products/new/page.tsx` — Product creation form (server component)
- **Create:** `app/admin/products/new/ProductForm.tsx` — Client component for product form
- **Create:** `app/admin/products/[id]/edit/page.tsx` — Product edit form

### Public Product Pages
- **Create:** `app/products/page.tsx` — Product list with type tabs
- **Create:** `app/products/[id]/page.tsx` — Product detail (specs + comments)
- **Create:** `app/products/[id]/ProductComments.tsx` — Client component for product comments

### Comparison Pages
- **Create:** `app/compare/page.tsx` — Comparison list with type filter
- **Create:** `app/compare/new/page.tsx` — Server component wrapper
- **Create:** `app/compare/new/CompareForm.tsx` — Client component for product pair selection
- **Create:** `app/compare/[id]/page.tsx` — Comparison detail (specs side-by-side + voting + comments)
- **Create:** `app/compare/[id]/VoteButton.tsx` — Client component for voting
- **Create:** `app/compare/[id]/CompareComments.tsx` — Client component for comparison comments

### Header Update
- **Modify:** `app/components/Header.tsx` — Add "비교" navigation link

---

## Task 1: Prisma Schema — Replace Product Models

**Files:**
- Modify: `prisma/schema.prisma:207-292` (replace existing product models)
- Modify: `prisma/schema.prisma:13-35` (add User relations)
- Modify: `prisma/schema.prisma:379-383` (keep ProductStatus enum)

- [ ] **Step 1: Replace product models in schema**

Replace lines 207-292 in `prisma/schema.prisma` (the entire "육아용품 비교" section through ProductScore) with:

```prisma
// ==========================================
// 육아용품 비교
// ==========================================

model ProductType {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  brands     ProductBrand[]
  specFields ProductSpecField[]
  products   Product[]

  @@map("product_types")
}

model ProductBrand {
  id        String      @id @default(cuid())
  name      String
  typeId    String
  type      ProductType @relation(fields: [typeId], references: [id], onDelete: Cascade)
  createdAt DateTime    @default(now())

  products Product[]

  @@unique([typeId, name])
  @@map("product_brands")
}

model Product {
  id          String        @id @default(cuid())
  name        String
  description String?       @db.Text
  price       Int?
  imageUrl    String?
  typeId      String
  brandId     String
  status      ProductStatus @default(PUBLISHED)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  type  ProductType  @relation(fields: [typeId], references: [id])
  brand ProductBrand @relation(fields: [brandId], references: [id])

  specValues   ProductSpecValue[]
  comments     ProductComment[]
  comparisonsA ProductComparison[] @relation("ComparisonProductA")
  comparisonsB ProductComparison[] @relation("ComparisonProductB")

  @@index([typeId, status])
  @@map("products")
}

model ProductSpecField {
  id        String      @id @default(cuid())
  name      String
  unit      String?
  sortOrder Int         @default(0)
  typeId    String
  type      ProductType @relation(fields: [typeId], references: [id], onDelete: Cascade)

  values ProductSpecValue[]

  @@unique([typeId, name])
  @@map("product_spec_fields")
}

model ProductSpecValue {
  id        String           @id @default(cuid())
  value     String
  productId String
  fieldId   String
  product   Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  field     ProductSpecField @relation(fields: [fieldId], references: [id], onDelete: Cascade)

  @@unique([productId, fieldId])
  @@map("product_spec_values")
}

model ProductComment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  productId String
  authorId  String
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  author  User    @relation("ProductComments", fields: [authorId], references: [id], onDelete: Cascade)

  @@map("product_comments")
}

model ProductComparison {
  id         String   @id @default(cuid())
  productAId String
  productBId String
  creatorId  String
  voteACount Int      @default(0)
  voteBCount Int      @default(0)
  createdAt  DateTime @default(now())

  productA Product @relation("ComparisonProductA", fields: [productAId], references: [id])
  productB Product @relation("ComparisonProductB", fields: [productBId], references: [id])
  creator  User    @relation("Comparisons", fields: [creatorId], references: [id])

  votes    ComparisonVote[]
  comments ComparisonComment[]

  @@unique([productAId, productBId])
  @@map("product_comparisons")
}

model ComparisonVote {
  id           String           @id @default(cuid())
  comparisonId String
  userId       String
  choice       ComparisonChoice
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  comparison ProductComparison @relation(fields: [comparisonId], references: [id], onDelete: Cascade)
  user       User              @relation("ComparisonVotes", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([comparisonId, userId])
  @@map("comparison_votes")
}

model ComparisonComment {
  id           String   @id @default(cuid())
  content      String   @db.Text
  comparisonId String
  authorId     String
  createdAt    DateTime @default(now())

  comparison ProductComparison @relation(fields: [comparisonId], references: [id], onDelete: Cascade)
  author     User              @relation("ComparisonComments", fields: [authorId], references: [id], onDelete: Cascade)

  @@map("comparison_comments")
}

enum ComparisonChoice {
  A
  B
}
```

- [ ] **Step 2: Add User model relations**

Add these relations to the User model (after the `notifications` line):

```prisma
  productComments    ProductComment[]      @relation("ProductComments")
  comparisons        ProductComparison[]   @relation("Comparisons")
  comparisonVotes    ComparisonVote[]      @relation("ComparisonVotes")
  comparisonComments ComparisonComment[]   @relation("ComparisonComments")
```

- [ ] **Step 3: Generate migration and client**

Run:
```bash
npx prisma migrate dev --name add_product_comparison
npx prisma generate
```

Expected: Migration created, Prisma client regenerated. Old product tables dropped, new tables created.

- [ ] **Step 4: Verify schema**

Run:
```bash
npx prisma db pull --force
```

Check that new tables (`product_types`, `product_brands`, `products`, `product_spec_fields`, `product_spec_values`, `product_comments`, `product_comparisons`, `comparison_votes`, `comparison_comments`) exist.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: replace product schema with type/brand/spec/comparison models"
```

---

## Task 2: Seed Data for Products

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add product seed data**

Add these arrays after the `dummyPosts` array in `prisma/seed.ts`:

```typescript
const productTypes = [
  { name: "카시트", slug: "carseat", sortOrder: 1 },
  { name: "유모차", slug: "stroller", sortOrder: 2 },
  { name: "젖병", slug: "bottle", sortOrder: 3 },
  { name: "기저귀", slug: "diaper", sortOrder: 4 },
];

const productBrands: Record<string, string[]> = {
  carseat: ["사이벡스", "맥시코시", "다이치", "순성"],
  stroller: ["부가부", "스토케", "잉글레시나", "실버크로스"],
  bottle: ["닥터브라운", "아벤트", "헤겐", "보네스"],
  diaper: ["하기스", "팸퍼스", "마미포코", "보솜이"],
};

const productSpecFields: Record<string, { name: string; unit?: string }[]> = {
  carseat: [
    { name: "최대허용하중", unit: "kg" },
    { name: "ISOFIX여부" },
    { name: "무게", unit: "kg" },
    { name: "사용연령" },
    { name: "회전여부" },
  ],
  stroller: [
    { name: "무게", unit: "kg" },
    { name: "폴딩방식" },
    { name: "시트높이", unit: "cm" },
    { name: "바퀴크기", unit: "인치" },
    { name: "양대면여부" },
  ],
  bottle: [
    { name: "용량", unit: "ml" },
    { name: "소재" },
    { name: "꼭지단계" },
    { name: "세척편의성" },
  ],
  diaper: [
    { name: "사이즈범위" },
    { name: "매수" },
    { name: "소재" },
    { name: "흡수력등급" },
  ],
};

// [typeSlug, brandName, productName, price, description, specValues (in field order)]
const productData: [string, string, string, number, string, string[]][] = [
  ["carseat", "사이벡스", "시로나 T i-Size", 890000, "360도 회전형 신생아~4세 카시트. ISOFIX 설치로 안전하고 편리합니다.", ["18", "O", "15.4", "신생아~4세", "360도"]],
  ["carseat", "사이벡스", "솔루션 T i-Fix", 450000, "주니어 카시트. 3세~12세까지 사용 가능한 경량 모델.", ["36", "O", "7.2", "3~12세", "X"]],
  ["carseat", "맥시코시", "마이카 360 프로", 750000, "360도 회전 ISOFIX 카시트. 신생아부터 사용 가능.", ["18", "O", "14.5", "신생아~4세", "360도"]],
  ["carseat", "다이치", "원 FIX 360 i", 590000, "국산 회전형 카시트. 가성비 좋은 선택.", ["18", "O", "12.8", "신생아~4세", "360도"]],
  ["carseat", "순성", "듀클 헤로", 320000, "경제적인 가격의 주니어 카시트.", ["36", "O", "6.5", "3~12세", "X"]],

  ["stroller", "부가부", "폭스5", 1690000, "부가부 대표 풀사이즈 유모차. 안정적인 주행감과 넉넉한 수납.", ["9.4", "원터치 폴딩", "52", "12", "O"]],
  ["stroller", "스토케", "익스플로리 X", 1890000, "하이시트 유모차. 아이와 눈높이를 맞출 수 있는 디자인.", ["13.2", "투터치 폴딩", "63", "12", "O"]],
  ["stroller", "잉글레시나", "퀴드2", 490000, "가볍고 컴팩트한 휴대용 유모차.", ["6.9", "원터치 폴딩", "48", "6", "X"]],
  ["stroller", "실버크로스", "리프2", 890000, "영국 프리미엄 유모차. 서스펜션이 뛰어남.", ["10.5", "원터치 폴딩", "55", "10", "O"]],

  ["bottle", "닥터브라운", "옵션즈+ 와이드넥", 15000, "배앓이 방지 특허 내부 환기 시스템.", ["270", "PP", "1~4단계", "보통"]],
  ["bottle", "아벤트", "내추럴 3.0", 14000, "자연스러운 수유감. 넓은 젖꼭지로 모유수유 병행 가능.", ["260", "PP", "1~6단계", "쉬움"]],
  ["bottle", "헤겐", "PCTO", 28000, "혁신적 오프센터 디자인. 세척이 매우 편리.", ["240", "PPSU", "1~4단계", "매우쉬움"]],

  ["diaper", "하기스", "매직컴포트", 35000, "부드러운 착용감과 뛰어난 흡수력.", ["3~8kg (2단계)", "44매", "순면커버", "A+"]],
  ["diaper", "팸퍼스", "베이비드라이", 32000, "최대 12시간 보송함. 새지 않는 3중 흡수층.", ["4~8kg (2단계)", "46매", "코튼소프트", "A"]],
  ["diaper", "마미포코", "에어핏 팬티", 25000, "가성비 좋은 팬티형 기저귀.", ["7~11kg (3단계)", "40매", "통기성시트", "B+"]],
];
```

- [ ] **Step 2: Add product seeding logic in the main() function**

Add after the comments seeding section:

```typescript
  // 육아용품 시드
  for (const pt of productTypes) {
    await prisma.productType.upsert({
      where: { slug: pt.slug },
      update: { name: pt.name, sortOrder: pt.sortOrder },
      create: pt,
    });
  }

  const typeMap = await prisma.productType.findMany();
  const typeSlugToId: Record<string, string> = {};
  for (const t of typeMap) typeSlugToId[t.slug] = t.id;

  for (const [slug, brands] of Object.entries(productBrands)) {
    const typeId = typeSlugToId[slug];
    for (const name of brands) {
      await prisma.productBrand.upsert({
        where: { typeId_name: { typeId, name } },
        update: {},
        create: { name, typeId },
      });
    }
  }

  for (const [slug, fields] of Object.entries(productSpecFields)) {
    const typeId = typeSlugToId[slug];
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      await prisma.productSpecField.upsert({
        where: { typeId_name: { typeId, name: f.name } },
        update: { unit: f.unit ?? null, sortOrder: i },
        create: { name: f.name, unit: f.unit, sortOrder: i, typeId },
      });
    }
  }

  const brandMap = await prisma.productBrand.findMany();
  const brandKey = (typeId: string, name: string) => `${typeId}:${name}`;
  const brandLookup: Record<string, string> = {};
  for (const b of brandMap) brandLookup[brandKey(b.typeId, b.name)] = b.id;

  const specFieldMap = await prisma.productSpecField.findMany({ orderBy: { sortOrder: "asc" } });
  const specFieldsByType: Record<string, typeof specFieldMap> = {};
  for (const sf of specFieldMap) {
    (specFieldsByType[sf.typeId] ??= []).push(sf);
  }

  let productSeedCount = 0;
  for (const [typeSlug, brandName, name, price, description, specValues] of productData) {
    const typeId = typeSlugToId[typeSlug];
    const brandId = brandLookup[brandKey(typeId, brandName)];
    if (!typeId || !brandId) continue;

    const existing = await prisma.product.findFirst({ where: { name, brandId } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: { name, price, description, typeId, brandId },
    });

    const fields = specFieldsByType[typeId] || [];
    for (let i = 0; i < fields.length && i < specValues.length; i++) {
      await prisma.productSpecValue.create({
        data: { value: specValues[i], productId: product.id, fieldId: fields[i].id },
      });
    }
    productSeedCount++;
  }
  console.log(`Products seeded (${productSeedCount})`);

  // 비교 시드 (카시트 2개)
  const carseatType = typeMap.find((t) => t.slug === "carseat");
  if (carseatType) {
    const carseatProducts = await prisma.product.findMany({
      where: { typeId: carseatType.id },
      take: 2,
      orderBy: { createdAt: "asc" },
    });
    if (carseatProducts.length === 2) {
      const [pA, pB] = carseatProducts[0].id < carseatProducts[1].id
        ? [carseatProducts[0], carseatProducts[1]]
        : [carseatProducts[1], carseatProducts[0]];

      await prisma.productComparison.upsert({
        where: { productAId_productBId: { productAId: pA.id, productBId: pB.id } },
        update: {},
        create: {
          productAId: pA.id,
          productBId: pB.id,
          creatorId: userIds[0],
          voteACount: 15,
          voteBCount: 8,
        },
      });
      console.log("Comparison seeded");
    }
  }
```

- [ ] **Step 3: Run seed**

```bash
npm run seed
```

Expected: Types, brands, products, spec fields/values, and comparison data seeded.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add product & comparison seed data"
```

---

## Task 3: Validation Schemas

**Files:**
- Create: `lib/validations/product.ts`

- [ ] **Step 1: Create product validation schemas**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/validations/product.ts
git commit -m "feat: add Zod validation schemas for product & comparison"
```

---

## Task 4: Admin Server Actions

**Files:**
- Create: `lib/actions/admin-product.ts`

- [ ] **Step 1: Create admin server actions**

```typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ProductTypeSchema,
  ProductBrandSchema,
  ProductSpecFieldSchema,
  ProductSchema,
  type AdminFormState,
} from "@/lib/validations/product";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

// ─── ProductType ────────────────────────────

export async function createProductType(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = ProductTypeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.productType.create({ data: parsed.data });
  } catch {
    return { message: "이미 존재하는 종류입니다." };
  }
  revalidatePath("/admin/products");
  return { message: "" };
}

export async function deleteProductType(id: string): Promise<void> {
  await requireAdmin();
  await prisma.productType.delete({ where: { id } });
  revalidatePath("/admin/products");
}

// ─── ProductBrand ───────────────────────────

export async function createProductBrand(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = ProductBrandSchema.safeParse({
    name: formData.get("name"),
    typeId: formData.get("typeId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.productBrand.create({ data: parsed.data });
  } catch {
    return { message: "이미 존재하는 브랜드입니다." };
  }
  revalidatePath("/admin/products");
  return { message: "" };
}

export async function deleteProductBrand(id: string): Promise<void> {
  await requireAdmin();
  await prisma.productBrand.delete({ where: { id } });
  revalidatePath("/admin/products");
}

// ─── ProductSpecField ───────────────────────

export async function createProductSpecField(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = ProductSpecFieldSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit") || undefined,
    typeId: formData.get("typeId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.productSpecField.create({
      data: { name: parsed.data.name, unit: parsed.data.unit, typeId: parsed.data.typeId },
    });
  } catch {
    return { message: "이미 존재하는 스펙 항목입니다." };
  }
  revalidatePath("/admin/products");
  return { message: "" };
}

export async function deleteProductSpecField(id: string): Promise<void> {
  await requireAdmin();
  await prisma.productSpecField.delete({ where: { id } });
  revalidatePath("/admin/products");
}

// ─── Product ────────────────────────────────

export async function createProduct(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    typeId: formData.get("typeId"),
    brandId: formData.get("brandId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  let productId: string;
  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        imageUrl: parsed.data.imageUrl || null,
        typeId: parsed.data.typeId,
        brandId: parsed.data.brandId,
      },
    });
    productId = product.id;
  } catch {
    return { message: "상품 등록에 실패했습니다." };
  }

  // Save spec values
  const specFields = await prisma.productSpecField.findMany({
    where: { typeId: parsed.data.typeId },
  });
  for (const field of specFields) {
    const value = formData.get(`spec_${field.id}`) as string;
    if (value?.trim()) {
      await prisma.productSpecValue.create({
        data: { value: value.trim(), productId, fieldId: field.id },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    typeId: formData.get("typeId"),
    brandId: formData.get("brandId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        imageUrl: parsed.data.imageUrl || null,
        typeId: parsed.data.typeId,
        brandId: parsed.data.brandId,
      },
    });
  } catch {
    return { message: "상품 수정에 실패했습니다." };
  }

  // Replace spec values
  await prisma.productSpecValue.deleteMany({ where: { productId } });
  const specFields = await prisma.productSpecField.findMany({
    where: { typeId: parsed.data.typeId },
  });
  for (const field of specFields) {
    const value = formData.get(`spec_${field.id}`) as string;
    if (value?.trim()) {
      await prisma.productSpecValue.create({
        data: { value: value.trim(), productId, fieldId: field.id },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/admin-product.ts
git commit -m "feat: add admin server actions for product management"
```

---

## Task 5: Product Comment & Comparison Server Actions

**Files:**
- Create: `lib/actions/product-comment.ts`
- Create: `lib/actions/comparison.ts`

- [ ] **Step 1: Create product comment actions**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCommentSchema, type AdminFormState } from "@/lib/validations/product";

export async function createProductComment(
  productId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user) return { message: "로그인이 필요합니다." };

  const parsed = ProductCommentSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.productComment.create({
      data: {
        content: parsed.data.content,
        productId,
        authorId: session.user.id,
      },
    });
  } catch {
    return { message: "댓글 작성에 실패했습니다." };
  }

  revalidatePath(`/products/${productId}`);
  return { message: "" };
}

export async function deleteProductComment(
  commentId: string,
  productId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const comment = await prisma.productComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return;

  await prisma.productComment.delete({ where: { id: commentId } });
  revalidatePath(`/products/${productId}`);
}
```

- [ ] **Step 2: Create comparison actions**

```typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ComparisonSchema,
  ComparisonCommentSchema,
  type AdminFormState,
} from "@/lib/validations/product";

export async function createComparison(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user) return { message: "로그인이 필요합니다." };

  const parsed = ComparisonSchema.safeParse({
    productAId: formData.get("productAId"),
    productBId: formData.get("productBId"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  if (parsed.data.productAId === parsed.data.productBId) {
    return { message: "같은 상품을 비교할 수 없습니다." };
  }

  // Verify same type
  const [productA, productB] = await Promise.all([
    prisma.product.findUnique({ where: { id: parsed.data.productAId }, select: { typeId: true } }),
    prisma.product.findUnique({ where: { id: parsed.data.productBId }, select: { typeId: true } }),
  ]);
  if (!productA || !productB) return { message: "상품을 찾을 수 없습니다." };
  if (productA.typeId !== productB.typeId) {
    return { message: "같은 종류의 상품만 비교할 수 있습니다." };
  }

  // Normalize order for unique constraint (smaller ID first)
  const [aId, bId] =
    parsed.data.productAId < parsed.data.productBId
      ? [parsed.data.productAId, parsed.data.productBId]
      : [parsed.data.productBId, parsed.data.productAId];

  // Check existing
  const existing = await prisma.productComparison.findUnique({
    where: { productAId_productBId: { productAId: aId, productBId: bId } },
  });
  if (existing) {
    redirect(`/compare/${existing.id}`);
  }

  const comparison = await prisma.productComparison.create({
    data: { productAId: aId, productBId: bId, creatorId: session.user.id },
  });

  revalidatePath("/compare");
  redirect(`/compare/${comparison.id}`);
}

export async function castVote(
  comparisonId: string,
  choice: "A" | "B"
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const existing = await prisma.comparisonVote.findUnique({
    where: { comparisonId_userId: { comparisonId, userId: session.user.id } },
  });

  if (existing) {
    if (existing.choice === choice) {
      // Remove vote
      await prisma.$transaction([
        prisma.comparisonVote.delete({ where: { id: existing.id } }),
        prisma.productComparison.update({
          where: { id: comparisonId },
          data: choice === "A" ? { voteACount: { decrement: 1 } } : { voteBCount: { decrement: 1 } },
        }),
      ]);
    } else {
      // Switch vote
      await prisma.$transaction([
        prisma.comparisonVote.update({ where: { id: existing.id }, data: { choice } }),
        prisma.productComparison.update({
          where: { id: comparisonId },
          data:
            choice === "A"
              ? { voteACount: { increment: 1 }, voteBCount: { decrement: 1 } }
              : { voteACount: { decrement: 1 }, voteBCount: { increment: 1 } },
        }),
      ]);
    }
  } else {
    // New vote
    await prisma.$transaction([
      prisma.comparisonVote.create({
        data: { comparisonId, userId: session.user.id, choice },
      }),
      prisma.productComparison.update({
        where: { id: comparisonId },
        data: choice === "A" ? { voteACount: { increment: 1 } } : { voteBCount: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath(`/compare/${comparisonId}`);
}

export async function createComparisonComment(
  comparisonId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user) return { message: "로그인이 필요합니다." };

  const parsed = ComparisonCommentSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await prisma.comparisonComment.create({
      data: {
        content: parsed.data.content,
        comparisonId,
        authorId: session.user.id,
      },
    });
  } catch {
    return { message: "댓글 작성에 실패했습니다." };
  }

  revalidatePath(`/compare/${comparisonId}`);
  return { message: "" };
}

export async function deleteComparisonComment(
  commentId: string,
  comparisonId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const comment = await prisma.comparisonComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return;

  await prisma.comparisonComment.delete({ where: { id: commentId } });
  revalidatePath(`/compare/${comparisonId}`);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/actions/product-comment.ts lib/actions/comparison.ts
git commit -m "feat: add server actions for product comments and comparisons"
```

---

## Task 6: Admin Layout & Type Management

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/products/page.tsx`
- Create: `app/admin/products/types/page.tsx`
- Create: `app/admin/products/types/TypeManager.tsx`

- [ ] **Step 1: Create admin layout**

`app/admin/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { name: "상품 관리", href: "/admin/products" },
    { name: "종류 관리", href: "/admin/products/types" },
    { name: "브랜드 관리", href: "/admin/products/brands" },
    { name: "스펙 항목", href: "/admin/products/spec-fields" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-foreground mb-4">관리자</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b] transition-all"
            >
              {item.name}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create admin products overview page**

`app/admin/products/page.tsx`:
```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/admin-product";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      type: { select: { name: true } },
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">상품 목록</h2>
        <Link
          href="/admin/products/new"
          className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
        >
          상품 등록
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 상품이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">상품명</th>
                <th className="px-4 py-2.5 text-left">종류</th>
                <th className="px-4 py-2.5 text-left">브랜드</th>
                <th className="px-4 py-2.5 text-right">가격</th>
                <th className="px-4 py-2.5 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff]">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.type.name}</td>
                  <td className="px-4 py-3 text-muted">{p.brand.name}</td>
                  <td className="px-4 py-3 text-right text-muted">
                    {p.price ? `${p.price.toLocaleString()}원` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs text-primary hover:underline"
                      >
                        수정
                      </Link>
                      <form action={deleteProduct.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="text-xs text-error hover:opacity-75"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create type management page**

`app/admin/products/types/page.tsx`:
```tsx
import { prisma } from "@/lib/prisma";
import { TypeManager } from "./TypeManager";

export default async function TypesPage() {
  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true, brands: true } } },
  });

  return <TypeManager types={types} />;
}
```

- [ ] **Step 4: Create TypeManager client component**

`app/admin/products/types/TypeManager.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { createProductType, deleteProductType } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type ProductTypeRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count: { products: number; brands: number };
};

export function TypeManager({ types }: { types: ProductTypeRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createProductType,
    undefined
  );

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">종류 관리</h2>

      {/* 추가 폼 */}
      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">종류명</label>
            <input
              name="name"
              placeholder="예: 카시트"
              className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">슬러그</label>
            <input
              name="slug"
              placeholder="예: carseat"
              className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && (
          <p className="text-xs text-error mt-2">{state.message}</p>
        )}
        {state?.errors?.name && <p className="text-xs text-error mt-2">{state.errors.name[0]}</p>}
        {state?.errors?.slug && <p className="text-xs text-error mt-2">{state.errors.slug[0]}</p>}
      </form>

      {/* 목록 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {types.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 종류가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">종류명</th>
                <th className="px-4 py-2.5 text-left">슬러그</th>
                <th className="px-4 py-2.5 text-center">브랜드</th>
                <th className="px-4 py-2.5 text-center">상품</th>
                <th className="px-4 py-2.5 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.slug}</td>
                  <td className="px-4 py-3 text-center text-muted">{t._count.brands}</td>
                  <td className="px-4 py-3 text-center text-muted">{t._count.products}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={deleteProductType.bind(null, t.id)}>
                      <button type="submit" className="text-xs text-error hover:opacity-75">
                        삭제
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify admin layout loads**

Run dev server. Visit http://localhost:3000/admin/products (must be logged in as ADMIN). Non-admin users should be redirected to `/`.

- [ ] **Step 6: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin layout, product list, and type management pages"
```

---

## Task 7: Admin Brand & Spec Field Management

**Files:**
- Create: `app/admin/products/brands/page.tsx`
- Create: `app/admin/products/brands/BrandManager.tsx`
- Create: `app/admin/products/spec-fields/page.tsx`
- Create: `app/admin/products/spec-fields/SpecFieldManager.tsx`

- [ ] **Step 1: Create brand management page**

`app/admin/products/brands/page.tsx`:
```tsx
import { prisma } from "@/lib/prisma";
import { BrandManager } from "./BrandManager";

export default async function BrandsPage() {
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const brands = await prisma.productBrand.findMany({
    include: {
      type: { select: { name: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <BrandManager types={types} brands={brands} />;
}
```

- [ ] **Step 2: Create BrandManager client component**

`app/admin/products/brands/BrandManager.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { createProductBrand, deleteProductBrand } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type BrandRow = {
  id: string;
  name: string;
  type: { name: string };
  _count: { products: number };
};

type TypeOption = { id: string; name: string };

export function BrandManager({ types, brands }: { types: TypeOption[]; brands: BrandRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createProductBrand,
    undefined
  );

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">브랜드 관리</h2>

      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">종류</label>
            <select
              name="typeId"
              required
              className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
            >
              <option value="">선택</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">브랜드명</label>
            <input
              name="name"
              placeholder="예: 사이벡스"
              className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && (
          <p className="text-xs text-error mt-2">{state.message}</p>
        )}
      </form>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {brands.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 브랜드가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">브랜드명</th>
                <th className="px-4 py-2.5 text-left">종류</th>
                <th className="px-4 py-2.5 text-center">상품</th>
                <th className="px-4 py-2.5 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3 text-muted">{b.type.name}</td>
                  <td className="px-4 py-3 text-center text-muted">{b._count.products}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={deleteProductBrand.bind(null, b.id)}>
                      <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create spec field management page**

`app/admin/products/spec-fields/page.tsx`:
```tsx
import { prisma } from "@/lib/prisma";
import { SpecFieldManager } from "./SpecFieldManager";

export default async function SpecFieldsPage() {
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const fields = await prisma.productSpecField.findMany({
    include: { type: { select: { name: true } } },
    orderBy: [{ type: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return <SpecFieldManager types={types} fields={fields} />;
}
```

- [ ] **Step 4: Create SpecFieldManager client component**

`app/admin/products/spec-fields/SpecFieldManager.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { createProductSpecField, deleteProductSpecField } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type FieldRow = {
  id: string;
  name: string;
  unit: string | null;
  sortOrder: number;
  type: { name: string };
};

type TypeOption = { id: string; name: string };

export function SpecFieldManager({ types, fields }: { types: TypeOption[]; fields: FieldRow[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createProductSpecField,
    undefined
  );

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">스펙 항목 관리</h2>

      <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">종류</label>
            <select
              name="typeId"
              required
              className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
            >
              <option value="">선택</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">항목명</label>
            <input
              name="name"
              placeholder="예: 최대허용하중"
              className="h-9 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">단위</label>
            <input
              name="unit"
              placeholder="예: kg"
              className="h-9 w-20 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
        {state?.message && state.message !== "" && (
          <p className="text-xs text-error mt-2">{state.message}</p>
        )}
      </form>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        {fields.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">등록된 스펙 항목이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left">종류</th>
                <th className="px-4 py-2.5 text-left">항목명</th>
                <th className="px-4 py-2.5 text-left">단위</th>
                <th className="px-4 py-2.5 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-muted">{f.type.name}</td>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3 text-muted">{f.unit || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={deleteProductSpecField.bind(null, f.id)}>
                      <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/products/brands/ app/admin/products/spec-fields/
git commit -m "feat: add admin brand and spec field management pages"
```

---

## Task 8: Admin Product Create & Edit

**Files:**
- Create: `app/admin/products/new/page.tsx`
- Create: `app/admin/products/new/ProductForm.tsx`
- Create: `app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: Create product form page (new)**

`app/admin/products/new/page.tsx`:
```tsx
import { prisma } from "@/lib/prisma";
import { ProductForm } from "./ProductForm";

export default async function NewProductPage() {
  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      brands: { orderBy: { name: "asc" } },
      specFields: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">상품 등록</h2>
      <ProductForm types={types} />
    </div>
  );
}
```

- [ ] **Step 2: Create ProductForm client component**

`app/admin/products/new/ProductForm.tsx`:
```tsx
"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "@/lib/actions/admin-product";
import type { AdminFormState } from "@/lib/validations/product";

type SpecField = { id: string; name: string; unit: string | null };
type Brand = { id: string; name: string };
type TypeWithRelations = {
  id: string;
  name: string;
  brands: Brand[];
  specFields: SpecField[];
};

type ExistingProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  typeId: string;
  brandId: string;
  specValues: { fieldId: string; value: string }[];
};

export function ProductForm({
  types,
  product,
}: {
  types: TypeWithRelations[];
  product?: ExistingProduct;
}) {
  const [selectedTypeId, setSelectedTypeId] = useState(product?.typeId ?? "");
  const selectedType = types.find((t) => t.id === selectedTypeId);

  const actionFn = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    actionFn,
    undefined
  );

  const specValueMap = new Map(
    product?.specValues.map((sv) => [sv.fieldId, sv.value]) ?? []
  );

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      {/* 종류 */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">종류</label>
        <select
          name="typeId"
          value={selectedTypeId}
          onChange={(e) => setSelectedTypeId(e.target.value)}
          required
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="">선택하세요</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {state?.errors?.typeId && <p className="text-xs text-error mt-1">{state.errors.typeId[0]}</p>}
      </div>

      {/* 브랜드 */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">브랜드</label>
        <select
          name="brandId"
          defaultValue={product?.brandId ?? ""}
          required
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="">선택하세요</option>
          {(selectedType?.brands ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        {state?.errors?.brandId && <p className="text-xs text-error mt-1">{state.errors.brandId[0]}</p>}
      </div>

      {/* 상품명 */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">상품명</label>
        <input
          name="name"
          defaultValue={product?.name ?? ""}
          required
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        />
        {state?.errors?.name && <p className="text-xs text-error mt-1">{state.errors.name[0]}</p>}
      </div>

      {/* 가격 */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">가격 (원)</label>
        <input
          name="price"
          type="number"
          min={0}
          defaultValue={product?.price ?? ""}
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* 이미지 URL */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">이미지 URL</label>
        <input
          name="imageUrl"
          defaultValue={product?.imageUrl ?? ""}
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">설명</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary"
        />
      </div>

      {/* 스펙 값 */}
      {selectedType && selectedType.specFields.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted mb-2">스펙 정보</label>
          <div className="space-y-2">
            {selectedType.specFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-sm text-foreground w-32 shrink-0">
                  {field.name}{field.unit ? ` (${field.unit})` : ""}
                </span>
                <input
                  name={`spec_${field.id}`}
                  defaultValue={specValueMap.get(field.id) ?? ""}
                  className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {state?.message && state.message !== "" && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 px-6 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {pending ? "저장 중..." : product ? "수정" : "등록"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create product edit page**

`app/admin/products/[id]/edit/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../new/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      specValues: { select: { fieldId: true, value: true } },
    },
  });

  if (!product) notFound();

  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      brands: { orderBy: { name: "asc" } },
      specFields: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">상품 수정</h2>
      <ProductForm types={types} product={product} />
    </div>
  );
}
```

- [ ] **Step 4: Verify product creation flow**

Visit http://localhost:3000/admin/products/new (as ADMIN). Select a type, verify brands and spec fields update dynamically. Submit the form.

- [ ] **Step 5: Commit**

```bash
git add app/admin/products/new/ app/admin/products/\[id\]/
git commit -m "feat: add admin product create and edit pages"
```

---

## Task 9: Public Product Pages

**Files:**
- Create: `app/products/page.tsx`
- Create: `app/products/[id]/page.tsx`
- Create: `app/products/[id]/ProductComments.tsx`

- [ ] **Step 1: Create product list page**

`app/products/page.tsx`:
```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/components/Header";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeSlug = params.type;

  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(typeSlug && { type: { slug: typeSlug } }),
    },
    include: {
      type: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const isAll = !typeSlug;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-foreground mb-4">육아용품</h1>

        {/* 종류 탭 */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Link
            href="/products"
            className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
              isAll
                ? "bg-foreground text-white"
                : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
            }`}
          >
            전체
          </Link>
          {types.map((t) => (
            <Link
              key={t.slug}
              href={`/products?type=${t.slug}`}
              className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
                typeSlug === t.slug
                  ? "bg-foreground text-white"
                  : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted">{products.length}개 상품</span>
          <Link
            href="/compare"
            className="h-9 px-4 rounded-lg border border-primary text-sm font-semibold text-primary hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            비교 투표
          </Link>
        </div>

        {/* 상품 카드 그리드 */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">
            등록된 상품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="bg-white rounded-xl border border-[#d4d4d4] p-4 hover:border-primary transition-colors"
              >
                {p.imageUrl && (
                  <div className="w-full h-40 bg-[#f8fafc] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-primary">[{p.type.name}]</span>
                  <span className="text-xs text-muted">{p.brand.name}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{p.name}</h3>
                {p.price && (
                  <p className="text-sm font-bold text-foreground">
                    {p.price.toLocaleString()}원
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create product detail page**

`app/products/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { ProductComments } from "./ProductComments";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      type: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
      specValues: {
        include: { field: { select: { name: true, unit: true, sortOrder: true } } },
        orderBy: { field: { sortOrder: "asc" } },
      },
    },
  });

  if (!product) notFound();

  const comments = await prisma.productComment.findMany({
    where: { productId: id },
    include: { author: { select: { id: true, nickname: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">
                {product.type.name}
              </span>
              <span className="text-xs text-muted">{product.brand.name}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{product.name}</h1>
            {product.price && (
              <p className="text-lg font-bold text-primary">
                {product.price.toLocaleString()}원
              </p>
            )}
          </div>

          {/* 설명 */}
          {product.description && (
            <div className="p-6 border-b border-border">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* 스펙 테이블 */}
          {product.specValues.length > 0 && (
            <div className="p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">상세 스펙</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specValues.map((sv) => (
                    <tr key={sv.id} className="border-b border-border last:border-b-0">
                      <td className="py-2.5 pr-4 text-muted font-medium w-1/3">
                        {sv.field.name}
                      </td>
                      <td className="py-2.5 text-foreground">
                        {sv.value}{sv.field.unit ? ` ${sv.field.unit}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        {/* 댓글 */}
        <ProductComments
          productId={product.id}
          comments={comments}
          currentUserId={session?.user?.id}
        />

        <div className="mt-4">
          <Link
            href={`/products?type=${product.type.slug}`}
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            ← 목록으로
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create ProductComments client component**

`app/products/[id]/ProductComments.tsx`:
```tsx
"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { createProductComment, deleteProductComment } from "@/lib/actions/product-comment";
import type { AdminFormState } from "@/lib/validations/product";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; nickname: string };
};

export function ProductComments({
  productId,
  comments,
  currentUserId,
}: {
  productId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  const boundAction = createProductComment.bind(null, productId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    boundAction,
    undefined
  );

  return (
    <div className="mt-4 bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4]">
        <h2 className="text-sm font-semibold text-foreground">댓글 {comments.length}개</h2>
      </div>

      {currentUserId ? (
        <div className="px-6 py-4 border-b border-[#d4d4d4]">
          <form
            action={formAction}
            key={state?.message === "" ? "reset-" + Date.now() : "form"}
          >
            <textarea
              name="content"
              rows={2}
              placeholder="댓글을 입력하세요"
              className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary"
              required
            />
            {state?.errors?.content && (
              <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>
            )}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={pending}
                className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {pending ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-[#d4d4d4] text-sm text-muted">
          <Link href="/login" className="text-primary hover:underline">로그인</Link>
          {" 후 댓글을 작성할 수 있습니다."}
        </div>
      )}

      {comments.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted">첫 번째 댓글을 작성해보세요.</div>
      ) : (
        <div>
          {comments.map((c, i) => (
            <div
              key={c.id}
              className={`px-6 py-4 ${i < comments.length - 1 ? "border-b border-[#d4d4d4]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.author.nickname}</span>
                  <span className="text-xs text-muted">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {currentUserId === c.author.id && (
                  <form action={deleteProductComment.bind(null, c.id, productId)}>
                    <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                  </form>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify product pages**

Visit http://localhost:3000/products — should show type tabs and product cards.
Click a product — should show detail with spec table and comment section.

- [ ] **Step 5: Commit**

```bash
git add app/products/
git commit -m "feat: add public product list and detail pages with comments"
```

---

## Task 10: Comparison List & Creation Pages

**Files:**
- Create: `app/compare/page.tsx`
- Create: `app/compare/new/page.tsx`
- Create: `app/compare/new/CompareForm.tsx`

- [ ] **Step 1: Create comparison list page**

`app/compare/page.tsx`:
```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeSlug = params.type;
  const session = await auth();

  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });

  const comparisons = await prisma.productComparison.findMany({
    where: typeSlug
      ? { productA: { type: { slug: typeSlug } } }
      : undefined,
    include: {
      productA: {
        select: { name: true, brand: { select: { name: true } }, type: { select: { name: true, slug: true } } },
      },
      productB: {
        select: { name: true, brand: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-foreground">비교 투표</h1>
          {session?.user && (
            <Link
              href="/compare/new"
              className="h-9 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
            >
              비교 만들기
            </Link>
          )}
        </div>

        {/* 종류 필터 */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Link
            href="/compare"
            className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
              !typeSlug
                ? "bg-foreground text-white"
                : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
            }`}
          >
            전체
          </Link>
          {types.map((t) => (
            <Link
              key={t.slug}
              href={`/compare?type=${t.slug}`}
              className={`h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center transition-all ${
                typeSlug === t.slug
                  ? "bg-foreground text-white"
                  : "bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b]"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>

        {/* 비교 목록 */}
        {comparisons.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#d4d4d4] p-8 text-center text-sm text-muted">
            등록된 비교가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {comparisons.map((c) => {
              const total = c.voteACount + c.voteBCount;
              const pctA = total > 0 ? Math.round((c.voteACount / total) * 100) : 50;
              const pctB = 100 - pctA;

              return (
                <Link
                  key={c.id}
                  href={`/compare/${c.id}`}
                  className="block bg-white rounded-xl border border-[#d4d4d4] p-4 hover:border-primary transition-colors"
                >
                  <span className="text-xs font-semibold text-primary mb-2 block">
                    [{c.productA.type.name}]
                  </span>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-foreground flex-1 text-center">
                      {c.productA.brand.name} {c.productA.name}
                    </span>
                    <span className="text-xs font-bold text-muted shrink-0">VS</span>
                    <span className="text-sm font-semibold text-foreground flex-1 text-center">
                      {c.productB.brand.name} {c.productB.name}
                    </span>
                  </div>
                  {/* 투표 바 */}
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-10 text-right font-semibold text-blue-500">{pctA}%</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-400 rounded-l-full transition-all"
                        style={{ width: `${pctA}%` }}
                      />
                      <div
                        className="h-full bg-red-400 rounded-r-full transition-all"
                        style={{ width: `${pctB}%` }}
                      />
                    </div>
                    <span className="w-10 font-semibold text-red-500">{pctB}%</span>
                  </div>
                  <p className="text-xs text-muted text-center mt-1">{total}표</p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create comparison creation page**

`app/compare/new/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { CompareForm } from "./CompareForm";

export default async function NewComparePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        select: { id: true, name: true, brand: { select: { name: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[600px] mx-auto px-4 py-8">
        <h1 className="text-lg font-bold text-foreground mb-4">비교 만들기</h1>
        <CompareForm types={types} />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create CompareForm client component**

`app/compare/new/CompareForm.tsx`:
```tsx
"use client";

import { useActionState, useState } from "react";
import { createComparison } from "@/lib/actions/comparison";
import type { AdminFormState } from "@/lib/validations/product";

type ProductOption = { id: string; name: string; brand: { name: string } };
type TypeWithProducts = { id: string; name: string; products: ProductOption[] };

export function CompareForm({ types }: { types: TypeWithProducts[] }) {
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const selectedType = types.find((t) => t.id === selectedTypeId);
  const products = selectedType?.products ?? [];

  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createComparison,
    undefined
  );

  return (
    <form action={action} className="bg-white rounded-xl border border-[#d4d4d4] p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1">종류 선택</label>
        <select
          value={selectedTypeId}
          onChange={(e) => setSelectedTypeId(e.target.value)}
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="">선택하세요</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1">상품 A</label>
        <select
          name="productAId"
          required
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="">선택하세요</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.brand.name} {p.name}</option>
          ))}
        </select>
        {state?.errors?.productAId && (
          <p className="text-xs text-error mt-1">{state.errors.productAId[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1">상품 B</label>
        <select
          name="productBId"
          required
          className="h-10 w-full px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="">선택하세요</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.brand.name} {p.name}</option>
          ))}
        </select>
        {state?.errors?.productBId && (
          <p className="text-xs text-error mt-1">{state.errors.productBId[0]}</p>
        )}
      </div>

      {state?.message && state.message !== "" && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || !selectedTypeId}
        className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {pending ? "생성 중..." : "비교 만들기"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Verify comparison creation**

Visit http://localhost:3000/compare/new. Select type, pick two products, submit. Verify redirect to comparison detail or "이미 등록된 비교" redirect.

- [ ] **Step 5: Commit**

```bash
git add app/compare/
git commit -m "feat: add comparison list and creation pages"
```

---

## Task 11: Comparison Detail Page (Specs + Voting + Comments)

**Files:**
- Create: `app/compare/[id]/page.tsx`
- Create: `app/compare/[id]/VoteButton.tsx`
- Create: `app/compare/[id]/CompareComments.tsx`

- [ ] **Step 1: Create comparison detail page**

`app/compare/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { VoteButton } from "./VoteButton";
import { CompareComments } from "./CompareComments";

export default async function CompareDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const comparison = await prisma.productComparison.findUnique({
    where: { id },
    include: {
      productA: {
        include: {
          type: { select: { name: true } },
          brand: { select: { name: true } },
          specValues: {
            include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } },
            orderBy: { field: { sortOrder: "asc" } },
          },
        },
      },
      productB: {
        include: {
          brand: { select: { name: true } },
          specValues: {
            include: { field: { select: { id: true, name: true, unit: true, sortOrder: true } } },
            orderBy: { field: { sortOrder: "asc" } },
          },
        },
      },
    },
  });

  if (!comparison) notFound();

  const userVote = session?.user
    ? await prisma.comparisonVote.findUnique({
        where: { comparisonId_userId: { comparisonId: id, userId: session.user.id } },
      })
    : null;

  const comments = await prisma.comparisonComment.findMany({
    where: { comparisonId: id },
    include: { author: { select: { id: true, nickname: true } } },
    orderBy: { createdAt: "asc" },
  });

  const { productA, productB, voteACount, voteBCount } = comparison;
  const total = voteACount + voteBCount;
  const pctA = total > 0 ? Math.round((voteACount / total) * 100) : 50;
  const pctB = 100 - pctA;

  // Build spec comparison rows from both products' spec values
  const specFieldIds = new Set<string>();
  const specMap: Record<string, { name: string; unit: string | null; sortOrder: number; a?: string; b?: string }> = {};

  for (const sv of productA.specValues) {
    specFieldIds.add(sv.field.id);
    specMap[sv.field.id] = { name: sv.field.name, unit: sv.field.unit, sortOrder: sv.field.sortOrder, a: sv.value };
  }
  for (const sv of productB.specValues) {
    if (specMap[sv.field.id]) {
      specMap[sv.field.id].b = sv.value;
    } else {
      specFieldIds.add(sv.field.id);
      specMap[sv.field.id] = { name: sv.field.name, unit: sv.field.unit, sortOrder: sv.field.sortOrder, b: sv.value };
    }
  }

  const specRows = Object.values(specMap).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-border text-center">
            <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">
              {productA.type.name}
            </span>
          </div>

          {/* 두 상품 이름 */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-6 border-b border-border">
            <div className="text-center">
              <p className="text-xs text-muted mb-1">{productA.brand.name}</p>
              <p className="text-base font-bold text-foreground">{productA.name}</p>
              {productA.price && (
                <p className="text-sm text-muted mt-0.5">{productA.price.toLocaleString()}원</p>
              )}
            </div>
            <span className="text-sm font-bold text-muted px-3">VS</span>
            <div className="text-center">
              <p className="text-xs text-muted mb-1">{productB.brand.name}</p>
              <p className="text-base font-bold text-foreground">{productB.name}</p>
              {productB.price && (
                <p className="text-sm text-muted mt-0.5">{productB.price.toLocaleString()}원</p>
              )}
            </div>
          </div>

          {/* 투표 현황 바 */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-blue-500 w-12 text-right">{pctA}%</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-400 rounded-l-full transition-all"
                  style={{ width: `${pctA}%` }}
                />
                <div
                  className="h-full bg-red-400 rounded-r-full transition-all"
                  style={{ width: `${pctB}%` }}
                />
              </div>
              <span className="text-sm font-bold text-red-500 w-12">{pctB}%</span>
            </div>
            <p className="text-xs text-muted text-center">총 {total}표</p>

            {/* 투표 버튼 */}
            <VoteButton
              comparisonId={comparison.id}
              userChoice={userVote?.choice ?? null}
              productAName={productA.name}
              productBName={productB.name}
            />
          </div>

          {/* 스펙 비교 테이블 */}
          {specRows.length > 0 && (
            <div className="p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">스펙 비교</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8fafc] text-xs font-semibold text-muted">
                    <tr>
                      <th className="px-3 py-2 text-left w-1/4">항목</th>
                      <th className="px-3 py-2 text-center w-[37.5%]">{productA.name}</th>
                      <th className="px-3 py-2 text-center w-[37.5%]">{productB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((row) => (
                      <tr key={row.name} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-2.5 text-muted font-medium">
                          {row.name}
                        </td>
                        <td className="px-3 py-2.5 text-center text-foreground">
                          {row.a ? `${row.a}${row.unit ? ` ${row.unit}` : ""}` : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-center text-foreground">
                          {row.b ? `${row.b}${row.unit ? ` ${row.unit}` : ""}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 댓글 */}
        <CompareComments
          comparisonId={comparison.id}
          comments={comments}
          currentUserId={session?.user?.id}
        />

        <div className="mt-4">
          <Link href="/compare" className="text-sm text-muted hover:text-primary transition-colors">
            ← 목록으로
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create VoteButton client component**

`app/compare/[id]/VoteButton.tsx`:
```tsx
"use client";

import { useTransition } from "react";
import { castVote } from "@/lib/actions/comparison";

export function VoteButton({
  comparisonId,
  userChoice,
  productAName,
  productBName,
}: {
  comparisonId: string;
  userChoice: "A" | "B" | null;
  productAName: string;
  productBName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={() => startTransition(() => castVote(comparisonId, "A"))}
        disabled={pending}
        className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
          userChoice === "A"
            ? "bg-blue-500 text-white"
            : "border border-blue-300 text-blue-500 hover:bg-blue-50"
        }`}
      >
        {productAName} 선택
      </button>
      <button
        onClick={() => startTransition(() => castVote(comparisonId, "B"))}
        disabled={pending}
        className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
          userChoice === "B"
            ? "bg-red-500 text-white"
            : "border border-red-300 text-red-500 hover:bg-red-50"
        }`}
      >
        {productBName} 선택
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create CompareComments client component**

`app/compare/[id]/CompareComments.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createComparisonComment, deleteComparisonComment } from "@/lib/actions/comparison";
import type { AdminFormState } from "@/lib/validations/product";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; nickname: string };
};

export function CompareComments({
  comparisonId,
  comments,
  currentUserId,
}: {
  comparisonId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  const boundAction = createComparisonComment.bind(null, comparisonId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    boundAction,
    undefined
  );

  return (
    <div className="mt-4 bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4]">
        <h2 className="text-sm font-semibold text-foreground">댓글 {comments.length}개</h2>
      </div>

      {currentUserId ? (
        <div className="px-6 py-4 border-b border-[#d4d4d4]">
          <form
            action={formAction}
            key={state?.message === "" ? "reset-" + Date.now() : "form"}
          >
            <textarea
              name="content"
              rows={2}
              placeholder="의견을 남겨주세요"
              className="w-full px-3 py-2 text-sm border border-[#d4d4d4] rounded-lg resize-none focus:outline-none focus:border-primary"
              required
            />
            {state?.errors?.content && (
              <p className="text-xs text-error mt-1">{state.errors.content[0]}</p>
            )}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={pending}
                className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {pending ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-[#d4d4d4] text-sm text-muted">
          <Link href="/login" className="text-primary hover:underline">로그인</Link>
          {" 후 댓글을 작성할 수 있습니다."}
        </div>
      )}

      {comments.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted">첫 번째 의견을 남겨보세요.</div>
      ) : (
        <div>
          {comments.map((c, i) => (
            <div
              key={c.id}
              className={`px-6 py-4 ${i < comments.length - 1 ? "border-b border-[#d4d4d4]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.author.nickname}</span>
                  <span className="text-xs text-muted">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {currentUserId === c.author.id && (
                  <form action={deleteComparisonComment.bind(null, c.id, comparisonId)}>
                    <button type="submit" className="text-xs text-error hover:opacity-75">삭제</button>
                  </form>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/compare/\[id\]/
git commit -m "feat: add comparison detail page with voting and comments"
```

---

## Task 12: Header Navigation Update

**Files:**
- Modify: `app/components/Header.tsx:24-36`

- [ ] **Step 1: Add comparison link to header navigation**

Update the navigation array in `Header.tsx` (line 24-28):

```tsx
{[
  { name: "홈", href: "/" },
  { name: "커뮤니티", href: "/community" },
  { name: "육아용품", href: "/products" },
  { name: "비교", href: "/compare" },
].map((item) => (
```

- [ ] **Step 2: Verify all navigation links work**

Visit http://localhost:3000. Click each nav link: 홈, 커뮤니티, 육아용품, 비교 — all should load without errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Header.tsx
git commit -m "feat: add comparison link to header navigation"
```

---

## Task 13: End-to-End Verification

- [ ] **Step 1: Run seed to populate data**

```bash
npm run seed
```

- [ ] **Step 2: Verify public product pages**

1. Visit http://localhost:3000/products — type tabs should show, product cards displayed
2. Click a product — detail with spec table shown
3. Post a comment (logged in)

- [ ] **Step 3: Verify comparison pages**

1. Visit http://localhost:3000/compare — seeded comparison should appear with vote bar
2. Click comparison — detail with side-by-side spec table, voting, comments
3. Vote for A or B — bar updates
4. Create new comparison at /compare/new — select type, pick two products, submit
5. Try creating duplicate comparison — should redirect to existing one

- [ ] **Step 4: Verify admin pages (logged in as ADMIN)**

1. Visit /admin/products — product list with edit/delete
2. /admin/products/types — add/remove types
3. /admin/products/brands — add/remove brands
4. /admin/products/spec-fields — add/remove spec fields
5. /admin/products/new — create a product with spec values
6. Edit a product — values pre-filled

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete product comparison feature"
```
