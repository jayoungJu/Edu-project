"use client";

import React from "react";
import Link from "next/link";
import {
  Wand2,
  ImageIcon,
  FileText,
  Palette,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Star,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings";
import { PROVIDER_LABELS } from "@/lib/utils";

const features = [
  {
    href: "/chat",
    title: "AI 채팅",
    description: "AI와 자유롭게 대화하며 비즈니스 아이디어와 전략을 논의하세요",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    badge: "인기",
  },
  {
    href: "/prompt",
    title: "프롬프트 도구",
    description: "업종별 최적화된 프롬프트 템플릿으로 AI를 더 효과적으로 활용하세요",
    icon: Wand2,
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    badge: "추천",
  },
  {
    href: "/image",
    title: "이미지 생성",
    description: "상품 홍보물, SNS 이미지, 로고 등을 AI로 빠르게 생성하세요",
    icon: ImageIcon,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
    badge: null,
  },
  {
    href: "/document",
    title: "문서 자동화",
    description: "사업계획서, 제안서, 계약서, 마케팅 문구를 자동으로 작성하세요",
    icon: FileText,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: null,
  },
  {
    href: "/design",
    title: "디자인 도구",
    description: "전문 디자이너 없이도 수준 높은 비즈니스 디자인을 완성하세요",
    icon: Palette,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    badge: "신규",
  },
];

const stats = [
  { label: "AI 도구", value: "5가지", icon: Zap, color: "text-violet-600" },
  { label: "프롬프트 템플릿", value: "50+", icon: Star, color: "text-amber-500" },
  { label: "문서 유형", value: "8가지", icon: FileText, color: "text-emerald-600" },
  { label: "지원 AI 모델", value: "4개", icon: Users, color: "text-blue-600" },
];

const recentActivities = [
  { icon: Wand2, text: "마케팅 프롬프트 생성", time: "방금 전", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: FileText, text: "사업계획서 초안 작성", time: "5분 전", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: ImageIcon, text: "상품 홍보 이미지 생성", time: "12분 전", color: "text-pink-600", bg: "bg-pink-50" },
];

export default function DashboardPage() {
  const { activeProvider } = useSettingsStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-violet-200 text-sm font-medium mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {PROVIDER_LABELS[activeProvider]} 연결됨
          </div>
          <h2 className="text-3xl font-bold mb-2">
            안녕하세요! BizAI에 오신 것을 환영합니다 👋
          </h2>
          <p className="text-violet-100 text-lg mb-6">
            소상공인의 비즈니스 효율화를 위한 AI 플랫폼입니다.
            <br />
            프롬프트 작성부터 이미지 생성, 문서 자동화까지 한 곳에서!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/prompt">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50 border-0"
              >
                <Wand2 className="h-5 w-5" />
                프롬프트 시작하기
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
              >
                <MessageSquare className="h-5 w-5" />
                AI와 대화하기
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 top-20 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-50">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI 비즈니스 도구</h3>
          <span className="text-sm text-gray-400">5개 도구 이용 가능</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="h-full hover:border-violet-200 transition-all duration-200 group-hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${feature.bg}`}>
                      <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {feature.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                          {feature.badge}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 transition-colors" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1.5">{feature.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Tips & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Tips */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-violet-600" />
              <h3 className="font-semibold text-gray-900">비즈니스 활용 팁</h3>
            </div>
            <div className="space-y-3">
              {[
                { tip: "SNS 마케팅 문구 자동 생성", desc: "프롬프트 도구를 활용해 인스타그램, 카카오 채널 문구를 작성하세요" },
                { tip: "상품 소개 이미지 제작", desc: "DALL-E로 전문적인 상품 홍보 이미지를 5초 만에 만드세요" },
                { tip: "고객 응대 문서 자동화", desc: "FAQ, 이용약관, 주문 확인서를 자동으로 생성하세요" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.tip}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-violet-600" />
              <h3 className="font-semibold text-gray-900">최근 활동</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-2 rounded-lg ${activity.bg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {activity.text}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center justify-center gap-1">
              전체 보기 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
