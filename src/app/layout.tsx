import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "BizAI - 소상공인 AI 비즈니스 플랫폼",
  description:
    "소상공인을 위한 AI 비즈니스 플랫폼. 프롬프트 작성, 이미지 생성, 문서 자동화, 디자인 도구를 한 곳에서 활용하세요.",
  keywords: ["소상공인", "AI", "마케팅", "문서자동화", "이미지생성", "비즈니스"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
