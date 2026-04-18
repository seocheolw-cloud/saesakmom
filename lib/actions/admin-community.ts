"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin-login");
}

export async function adminDeletePost(id: string): Promise<void> {
  await requireAdmin();
  await prisma.post.update({ where: { id }, data: { status: "DELETED" } });
  revalidatePath("/admin/community/posts");
  revalidatePath("/community");
}

export async function adminRestorePost(id: string): Promise<void> {
  await requireAdmin();
  await prisma.post.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath("/admin/community/posts");
  revalidatePath("/community");
}

export async function adminDeleteComment(id: string): Promise<void> {
  await requireAdmin();
  await prisma.comment.update({ where: { id }, data: { status: "DELETED" } });
  revalidatePath("/admin/community/comments");
  revalidatePath("/community");
}
