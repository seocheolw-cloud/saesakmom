import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      category: { select: { id: true } },
    },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== session.user.id) {
    redirect("/community");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">글 수정</h1>
        <EditPostForm
          postId={post.id}
          categories={categories}
          defaultValues={{
            categoryId: post.categoryId,
            title: post.title,
            content: post.content,
          }}
        />
      </main>
    </div>
  );
}
