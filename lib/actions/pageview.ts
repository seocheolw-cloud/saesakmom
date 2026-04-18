"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function trackPageView(path: string) {
  const session = await auth();
  await prisma.pageView.create({
    data: { path, userId: session?.user?.id || null },
  });
}
