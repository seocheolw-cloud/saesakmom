import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageTracker } from "@/app/components/PageTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "새싹맘 — 육아 커뮤니티 & 용품 비교",
  description: "초보맘을 위한 육아 커뮤니티와 육아용품 비교 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><PageTracker />{children}</body>
    </html>
  );
}
