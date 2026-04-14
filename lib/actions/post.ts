"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostSchema, type PostFormState } from "@/lib/validations/post";

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = PostSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
      authorId: session.user.id,
    },
  });

  redirect(`/community/${post.id}`);
}

export async function updatePost(
  postId: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== session.user.id) {
    return { message: "수정 권한이 없습니다" };
  }

  const parsed = PostSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
    },
  });

  redirect(`/community/${postId}`);
}

export async function deletePost(postId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== session.user.id) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "DELETED" },
  });

  redirect("/community");
}
