"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wand2,
  ImageIcon,
  FileText,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Store,
} from "lucide-react";
import { useSettingsStore } from "@/store/settings";
import { ProviderBadge } from "@/components/ui/provider-badge";

const navItems = [
  {
    href: "/",
    label: "대시보드",
    icon: LayoutDashboard,
    description: "전체 현황",
  },
  {
    href: "/chat",
    label: "AI 채팅",
    icon: MessageSquare,
    description: "AI와 대화",
  },
  {
    href: "/prompt",
    label: "프롬프트 도구",
    icon: Wand2,
    description: "프롬프트 작성",
  },
  {
    href: "/image",
    label: "이미지 생성",
    icon: ImageIcon,
    description: "AI 이미지 생성",
  },
  {
    href: "/document",
    label: "문서 자동화",
    icon: FileText,
    description: "문서 자동 생성",
  },
  {
    href: "/design",
    label: "디자인 도구",
    icon: Palette,
    description: "디자인 템플릿",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const mounted = useMounted();
  const { activeProvider } = useSettingsStore();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">BizAI</span>
              <span className="text-xs text-gray-400 block leading-none">소상공인 AI 플랫폼</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Active Provider */}
      {!collapsed && mounted && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-1.5">현재 AI 모델</p>
          <ProviderBadge provider={activeProvider} />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 border border-violet-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-violet-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.label}</span>
                    {!isActive && (
                      <span className="text-xs text-gray-400 truncate block">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
                {isActive && !collapsed && (
                  <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-gray-100">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
            pathname === "/settings"
              ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 border border-violet-100"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
          title={collapsed ? "설정" : undefined}
        >
          <Settings
            className={cn(
              "h-5 w-5 shrink-0",
              pathname === "/settings" ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600"
            )}
          />
          {!collapsed && <span>설정 & API 키</span>}
        </Link>
      </div>
    </aside>
  );
}
