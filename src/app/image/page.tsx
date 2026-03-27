"use client";

import React, { useState } from "react";
import {
  ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useSettingsStore } from "@/store/settings";

const stylePresets = [
  { value: "realistic", label: "사실적 사진 스타일" },
  { value: "illustration", label: "일러스트레이션" },
  { value: "minimal", label: "미니멀 디자인" },
  { value: "watercolor", label: "수채화 느낌" },
  { value: "3d", label: "3D 렌더링" },
  { value: "vintage", label: "빈티지 감성" },
];

const sizeOptions = [
  { value: "1024x1024", label: "정사각형 (1024×1024)" },
  { value: "1792x1024", label: "가로형 (1792×1024)" },
  { value: "1024x1792", label: "세로형 (1024×1792)" },
];

const quickPrompts = [
  {
    category: "상품",
    prompts: [
      "깔끔한 흰색 배경에 한국 카페 디저트 제품, 프리미엄 상업 사진, 부드러운 조명",
      "트렌디한 한국 의류 상품 사진, 미니멀 배경, 자연광",
      "신선한 식품 재료들의 아름다운 구성, 상업 사진 스타일",
    ],
  },
  {
    category: "마케팅",
    prompts: [
      "한국 소상공인 카페 개업 홍보 포스터, 따뜻한 색감, 현대적 디자인",
      "봄 시즌 세일 배너, 화사한 꽃 모티브, 밝고 경쾌한 느낌",
      "음식점 신메뉴 출시 소셜미디어 포스트 이미지, 식욕을 돋우는 색상",
    ],
  },
  {
    category: "로고/브랜드",
    prompts: [
      "미니멀하고 현대적인 카페 로고, 원두커피와 식물 모티브, 차분한 그린 계열",
      "귀엽고 친근한 분식집 마스코트 캐릭터 로고",
      "세련된 뷰티샵 로고, 골드와 화이트 색상, 럭셔리 감성",
    ],
  },
];

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [size, setSize] = useState("1024x1024");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState("상품");

  const { toasts, removeToast, success, error } = useToast();
  const { activeProvider, openaiApiKey } = useSettingsStore();

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const { getActiveApiKey } = useSettingsStore.getState();
      const response = await fetch("/api/ai/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider: activeProvider,
          apiKey: getActiveApiKey(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "프롬프트 향상에 실패했습니다.");
      }

      const data = await response.json();
      setEnhancedPrompt(data.content);
      success("프롬프트가 향상되었습니다!");
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim()) {
      error("이미지 설명을 입력해주세요.");
      return;
    }

    if (!openaiApiKey) {
      error("이미지 생성은 OpenAI API 키가 필요합니다. 설정에서 API 키를 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const stylePrompts: Record<string, string> = {
        realistic: ", photorealistic, high quality photography",
        illustration: ", digital illustration, artistic",
        minimal: ", minimal design, clean, simple",
        watercolor: ", watercolor painting style, soft colors",
        "3d": ", 3D render, CGI, high quality",
        vintage: ", vintage style, retro, nostalgic",
      };

      const fullPrompt = finalPrompt + (stylePrompts[style] || "");

      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          size,
          apiKey: openaiApiKey,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "이미지 생성에 실패했습니다.");
      }

      const data = await response.json();
      setGeneratedImageUrl(data.url);
      success("이미지가 생성되었습니다!");
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bizai-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      success("이미지가 다운로드되었습니다!");
    } catch {
      error("다운로드에 실패했습니다.");
    }
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(enhancedPrompt || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {!openaiApiKey && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">OpenAI API 키가 필요합니다</p>
            <p className="text-sm text-amber-700 mt-0.5">
              이미지 생성(DALL-E 3)을 사용하려면 OpenAI API 키가 필요합니다.{" "}
              <a href="/settings" className="underline font-medium">설정 페이지</a>에서 API 키를 입력해주세요.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-5 w-5 text-violet-600" />
                이미지 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="이미지 설명 (한국어로 입력 가능)"
                placeholder="만들고 싶은 이미지를 설명해주세요.
예: 따뜻한 분위기의 한국 카페 실내 인테리어, 나무 테이블과 화분이 있는 아늑한 공간"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhancePrompt}
                loading={isEnhancing}
                disabled={!prompt.trim()}
                className="w-full"
              >
                <Sparkles className="h-4 w-4" />
                AI로 프롬프트 향상하기
              </Button>

              {enhancedPrompt && (
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 text-sm text-violet-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-xs text-violet-600">향상된 프롬프트</span>
                    <button onClick={handleCopyPrompt} className="text-violet-400 hover:text-violet-600">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed">{enhancedPrompt}</p>
                </div>
              )}

              <Select
                label="이미지 스타일"
                value={style}
                onChange={setStyle}
                options={stylePresets}
              />

              <Select
                label="이미지 크기"
                value={size}
                onChange={setSize}
                options={sizeOptions}
              />

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  이미지 생성은 DALL-E 3를 사용합니다. OpenAI API 키가 필요하며, 생성 비용이 발생할 수 있습니다.
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                loading={isGenerating}
                className="w-full"
                size="lg"
                disabled={!prompt.trim() || !openaiApiKey}
              >
                <ImageIcon className="h-5 w-5" />
                이미지 생성하기
              </Button>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">빠른 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1.5 mb-3">
                {quickPrompts.map((q) => (
                  <button
                    key={q.category}
                    onClick={() => setActiveQuickTab(q.category)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeQuickTab === q.category
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {q.category}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {quickPrompts
                  .find((q) => q.category === activeQuickTab)
                  ?.prompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(p)}
                      className="w-full text-left p-2.5 rounded-lg bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-100 text-xs text-gray-600 hover:text-violet-700 transition-all"
                    >
                      {p}
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-5 w-5 text-violet-600" />
                  생성된 이미지
                </CardTitle>
                {generatedImageUrl && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleGenerate} loading={isGenerating}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      재생성
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />
                      다운로드
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Sparkles className="h-8 w-8 text-violet-500" />
                    </div>
                    <p className="text-gray-600 font-medium">이미지 생성 중...</p>
                    <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요 (10~30초)</p>
                  </div>
                ) : generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="AI 생성 이미지"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">이미지가 여기에 표시됩니다</p>
                    <p className="text-sm text-gray-400 mt-1">
                      왼쪽에서 이미지를 설명하고 생성 버튼을 눌러주세요
                    </p>
                  </div>
                )}
              </div>

              {generatedImageUrl && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">사용된 프롬프트</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {enhancedPrompt || prompt}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
