"use server";

import { prisma } from "@/lib/prisma";

export async function checkEmailDuplicate(email: string): Promise<boolean> {
  if (!email || email.length < 3) return false;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return !!user;
}

export async function checkNicknameDuplicate(nickname: string): Promise<boolean> {
  if (!nickname || nickname.length < 2) return false;
  const user = await prisma.user.findUnique({ where: { nickname }, select: { id: true } });
  return !!user;
}
