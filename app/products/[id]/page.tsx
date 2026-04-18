import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";
import { ProductImage } from "../ProductImage";
import { ProductComments } from "./ProductComments";
import { BackButton } from "./BackButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const [product, comments] = await Promise.all([
    prisma.product.findUnique({
      where: { id, status: "PUBLISHED" },
      include: {
        type: { select: { name: true, slug: true } },
        brand: { select: { name: true } },
        specValues: {
          include: { field: { select: { name: true, unit: true, sortOrder: true } } },
          orderBy: { field: { sortOrder: "asc" } },
        },
      },
    }),
    prisma.productComment.findMany({
      where: { productId: id },
      include: { author: { select: { id: true, nickname: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!product) notFound();

  const topComments = comments.filter((c) => !c.parentId);
  const replyMap = new Map<string, typeof comments>();
  for (const c of comments) {
    if (c.parentId) {
      const arr = replyMap.get(c.parentId) || [];
      arr.push(c);
      replyMap.set(c.parentId, arr);
    }
  }
  const treeComments = topComments.map((c) => ({ ...c, replies: replyMap.get(c.id) || [] }));

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <div className="mb-4">
          <BackButton label={`${product.type.name} 목록`} />
        </div>

        <article className="bg-white rounded-2xl border border-[#d4d4d4] overflow-hidden shadow-sm">
          {/* 상품 이미지 + 기본 정보 */}
          <div className="md:flex">
            <div className="md:w-[360px] md:shrink-0 p-6 pb-0 md:pb-6">
              <ProductImage imageUrl={product.imageUrl} typeName={product.type.name} productName={product.name} size="lg" />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded-md">{product.type.name}</span>
                <span className="text-xs text-muted bg-gray-100 px-2 py-1 rounded-md">{product.brand.name}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">{product.name}</h1>
              {product.price ? (
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-foreground">{product.price.toLocaleString()}</span>
                  <span className="text-sm font-medium text-muted">원</span>
                </div>
              ) : (
                <p className="text-sm text-muted mb-4">가격 미정</p>
              )}
              {product.description && (
                <p className="text-sm text-[#5F6B7C] leading-relaxed">{product.description}</p>
              )}
            </div>
          </div>

          {/* 스펙 테이블 */}
          {product.specValues.length > 0 && (
            <div className="border-t border-border">
              <div className="px-6 py-4">
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  상세 스펙
                </h2>
                <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specValues.map((sv, i) => (
                        <tr key={sv.id} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                          <td className="py-3 px-4 text-muted font-medium w-2/5 border-r border-border">{sv.field.name}</td>
                          <td className="py-3 px-4 text-foreground font-medium">
                            {sv.value}
                            {sv.field.unit && <span className="text-muted ml-1">{sv.field.unit}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* 댓글 */}
        <ProductComments productId={product.id} comments={treeComments} currentUserId={session?.user?.id} />
      </main>
    </div>
  );
}
