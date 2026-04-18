"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin-login");
}

async function batchUpdate(id: string, status: "RESOLVED" | "DISMISSED") {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return;

  const where: Record<string, unknown> = { status: "PENDING" };
  if (report.postId) where.postId = report.postId;
  else if (report.commentId) where.commentId = report.commentId;
  else if (report.detail) where.detail = report.detail;
  else where.id = id;

  await prisma.report.updateMany({ where, data: { status, resolvedAt: new Date() } });
}

export async function resolveReport(id: string): Promise<void> {
  await requireAdmin();
  await batchUpdate(id, "RESOLVED");
  revalidatePath("/admin/reports");
}

export async function dismissReport(id: string): Promise<void> {
  await requireAdmin();
  await batchUpdate(id, "DISMISSED");
  revalidatePath("/admin/reports");
}

export async function deleteReport(id: string): Promise<void> {
  await requireAdmin();
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return;

  const where: Record<string, unknown> = {};
  if (report.postId) where.postId = report.postId;
  else if (report.commentId) where.commentId = report.commentId;
  else if (report.detail) where.detail = report.detail;
  else where.id = id;

  await prisma.report.deleteMany({ where });
  revalidatePath("/admin/reports");
}
