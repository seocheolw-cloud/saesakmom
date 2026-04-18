import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
const VIDEO_EXTS = ["mp4", "webm", "mov"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "products";

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "JPG, PNG, WebP, GIF, MP4, WebM, MOV만 업로드 가능합니다." }, { status: 400 });
  }

  const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: `파일 크기는 ${isVideo ? "50MB" : "5MB"} 이하만 가능합니다.` }, { status: 400 });
  }

  const safeFolders = ["products", "posts"];
  const safeFolder = safeFolders.includes(folder) ? folder : "posts";

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allExts = [...IMAGE_EXTS, ...VIDEO_EXTS];
  const safeExt = allExts.includes(ext) ? ext : (isVideo ? "mp4" : "jpg");
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const dirPath = path.join(process.cwd(), "public", "uploads", safeFolder);

  await mkdir(dirPath, { recursive: true });

  const filePath = path.join(dirPath, fileName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const url = `/uploads/${safeFolder}/${fileName}`;
  const type = isVideo ? "video" : "image";
  return NextResponse.json({ url, type });
}
