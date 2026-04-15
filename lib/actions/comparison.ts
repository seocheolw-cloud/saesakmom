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
