"use client";

import React, { useState, useRef } from "react";
import {
  Video,
  Image,
  Wand2,
  User,
  Upload,
  Sparkles,
  Download,
  RefreshCw,
  Play,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useSettingsStore } from "@/store/settings";
import { cn } from "@/lib/utils";
import { VideoMode, VideoProvider } from "@/types";

// ─── 탭 메뉴 ───────────────────────────────────────────────
const tabs: { id: VideoMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: "text-to-video", label: "텍스트 → 영상", icon: Wand2, description: "문장으로 영상 생성" },
  { id: "image-to-video", label: "이미지 → 영상", icon: Image, description: "사진을 영상으로 변환" },
  { id: "video-effects", label: "AI 영상 효과", icon: Sparkles, description: "트렌드 효과 적용" },
  { id: "ai-avatar", label: "AI 아바타", icon: User, description: "AI 인물 영상 생성" },
];

// ─── AI 효과 목록 ───────────────────────────────────────────
const videoEffects = [
  { id: "ghibli", emoji: "🌿", name: "지브리 스타일", category: "스타일", description: "미야자키 하야오 애니메이션 감성" },
  { id: "cinematic", emoji: "🎬", name: "시네마틱", category: "스타일", description: "영화 같은 고품질 영상 효과" },
  { id: "vintage", emoji: "📽️", name: "빈티지 필름", category: "스타일", description: "복고풍 필름 느낌" },
  { id: "anime", emoji: "⛩️", name: "애니메이션", category: "스타일", description: "일본 애니 스타일" },
  { id: "watercolor", emoji: "🎨", name: "수채화", category: "스타일", description: "부드러운 수채화 변환" },
  { id: "3d", emoji: "🌐", name: "3D 렌더링", category: "스타일", description: "입체적인 3D 영상" },
  { id: "zoom_in", emoji: "🔍", name: "줌인 효과", category: "모션", description: "서서히 확대되는 드라마틱 효과" },
  { id: "pan", emoji: "↔️", name: "패닝 효과", category: "모션", description: "좌우 이동 카메라 효과" },
  { id: "slow_motion", emoji: "⏱️", name: "슬로우모션", category: "모션", description: "부드러운 슬로우모션 연출" },
  { id: "dance", emoji: "💃", name: "AI 댄스", category: "인물", description: "인물 댄스 영상 생성" },
  { id: "talking", emoji: "🗣️", name: "말하는 인물", category: "인물", description: "텍스트를 말하는 AI 인물" },
  { id: "product_360", emoji: "🔄", name: "상품 360°", category: "비즈니스", description: "상품을 360도 회전 영상으로" },
  { id: "store_tour", emoji: "🏪", name: "매장 투어", category: "비즈니스", description: "매장 소개 영상 자동 생성" },
  { id: "promo", emoji: "📣", name: "홍보 영상", category: "비즈니스", description: "소상공인 홍보 영상 템플릿" },
];

const effectCategories = ["전체", "스타일", "모션", "인물", "비즈니스"];

const durationOptions = [
  { value: "5", label: "5초" },
  { value: "10", label: "10초" },
];

const ratioOptions = [
  { value: "16:9", label: "16:9 (가로형 유튜브)" },
  { value: "9:16", label: "9:16 (세로형 릴스/틱톡)" },
  { value: "1:1", label: "1:1 (정사각형 인스타)" },
];

