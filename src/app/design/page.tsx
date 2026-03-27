"use client";

import React, { useState } from "react";
import {
  Palette,
  Download,
  RefreshCw,
  Sparkles,
  Eye,
  Layers,
  Type,
  ImageIcon,
  Layout,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useSettingsStore } from "@/store/settings";

const designCategories = [
  {
    id: "poster",
    label: "홍보 포스터",
    icon: Layout,
    description: "이벤트 및 프로모션 포스터",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "banner",
    label: "SNS 배너",
    icon: ImageIcon,
    description: "인스타그램/페이스북 배너",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "business_card",
    label: "명함",
    icon: Layers,
    description: "디지털 명함 디자인",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "menu",
    label: "메뉴판",
    icon: Type,
    description: "카페/식당 메뉴판 디자인",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const colorPalettes = [
  { name: "바이올렛 모던", colors: ["#7C3AED", "#5B21B6", "#DDD6FE", "#F5F3FF"] },
  { name: "에메랄드 그린", colors: ["#059669", "#065F46", "#A7F3D0", "#ECFDF5"] },
  { name: "로즈 핑크", colors: ["#E11D48", "#BE123C", "#FECDD3", "#FFF1F2"] },
  { name: "앰버 오렌지", colors: ["#D97706", "#B45309", "#FDE68A", "#FFFBEB"] },
  { name: "스카이 블루", colors: ["#0284C7", "#075985", "#BAE6FD", "#F0F9FF"] },
  { name: "슬레이트 다크", colors: ["#334155", "#1E293B", "#CBD5E1", "#F8FAFC"] },
];

const fontPairings = [
  { title: "Noto Sans KR + Noto Serif KR", desc: "깔끔하고 가독성 높은 조합" },
  { title: "Spoqa Han Sans + 나눔명조", desc: "현대적이고 세련된 느낌" },
  { title: "Gmarket Sans + 나눔바른고딕", desc: "트렌디한 마케팅 스타일" },
  { title: "Pretendard + NanumSquare", desc: "모던 비즈니스 표준 조합" },
];

const layoutTemplates = [
  {
    id: "minimal",
    name: "미니멀",
    preview: "clean-white",
    description: "흰 배경, 간결한 타이포그래피",
  },
  {
    id: "bold",
    name: "볼드",
    preview: "dark-contrast",
    description: "강한 대비, 임팩트 있는 디자인",
  },
  {
    id: "warm",
    name: "따뜻한",
    preview: "warm-pastel",
    description: "파스텔 톤, 부드러운 느낌",
  },
  {
    id: "professional",
    name: "전문적",
    preview: "corporate-blue",
    description: "신뢰감 있는 비즈니스 스타일",
  },
];

export default function DesignPage() {
  const [selectedCategory, setSelectedCategory] = useState("poster");
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState("minimal");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generatedGuide, setGeneratedGuide] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { toasts, removeToast, success, error } = useToast();
  const { activeProvider, getActiveApiKey } = useSettingsStore();

  const handleGenerate = async () => {
    if (!businessName.trim()) {
      error("사업체명을 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setGeneratedGuide("");

    const palette = colorPalettes[selectedPalette];
    const font = fontPairings[selectedFont];
    const layout = layoutTemplates.find((l) => l.id === selectedLayout);
    const category = designCategories.find((c) => c.id === selectedCategory);

    try {
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category?.label,
          businessName,
          tagline,
          colorPalette: palette.name,
          colors: palette.colors,
          fontPairing: font.title,
          layoutStyle: layout?.name,
          additionalInfo,
          provider: activeProvider,
          apiKey: getActiveApiKey(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "디자인 가이드 생성에 실패했습니다.");
      }

      const data = await response.json();
      setGeneratedGuide(data.content);
      success("디자인 가이드가 생성되었습니다!");
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedGuide);
    setCopied(true);
    success("디자인 가이드가 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-4">
          {/* Category Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-violet-600" />
                디자인 유형
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {designCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCategory === cat.id
                        ? "border-violet-200 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${cat.bg} w-fit mb-2`}>
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">사업체 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="사업체명 *"
                placeholder="예: 행복한 카페"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <Input
                label="슬로건/태그라인"
                placeholder="예: 행복을 담은 한 잔"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
              <Textarea
                label="추가 정보"
                placeholder="이벤트 내용, 특별 요청사항 등을 입력하세요"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel */}
        <div className="space-y-4">
          {/* Color Palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">컬러 팔레트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {colorPalettes.map((palette, i) => (
                  <button
                    key={palette.name}
                    onClick={() => setSelectedPalette(i)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                      selectedPalette === i
                        ? "border-violet-200 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex gap-1">
                      {palette.colors.map((color, j) => (
                        <div
                          key={j}
                          className="w-5 h-5 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-700">{palette.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font Pairing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">폰트 조합</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fontPairings.map((font, i) => (
                  <button
                    key={font.title}
                    onClick={() => setSelectedFont(i)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedFont === i
                        ? "border-violet-200 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{font.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{font.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layout Style */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">레이아웃 스타일</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {layoutTemplates.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedLayout === layout.id
                        ? "border-violet-200 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{layout.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{layout.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview & Generate */}
        <div className="space-y-4">
          {/* Design Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-5 w-5 text-violet-600" />
                디자인 미리보기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative"
                style={{ backgroundColor: colorPalettes[selectedPalette].colors[3] }}
              >
                <div className="absolute inset-4 flex flex-col items-center justify-center text-center space-y-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: colorPalettes[selectedPalette].colors[0] }}
                  >
                    {designCategories.find((c) => c.id === selectedCategory)?.icon &&
                      React.createElement(
                        designCategories.find((c) => c.id === selectedCategory)!.icon,
                        { className: "h-8 w-8 text-white" }
                      )}
                  </div>
                  <div>
                    <p
                      className="text-xl font-bold"
                      style={{ color: colorPalettes[selectedPalette].colors[1] }}
                    >
                      {businessName || "사업체명"}
                    </p>
                    {tagline && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: colorPalettes[selectedPalette].colors[0] }}
                      >
                        {tagline}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {colorPalettes[selectedPalette].colors.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-500 text-center">
                실제 디자인은 AI 가이드 후 Canva, 미리캔버스 등에서 제작하세요
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            AI 디자인 가이드 생성
          </Button>

          {/* Generated Guide */}
          {generatedGuide && (
            <Card className="border-violet-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">AI 디자인 가이드</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleGenerate} loading={isGenerating}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {generatedGuide}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
