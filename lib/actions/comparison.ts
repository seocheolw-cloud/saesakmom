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

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status === "BANNED") return { message: "계정이 차단되었습니다." };

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

  // Check existing (both orderings)
  const existing = await prisma.productComparison.findFirst({
    where: {
      OR: [
        { productAId: aId, productBId: bId },
        { productAId: bId, productBId: aId },
      ],
    },
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
  if (choice !== "A" && choice !== "B") return;
  const session = await auth();
  if (!session?.user) return;

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status === "BANNED") return;

  try {
    await prisma.$transaction(async (tx) => {
      const comparison = await tx.productComparison.findUnique({ where: { id: comparisonId }, select: { id: true } });
      if (!comparison) return;

      const existing = await tx.comparisonVote.findUnique({
        where: { comparisonId_userId: { comparisonId, userId: session.user.id } },
      });

      if (existing) {
        if (existing.choice === choice) {
          await tx.comparisonVote.delete({ where: { id: existing.id } });
          await tx.productComparison.update({
            where: { id: comparisonId },
            data: choice === "A" ? { voteACount: { decrement: 1 } } : { voteBCount: { decrement: 1 } },
          });
        } else {
          await tx.comparisonVote.update({ where: { id: existing.id }, data: { choice } });
          await tx.productComparison.update({
            where: { id: comparisonId },
            data:
              choice === "A"
                ? { voteACount: { increment: 1 }, voteBCount: { decrement: 1 } }
                : { voteACount: { decrement: 1 }, voteBCount: { increment: 1 } },
          });
        }
      } else {
        await tx.comparisonVote.create({
          data: { comparisonId, userId: session.user.id, choice },
        });
        await tx.productComparison.update({
          where: { id: comparisonId },
          data: choice === "A" ? { voteACount: { increment: 1 } } : { voteBCount: { increment: 1 } },
        });
      }
    });
  } catch { return; }

  revalidatePath(`/compare/${comparisonId}`);
}

export async function createComparisonComment(
  comparisonId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user) return { message: "로그인이 필요합니다." };
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true, suspendedUntil: true } });
  if (!dbUser || dbUser.status === "BANNED") return { message: "계정이 차단되었습니다." };
  if (dbUser.status === "SUSPENDED") {
    if (dbUser.suspendedUntil && dbUser.suspendedUntil <= new Date()) {
      await prisma.user.update({ where: { id: session.user.id }, data: { status: "ACTIVE", suspendedUntil: null } });
    } else {
      const until = dbUser.suspendedUntil ? dbUser.suspendedUntil.toLocaleDateString("ko-KR") : "";
      return { message: `${until}까지 댓글 작성이 정지된 상태입니다.` };
    }
  }

  const parsed = ComparisonCommentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const parentId = formData.get("parentId") as string | null;

  await prisma.comparisonComment.create({
    data: { content: parsed.data.content, comparisonId, authorId: session.user.id, parentId: parentId || null },
  });

  revalidatePath(`/compare/${comparisonId}`);
  return { message: "" };
}

export async function editComparisonComment(commentId: string, comparisonId: string, content: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const comment = await prisma.comparisonComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return;
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 1000) return;
  await prisma.comparisonComment.update({ where: { id: commentId }, data: { content: trimmed, updatedAt: new Date() } });
  revalidatePath(`/compare/${comparisonId}`);
}

export async function deleteComparisonComment(
  commentId: string,
  comparisonId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } });
  if (!dbUser || dbUser.status === "BANNED") return;

  const comment = await prisma.comparisonComment.findUnique({ where: { id: commentId } });
  if (!comment || (comment.authorId !== session.user.id && session.user.role !== "ADMIN")) return;

  await prisma.comparisonComment.delete({ where: { id: commentId } });
  revalidatePath(`/compare/${comparisonId}`);
}
