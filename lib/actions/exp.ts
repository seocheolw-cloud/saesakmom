"use server";

import { prisma } from "@/lib/prisma";
import { getLevelFromExp } from "@/lib/level";

export async function addExp(userId: string, amount: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { exp: true },
  });
  if (!user) return;

  const newExp = user.exp + amount;
  const newLevel = getLevelFromExp(newExp);

  await prisma.user.update({
    where: { id: userId },
    data: { exp: newExp, level: newLevel },
  });
}
