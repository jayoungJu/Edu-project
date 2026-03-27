"use client";

import React, { useState } from "react";
import {
  Wand2,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Tag,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useSettingsStore } from "@/store/settings";

const promptTemplates = [
  {
    id: "1",
    category: "마케팅",
    title: "SNS 홍보 게시물",
    description: "인스타그램/카카오 채널용 상품 홍보 문구",
    template: `다음 상품/서비스를 홍보하는 SNS 게시물을 작성해주세요.

상품명: {상품명}
주요 특징: {특징}
타겟 고객: {타겟}
할인/프로모션: {할인정보}

요구사항:
- 이모지를 적절히 활용해주세요
- 해시태그를 5개 이상 포함해주세요
- 행동 유도 문구(CTA)를 포함해주세요
- 300자 이내로 작성해주세요`,
    variables: ["상품명", "특징", "타겟", "할인정보"],
  },
  {
    id: "2",
    category: "고객응대",
    title: "고객 불만 응대 답변",
    description: "클레임 및 불만 고객 응대 메시지",
    template: `다음 상황에 대한 전문적인 고객 응대 답변을 작성해주세요.

불만 내용: {불만내용}
발생 원인: {원인}
해결 방안: {해결방안}

요구사항:
- 진심 어린 사과를 포함해주세요
- 구체적인 해결 방안을 제시해주세요
- 재발 방지 약속을 포함해주세요
- 정중하고 공감적인 톤으로 작성해주세요`,
    variables: ["불만내용", "원인", "해결방안"],
  },
  {
    id: "3",
    category: "문서작성",
    title: "사업계획서 개요",
    description: "소상공인 사업계획서 초안 작성",
    template: `다음 정보를 바탕으로 사업계획서 개요를 작성해주세요.

업종: {업종}
사업 아이디어: {아이디어}
목표 고객: {고객}
초기 투자금: {투자금}
예상 월 매출: {매출}

포함 항목:
1. 사업 개요
2. 시장 분석
3. 경쟁사 분석
4. 마케팅 전략
5. 재무 계획`,
    variables: ["업종", "아이디어", "고객", "투자금", "매출"],
  },
  {
    id: "4",
    category: "마케팅",
    title: "이벤트/프로모션 기획",
    description: "효과적인 판촉 이벤트 기획안",
    template: `다음 조건에 맞는 프로모션 이벤트를 기획해주세요.

업종: {업종}
이벤트 목적: {목적}
예산: {예산}
기간: {기간}
타겟 고객: {타겟}

포함 내용:
- 이벤트 콘셉트 및 주제
- 세부 프로그램 구성
- 홍보 방법
- 예산 배분 계획
- 기대 효과`,
    variables: ["업종", "목적", "예산", "기간", "타겟"],
  },
  {
    id: "5",
    category: "콘텐츠",
    title: "블로그/카페 포스팅",
    description: "검색 최적화된 블로그 글 작성",
    template: `다음 주제로 블로그 포스팅을 작성해주세요.

주제: {주제}
업종/분야: {업종}
핵심 키워드: {키워드}
글 목적: {목적}

작성 지침:
- SEO 최적화된 제목 3개 추천
- 서론, 본론, 결론 구성
- 소제목을 활용한 가독성 높은 구조
- 1000자 이상 작성
- 관련 핵심 키워드를 자연스럽게 포함`,
    variables: ["주제", "업종", "키워드", "목적"],
  },
  {
    id: "6",
    category: "고객응대",
    title: "FAQ 자동 생성",
    description: "업종별 자주 묻는 질문 답변 세트",
    template: `다음 업종의 FAQ 10개를 작성해주세요.

업종: {업종}
주요 서비스/상품: {서비스}
주요 고객층: {고객층}

FAQ 형식:
Q: 질문
A: 상세한 답변

고려 사항:
- 실제 고객이 자주 묻는 질문 위주
- 친절하고 명확한 답변
- 실용적인 정보 포함`,
    variables: ["업종", "서비스", "고객층"],
  },
];

const categories = ["전체", "마케팅", "고객응대", "문서작성", "콘텐츠"];

export default function PromptPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(promptTemplates[0]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"template" | "custom">("template");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");

  const { toasts, removeToast, success, error } = useToast();
  const { activeProvider, getActiveApiKey } = useSettingsStore();

  const filteredTemplates = promptTemplates.filter((t) => {
    const matchCategory = activeCategory === "전체" || t.category === activeCategory;
    const matchSearch = t.title.includes(searchQuery) || t.description.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const buildPromptFromTemplate = () => {
    let result = selectedTemplate.template;
    selectedTemplate.variables.forEach((v) => {
      result = result.replace(new RegExp(`{${v}}`, "g"), variables[v] || `[${v}]`);
    });
    return result;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const promptContent =
        activeTab === "template" ? buildPromptFromTemplate() : customPrompt;

      if (activeTab === "custom" && purpose.trim()) {
        const response = await fetch("/api/ai/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purpose,
            context,
            provider: activeProvider,
            apiKey: getActiveApiKey(),
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "프롬프트 생성에 실패했습니다.");
        }

        const data = await response.json();
        setGeneratedPrompt(data.content);
      } else {
        setGeneratedPrompt(promptContent);
      }
      success("프롬프트가 생성되었습니다!");
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    success("클립보드에 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Template Library */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-violet-600" />
                프롬프트 템플릿
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="템플릿 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setActiveTab("template");
                      setVariables({});
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedTemplate.id === template.id && activeTab === "template"
                        ? "border-violet-200 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="secondary">{template.category}</Badge>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="h-5 w-5 text-violet-600" />
                  프롬프트 편집기
                </CardTitle>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => setActiveTab("template")}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      activeTab === "template"
                        ? "bg-violet-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    템플릿
                  </button>
                  <button
                    onClick={() => setActiveTab("custom")}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      activeTab === "custom"
                        ? "bg-violet-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    AI 생성
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTab === "template" ? (
                <>
                  <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-violet-600" />
                      <span className="text-sm font-medium text-violet-700">
                        {selectedTemplate.title}
                      </span>
                    </div>
                    <p className="text-xs text-violet-600">{selectedTemplate.description}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">변수 입력</p>
                    {selectedTemplate.variables.map((variable) => (
                      <Input
                        key={variable}
                        label={variable}
                        placeholder={`${variable}을(를) 입력하세요`}
                        value={variables[variable] || ""}
                        onChange={(e) =>
                          setVariables((prev) => ({ ...prev, [variable]: e.target.value }))
                        }
                      />
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">프롬프트 미리보기</p>
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {buildPromptFromTemplate()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="활용 목적"
                    placeholder="예: 신메뉴 출시 인스타그램 홍보"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                  <Textarea
                    label="세부 맥락 (선택)"
                    placeholder="업종, 상품 특성, 타겟 고객 등 세부 정보를 입력하세요"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={4}
                  />
                  <Textarea
                    label="직접 프롬프트 작성"
                    placeholder="또는 직접 프롬프트를 작성하세요..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={5}
                  />
                </>
              )}

              <Button
                onClick={handleGenerate}
                loading={isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4" />
                {activeTab === "custom" && purpose ? "AI로 프롬프트 생성" : "프롬프트 적용"}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Result */}
          {generatedPrompt && (
            <Card className="border-violet-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-500" />
                    생성된 프롬프트
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerate}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      재생성
                    </Button>
                    <Button
                      variant={copied ? "success" : "secondary"}
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "복사됨" : "복사"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {generatedPrompt}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