// ─── 메인 컴포넌트 ───────────────────────────────────────────
export default function VideoPage() {
  const [activeTab, setActiveTab] = useState<VideoMode>("text-to-video");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5");
  const [ratio, setRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [effectCategory, setEffectCategory] = useState("전체");
  const [pollingCount, setPollingCount] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { toasts, removeToast, success, error, info } = useToast();
  const { videoProvider, openaiApiKey, geminiApiKey, setVideoProvider } = useSettingsStore();

  const activeVideoApiKey = videoProvider === "gemini" ? geminiApiKey : openaiApiKey;
  const hasVideoKey = activeVideoApiKey.length > 0;

  const videoProviderOptions: { id: VideoProvider; label: string; icon: string; desc: string }[] = [
    { id: "openai", label: "ChatGPT (Sora)", icon: "🤖", desc: "OpenAI API 키 사용" },
    { id: "gemini", label: "Gemini (Veo 2)", icon: "💎", desc: "Google Gemini API 키 사용" },
  ];

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { error("이미지 크기는 10MB 이하여야 합니다."); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // 영상 생성 요청
  const handleGenerate = async () => {
    if (!hasVideoKey) {
      const providerLabel = videoProvider === "gemini" ? "Gemini" : "OpenAI";
      error(`${providerLabel} API 키가 필요합니다. 설정 페이지에서 API 키를 입력해주세요.`);
      return;
    }

    const finalPrompt =
      activeTab === "video-effects" && selectedEffect
        ? `${videoEffects.find((e) => e.id === selectedEffect)?.name}: ${prompt || videoEffects.find((e) => e.id === selectedEffect)?.description}`
        : prompt;

    if (!finalPrompt.trim() && activeTab !== "video-effects") {
      error("영상 설명을 입력해주세요.");
      return;
    }
    if (activeTab === "image-to-video" && !imageFile && !imagePreview) {
      error("이미지를 업로드해주세요.");
      return;
    }
    if (activeTab === "video-effects" && !selectedEffect) {
      error("적용할 효과를 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setJobId(null);
    setPollingCount(0);

    try {
      const body: Record<string, unknown> = {
        mode: activeTab,
        prompt: finalPrompt,
        duration: parseInt(duration),
        ratio,
        apiKey: activeVideoApiKey,
        provider: videoProvider,
      };
      if (imagePreview) body.imageUrl = imagePreview;

      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "영상 생성 요청에 실패했습니다.");
      }

      const data = await res.json();
      setJobId(data.id);
      info("영상 생성이 시작되었습니다. 완료까지 약 1~3분 소요됩니다.");

      // 폴링
      pollJobStatus(data.id);
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsGenerating(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    const maxPolls = 60; // 최대 5분
    let count = 0;

    const poll = async () => {
      if (count >= maxPolls) {
        error("영상 생성 시간이 초과되었습니다. 다시 시도해주세요.");
        setIsGenerating(false);
        return;
      }
      try {
        const res = await fetch(`/api/video/status?id=${encodeURIComponent(id)}&apiKey=${encodeURIComponent(activeVideoApiKey)}&provider=${videoProvider}`);
        const data = await res.json();
        count++;
        setPollingCount(count);

        if (data.status === "SUCCEEDED") {
          setVideoUrl(data.output?.[0] || null);
          success("영상이 생성되었습니다!");
          setIsGenerating(false);
        } else if (data.status === "FAILED") {
          error("영상 생성에 실패했습니다. 프롬프트를 수정하고 다시 시도해주세요.");
          setIsGenerating(false);
        } else {
          setTimeout(poll, 5000);
        }
      } catch {
        setTimeout(poll, 5000);
      }
    };
    setTimeout(poll, 5000);
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `bizai-video-${Date.now()}.mp4`;
    a.target = "_blank";
    a.click();
    success("영상이 다운로드됩니다!");
  };

  const filteredEffects = videoEffects.filter(
    (e) => effectCategory === "전체" || e.category === effectCategory
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* 영상 AI 제공자 선택 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm font-medium text-gray-700 shrink-0">영상 생성 AI</p>
            <div className="flex gap-2 flex-1">
              {videoProviderOptions.map((opt) => {
                const hasKey = opt.id === "gemini" ? geminiApiKey.length > 0 : openaiApiKey.length > 0;
                const isActive = videoProvider === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setVideoProvider(opt.id)}
                    className={cn(
                      "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-left",
                      isActive
                        ? "border-violet-300 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    )}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                    {hasKey ? (
                      <span className="ml-auto text-xs text-emerald-600 font-medium shrink-0">키 설정됨</span>
                    ) : (
                      <span className="ml-auto text-xs text-amber-500 font-medium shrink-0">키 없음</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API 키 없음 경고 */}
      {!hasVideoKey && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {videoProvider === "gemini" ? "Gemini" : "OpenAI"} API 키가 필요합니다
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              <a href="/settings" className="underline font-medium">설정 페이지</a>에서{" "}
              {videoProvider === "gemini" ? "Gemini API 키 (Google AI Studio)" : "OpenAI API 키 (ChatGPT)"} 를 입력하세요.
            </p>
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setVideoUrl(null); setPrompt(""); setSelectedEffect(null); }}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              activeTab === tab.id
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-gray-100 bg-white hover:border-gray-200 text-gray-600"
            )}
          >
            <div className={cn("p-2 rounded-lg", activeTab === tab.id ? "bg-violet-100" : "bg-gray-50")}>
              <tab.icon className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{tab.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{tab.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 왼쪽: 입력 패널 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-5 w-5 text-violet-600" />
                {tabs.find((t) => t.id === activeTab)?.label} 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* 텍스트 → 영상 */}
              {activeTab === "text-to-video" && (
                <>
                  <Textarea
                    label="영상 설명"
                    placeholder="예: 한국 전통 시장의 활기찬 아침, 각종 채소와 과일들이 가득한 좌판, 따뜻한 햇살, 영화 같은 느낌"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 space-y-1.5">
                    <p className="text-xs font-medium text-violet-700">💡 좋은 프롬프트 팁</p>
                    {["장소/배경을 구체적으로 설명하세요", "조명, 색감, 분위기를 포함하세요", "카메라 움직임을 명시하면 더 좋아요"].map((t, i) => (
                      <p key={i} className="text-xs text-violet-600">• {t}</p>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="영상 길이" value={duration} onChange={setDuration} options={durationOptions} />
                    <Select label="화면 비율" value={ratio} onChange={setRatio} options={ratioOptions} />
                  </div>
                </>
              )}

              {/* 이미지 → 영상 */}
              {activeTab === "image-to-video" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">이미지 업로드 *</p>
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                        imagePreview ? "border-violet-200 bg-violet-50" : "border-gray-200 hover:border-violet-200 hover:bg-gray-50"
                      )}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG (최대 10MB)</p>
                        </>
                      )}
                    </div>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                  <Textarea
                    label="영상 설명 (선택)"
                    placeholder="예: 천천히 줌인되며 상품을 강조, 부드러운 조명 효과"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="영상 길이" value={duration} onChange={setDuration} options={durationOptions} />
                    <Select label="화면 비율" value={ratio} onChange={setRatio} options={ratioOptions} />
                  </div>
                </>
              )}

              {/* AI 영상 효과 */}
              {activeTab === "video-effects" && (
                <>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
                      imagePreview ? "border-violet-200 bg-violet-50" : "border-gray-200 hover:border-violet-200"
                    )}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="max-h-32 mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">이미지/영상 업로드 (선택)</p>
                      </>
                    )}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                  <Input
                    label="추가 설명 (선택)"
                    placeholder="추가로 원하는 내용을 입력하세요"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <Select label="화면 비율" value={ratio} onChange={setRatio} options={ratioOptions} />
                </>
              )}

              {/* AI 아바타 */}
              {activeTab === "ai-avatar" && (
                <>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                      imagePreview ? "border-violet-200 bg-violet-50" : "border-gray-200 hover:border-violet-200"
                    )}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">얼굴 사진 업로드</p>
                        <p className="text-xs text-gray-400 mt-1">정면 사진 권장</p>
                      </>
                    )}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Textarea
                    label="아바타 동작/대사 설명"
                    placeholder="예: 카메라를 바라보며 미소 짓고 고개를 끄덕이는 비즈니스 아바타"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="영상 길이" value={duration} onChange={setDuration} options={durationOptions} />
                    <Select label="화면 비율" value={ratio} onChange={setRatio} options={ratioOptions} />
                  </div>
                </>
              )}

              <Button
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={!hasVideoKey || isGenerating}
                className="w-full"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                {isGenerating ? `생성 중... (${pollingCount * 5}초 경과)` : "영상 생성하기"}
              </Button>

              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                  <Clock className="h-3.5 w-3.5" />
                  영상 생성은 보통 1~3분 소요됩니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 빠른 프롬프트 */}
          {(activeTab === "text-to-video") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">소상공인 추천 영상 아이디어</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "활기찬 한국 카페 인테리어, 커피 내리는 장면, 따뜻한 조명, 시네마틱",
                  "신선한 식재료로 가득한 음식점 주방, 셰프가 요리하는 모습, 역동적",
                  "소상공인 의류 매장 봄 신상품 쇼케이스, 밝고 트렌디한 느낌",
                  "한국 전통 베이커리 빵 굽는 장면, 맛있는 빵들, 따뜻한 색감",
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="w-full text-left p-2.5 rounded-lg bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-100 text-xs text-gray-600 hover:text-violet-700 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽: 효과 선택 or 미리보기 */}
        <div className="lg:col-span-3 space-y-4">

          {/* AI 효과 탭일 때 효과 목록 표시 */}
          {activeTab === "video-effects" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  AI 영상 효과 선택
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {effectCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEffectCategory(cat)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                        effectCategory === cat ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredEffects.map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => setSelectedEffect(effect.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        selectedEffect === effect.id
                          ? "border-violet-300 bg-violet-50"
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      )}
                    >
                      <div className="text-2xl mb-1.5">{effect.emoji}</div>
                      <p className="text-sm font-semibold text-gray-900">{effect.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{effect.description}</p>
                      <Badge variant="secondary" className="mt-1.5 text-xs">{effect.category}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 영상 미리보기 */}
          <Card className={activeTab === "video-effects" ? "" : "h-full"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Play className="h-5 w-5 text-violet-600" />
                  생성된 영상
                </CardTitle>
                {videoUrl && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleGenerate} loading={isGenerating}>
                      <RefreshCw className="h-3.5 w-3.5" />재생성
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />다운로드
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center",
                ratio === "9:16" ? "aspect-[9/16] max-w-xs mx-auto" : ratio === "1:1" ? "aspect-square max-w-sm mx-auto" : "aspect-video w-full"
              )}>
                {isGenerating ? (
                  <div className="text-center text-white">
                    <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-violet-400" />
                    <p className="font-medium">AI가 영상을 생성하고 있습니다</p>
                    <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요...</p>
                    {jobId && <p className="text-xs text-gray-500 mt-2">Job ID: {jobId.slice(0, 8)}...</p>}
                  </div>
                ) : videoUrl ? (
                  <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-gray-500">
                    <Video className="h-16 w-16 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">생성된 영상이 여기에 표시됩니다</p>
                    <p className="text-xs text-gray-400 mt-1">왼쪽에서 설정 후 생성 버튼을 누르세요</p>
                  </div>
                )}
              </div>

              {videoUrl && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">사용된 프롬프트</p>
                  <p className="text-xs text-gray-600">{prompt}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
