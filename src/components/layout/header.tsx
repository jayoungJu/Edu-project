"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle } from "lucide-react";
import { useSettingsStore } from "@/store/settings";
import { PROVIDER_LABELS } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "대시보드", description: "비즈니스 AI 도구 전체 현황" },
  "/chat": { title: "AI 채팅", description: "AI와 자유롭게 대화하세요" },
  "/prompt": { title: "프롬프트 도구", description: "효과적인 프롬프트를 작성하고 관리하세요" },
  "/video": { title: "AI 영상 스튜디오", description: "텍스트·이미지로 AI 영상을 생성하세요" },
  "/document": { title: "문서 자동화", description: "비즈니스 문서를 자동으로 생성하세요" },
  "/settings": { title: "설정", description: "AI 모델과 API 키를 관리하세요" },
};

export function Header() {
  const pathname = usePathname();
  const mounted = useMounted();
  const { activeProvider } = useSettingsStore();
  const pageInfo = pageTitles[pathname] || { title: "BizAI", description: "" };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 h-16 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{pageInfo.title}</h1>
        <p className="text-xs text-gray-400">{pageInfo.description}</p>
      </div>
      <div className="flex items-center gap-3">
        {mounted && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{PROVIDER_LABELS[activeProvider]} 사용 중</span>
          </div>
        )}
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
          <Bell className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
          B
        </div>
      </div>
    </header>
  );
}
