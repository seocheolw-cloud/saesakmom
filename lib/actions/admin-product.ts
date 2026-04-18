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

function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || `type-${Date.now()}`;
}

export async function createProductType(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name || name.length === 0) return { errors: { name: ["종류명을 입력하세요"] } };
  if (name.length > 30) return { errors: { name: ["30자 이내로 입력하세요"] } };
  const slug = generateSlug(name);

  try {
    await prisma.productType.create({ data: { name, slug } });
  } catch {
    return { message: "이미 존재하는 종류입니다." };
  }
  revalidatePath("/admin/products");
  return { message: "" };
}

export async function reorderProductTypes(typeIds: string[]): Promise<void> {
  await requireAdmin();
  await prisma.$transaction(
    typeIds.map((id, i) => prisma.productType.update({ where: { id }, data: { sortOrder: i } }))
  );
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/compare");
}

type SpecInput = { id?: string; name: string; unit: string | null };

export async function batchSaveTypeConfig(
  typeOrder: string[],
  specsByType: Record<string, SpecInput[]>
): Promise<{ message?: string; success?: boolean }> {
  await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      // 1. 종류 순서 업데이트
      for (let i = 0; i < typeOrder.length; i++) {
        await tx.productType.update({ where: { id: typeOrder[i] }, data: { sortOrder: i } });
      }

      // 2. 각 종류별 스펙 동기화
      for (const [typeId, specs] of Object.entries(specsByType)) {
        const existingFields = await tx.productSpecField.findMany({ where: { typeId } });
        const existingIds = new Set(existingFields.map((f) => f.id));
        const newIds = new Set(specs.filter((s) => s.id).map((s) => s.id!));

        // 삭제: 기존에 있었는데 새 목록에 없는 것
        const toDelete = existingFields.filter((f) => !newIds.has(f.id));
        for (const f of toDelete) {
          await tx.productSpecValue.deleteMany({ where: { fieldId: f.id } });
          await tx.productSpecField.delete({ where: { id: f.id } });
        }

        // 추가/수정 + 순서
        for (let i = 0; i < specs.length; i++) {
          const spec = specs[i];
          if (spec.id && existingIds.has(spec.id)) {
            await tx.productSpecField.update({
              where: { id: spec.id },
              data: { name: spec.name, unit: spec.unit, sortOrder: i },
            });
          } else {
            await tx.productSpecField.create({
              data: { name: spec.name, unit: spec.unit, sortOrder: i, typeId },
            });
          }
        }
      }
    });
  } catch {
    return { message: "저장에 실패했습니다." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/compare");
  return { success: true };
}

export async function deleteProductType(id: string): Promise<void> {
  await requireAdmin();
  const hasProducts = await prisma.product.count({ where: { typeId: id } });
  if (hasProducts > 0) return;
  try {
    await prisma.productType.delete({ where: { id } });
  } catch { return; }
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
  const hasProducts = await prisma.product.count({ where: { brandId: id } });
  if (hasProducts > 0) return;
  try {
    await prisma.productBrand.delete({ where: { id } });
  } catch { return; }
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

export async function updateProductSpecField(
  id: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim() || null;
  if (!name) return { errors: { name: ["항목명을 입력하세요"] } };
  try {
    await prisma.productSpecField.update({ where: { id }, data: { name, unit } });
  } catch {
    return { message: "이미 존재하는 항목명입니다." };
  }
  revalidatePath("/admin/products");
  return { message: "" };
}

export async function reorderSpecFields(typeId: string, fieldIds: string[]): Promise<void> {
  await requireAdmin();
  await prisma.$transaction(
    fieldIds.map((id, i) => prisma.productSpecField.update({ where: { id }, data: { sortOrder: i } }))
  );
  revalidatePath("/admin/products");
}

export async function deleteProductSpecField(id: string): Promise<void> {
  await requireAdmin();
  try {
    await prisma.productSpecField.delete({ where: { id } });
  } catch { return; }
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

  const brand = await prisma.productBrand.findUnique({ where: { id: parsed.data.brandId }, select: { typeId: true } });
  if (!brand || brand.typeId !== parsed.data.typeId) return { message: "브랜드가 해당 종류에 속하지 않습니다." };

  const specFields = await prisma.productSpecField.findMany({
    where: { typeId: parsed.data.typeId },
  });
  const specData: { value: string; fieldId: string }[] = [];
  for (const field of specFields) {
    const value = formData.get(`spec_${field.id}`) as string;
    if (value?.trim()) {
      specData.push({ value: value.trim(), fieldId: field.id });
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          price: parsed.data.price,
          imageUrl: parsed.data.imageUrl || null,
          typeId: parsed.data.typeId,
          brandId: parsed.data.brandId,
        },
      });
      if (specData.length > 0) {
        await tx.productSpecValue.createMany({
          data: specData.map((s) => ({ ...s, productId: product.id })),
        });
      }
    });
  } catch {
    return { message: "상품 등록에 실패했습니다." };
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

  const brand = await prisma.productBrand.findUnique({ where: { id: parsed.data.brandId }, select: { typeId: true } });
  if (!brand || brand.typeId !== parsed.data.typeId) return { message: "브랜드가 해당 종류에 속하지 않습니다." };

  const specFields = await prisma.productSpecField.findMany({
    where: { typeId: parsed.data.typeId },
  });
  const specData: { value: string; fieldId: string }[] = [];
  for (const field of specFields) {
    const value = formData.get(`spec_${field.id}`) as string;
    if (value?.trim()) {
      specData.push({ value: value.trim(), fieldId: field.id });
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const status = formData.get("status") as string;
      await tx.product.update({
        where: { id: productId },
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          price: parsed.data.price,
          imageUrl: parsed.data.imageUrl || null,
          typeId: parsed.data.typeId,
          brandId: parsed.data.brandId,
          ...(status === "PUBLISHED" || status === "DRAFT" ? { status } : {}),
        },
      });
      await tx.productSpecValue.deleteMany({ where: { productId } });
      if (specData.length > 0) {
        await tx.productSpecValue.createMany({
          data: specData.map((s) => ({ ...s, productId })),
        });
      }
    });
  } catch {
    return { message: "상품 수정에 실패했습니다." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect("/admin/products");
}

export async function toggleProductStatus(id: string): Promise<void> {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id }, select: { status: true } });
  if (!product) return;
  const newStatus = product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.product.update({ where: { id }, data: { status: newStatus } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id } });
  } catch { return; }
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
