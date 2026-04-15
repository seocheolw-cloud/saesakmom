import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/app/components/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { name: "상품 관리", href: "/admin/products" },
    { name: "종류 관리", href: "/admin/products/types" },
    { name: "브랜드 관리", href: "/admin/products/brands" },
    { name: "스펙 항목", href: "/admin/products/spec-fields" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-foreground mb-4">관리자</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="h-8 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center bg-white text-[#5F6B7C] border border-[#d4d4d4] hover:border-[#94969b] transition-all"
            >
              {item.name}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
