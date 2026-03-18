import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "投研协作平台",
  description: "Research Collaboration Copilot Platform - 面向基金公司研究所的智能投研协作平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
