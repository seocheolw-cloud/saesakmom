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
