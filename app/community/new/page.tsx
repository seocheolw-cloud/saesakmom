import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
import { PostForm } from "./PostForm";

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">글쓰기</h1>
        <PostForm categories={categories} />
      </main>
    </div>
  );
}
