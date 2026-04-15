import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { CompareForm } from "./CompareForm";

export default async function NewComparePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const types = await prisma.productType.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        select: { id: true, name: true, brand: { select: { name: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[600px] mx-auto px-4 py-8">
        <h1 className="text-lg font-bold text-foreground mb-4">비교 만들기</h1>
        <CompareForm types={types} />
      </main>
    </div>
  );
}
