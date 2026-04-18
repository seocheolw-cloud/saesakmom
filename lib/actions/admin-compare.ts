"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin-login");
}

export async function deleteComparison(id: string): Promise<void> {
  await requireAdmin();
  try {
    await prisma.productComparison.delete({ where: { id } });
  } catch { return; }
  revalidatePath("/admin/compare");
  revalidatePath("/compare");
  redirect("/admin/compare");
}

export async function deleteComparisonCommentAdmin(commentId: string, comparisonId: string): Promise<void> {
  await requireAdmin();
  try {
    await prisma.comparisonComment.delete({ where: { id: commentId } });
  } catch { return; }
  revalidatePath(`/admin/compare/${comparisonId}`);
  revalidatePath("/admin/compare/comments");
  revalidatePath(`/compare/${comparisonId}`);
}
