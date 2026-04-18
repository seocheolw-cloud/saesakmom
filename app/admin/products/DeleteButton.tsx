"use client";

import { deleteProduct } from "@/lib/actions/admin-product";

export function DeleteProductButton({ productId }: { productId: string }) {
  return (
    <form
      action={deleteProduct.bind(null, productId)}
      onSubmit={(e) => { if (!confirm("정말 삭제하시겠습니까?")) e.preventDefault(); }}
    >
      <button type="submit" className="h-8 px-3 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors inline-flex items-center justify-center whitespace-nowrap">
        삭제
      </button>
    </form>
  );
}
