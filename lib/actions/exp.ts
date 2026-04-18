import { prisma } from "@/lib/prisma";
import { getLevelFromExp } from "@/lib/level";

export async function addExp(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { exp: { increment: amount } },
    select: { exp: true },
  });

  const newLevel = getLevelFromExp(user.exp);

  await prisma.user.updateMany({
    where: { id: userId, level: { not: newLevel } },
    data: { level: newLevel },
  });
}
