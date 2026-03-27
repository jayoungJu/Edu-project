"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ChevronRight,
  FileEdit,
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
import { DocumentType } from "@/types";

const documentTypes = [
  {
    type: "business_plan" as DocumentType,
    label: "사업계획서",
    description: "투자자 및 대출용 사업계획서",
    icon: "📋",
    fields: [
      { key: "businessName", label: "사업체명", placeholder: "예: 행복한 카페" },
      { key: "industry", label: "업종", placeholder: "예: 카페/음료" },
      { key: "concept", label: "사업 컨셉", placeholder: "예: 건강한 디저트 전문 카페" },
      { key: "target", label: "목표 고객", placeholder: "예: 20-40대 건강 관심 직장인" },
      { key: "location", label: "위치", placeholder: "예: 서울 강남구 역삼동" },
      { key: "investment", label: "초기 투자금", placeholder: "예: 5000만원" },
      { key: "monthlyRevenue", label: "예상 월 매출", placeholder: "예: 1500만원" },
    ],
  },
  {
    type: "proposal" as DocumentType,
    label: "제안서",
    description: "비즈니스 협업/입점 제안서",
    icon: "📝",
    fields: [
      { key: "proposerName", label: "제안자/회사명", placeholder: "예: 홍길동 / (주)우리회사" },
      { key: "proposalTitle", label: "제안 제목", placeholder: "예: O2O 마케팅 플랫폼 협업 제안" },
      { key: "target", label: "제안 대상", placeholder: "예: 소상공인 협회" },
      { key: "purpose", label: "제안 목적", placeholder: "예: 공동 마케팅 및 판로 개척" },
      { key: "details", label: "제안 내용 핵심", placeholder: "핵심 내용을 간략히 입력하세요" },
      { key: "benefit", label: "기대 효과", placeholder: "예: 매출 30% 증가, 고객 유입 확대" },
    ],
  },
  {
    type: "marketing" as DocumentType,
    label: "마케팅 문구",
    description: "홍보 카피라이팅 및 광고 문구",
    icon: "📣",
    fields: [
      { key: "productName", label: "상품/서비스명", placeholder: "예: 수제 딸기 케이크" },
      { key: "features", label: "주요 특징", placeholder: "예: 100% 국산 딸기, 무방부제, 당일 제조" },
      { key: "target", label: "타겟 고객", placeholder: "예: 특별한 날을 기념하는 2030 여성" },
      { key: "platform", label: "사용 채널", placeholder: "예: 인스타그램, 카카오채널" },
      { key: "tone", label: "톤앤매너", placeholder: "예: 따뜻하고 감성적인" },
    ],
  },
  {
    type: "email" as DocumentType,
    label: "이메일/문자",
    description: "고객 안내 이메일 및 문자 메시지",
    icon: "✉️",
    fields: [
      { key: "purpose", label: "발송 목적", placeholder: "예: 신규 오픈 안내, 이벤트 공지" },
      { key: "recipient", label: "수신자", placeholder: "예: 기존 고객, VIP 회원" },
      { key: "content", label: "핵심 내용", placeholder: "전달하고 싶은 핵심 메시지" },
      { key: "callToAction", label: "행동 유도", placeholder: "예: 방문 예약, 쿠폰 사용" },
    ],
  },
  {
    type: "contract" as DocumentType,
    label: "계약서 초안",
    description: "간이 거래 계약서 템플릿",
    icon: "📄",
    fields: [
      { key: "contractType", label: "계약 유형", placeholder: "예: 물품 공급 계약, 위탁 판매 계약" },
      { key: "partyA", label: "갑 (고용주/발주처)", placeholder: "예: 홍길동 / 사업자번호: 123-45-67890" },
      { key: "partyB", label: "을 (수급인/수주처)", placeholder: "예: 김철수 / 사업자번호: 098-76-54321" },
      { key: "scope", label: "계약 범위", placeholder: "예: 식자재 주 3회 공급" },
      { key: "amount", label: "계약 금액", placeholder: "예: 월 300만원" },
      { key: "period", label: "계약 기간", placeholder: "예: 2024.01.01 ~ 2024.12.31" },
    ],
  },
  {
    type: "sns_post" as DocumentType,
    label: "SNS 게시물",
    description: "인스타그램, 블로그 포스팅",
    icon: "📱",
    fields: [
      { key: "platform", label: "플랫폼", placeholder: "예: 인스타그램, 네이버 블로그" },
      { key: "topic", label: "게시물 주제", placeholder: "예: 신메뉴 소개, 이벤트 안내" },
      { key: "product", label: "소개 상품/서비스", placeholder: "예: 딸기 라떼, 여름 한정 메뉴" },
      { key: "mood", label: "분위기", placeholder: "예: 밝고 경쾌한, 고급스러운" },
      { key: "extras", label: "추가 요청", placeholder: "예: 해시태그 포함, 이모지 다수 사용" },
    ],
  },
  {
    type: "report" as DocumentType,
    label: "실적 보고서",
    description: "월간/분기 사업 성과 보고서",
    icon: "📊",
    fields: [
      { key: "period", label: "보고 기간", placeholder: "예: 2024년 1분기 (1월~3월)" },
      { key: "businessName", label: "사업체명", placeholder: "예: 행복한 카페" },
      { key: "revenue", label: "매출 실적", placeholder: "예: 목표 1500만원, 달성 1700만원" },
      { key: "achievements", label: "주요 성과", placeholder: "예: 단골 고객 20% 증가, 신메뉴 히트" },
      { key: "challenges", label: "개선 과제", placeholder: "예: 인건비 절감, 식재료 원가 관리" },
    ],
  },
  {
    type: "announcement" as DocumentType,
    label: "공지사항",
    description: "휴업, 이전, 이벤트 공지",
    icon: "📢",
    fields: [
      { key: "type", label: "공지 유형", placeholder: "예: 임시 휴업, 매장 이전, 영업시간 변경" },
      { key: "businessName", label: "사업체명", placeholder: "예: 행복한 카페" },
      { key: "date", label: "적용 일자", placeholder: "예: 2024년 1월 15일부터" },
      { key: "reason", label: "사유", placeholder: "예: 매장 리모델링" },
      { key: "details", label: "상세 내용", placeholder: "고객에게 안내할 구체적인 내용" },
    ],
  },
];

export default function DocumentPage() {
  const [selectedType, setSelectedType] = useState(documentTypes[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState("formal");

  const { toasts, removeToast, success, error } = useToast();
  const { activeProvider, getActiveApiKey } = useSettingsStore();

  const handleGenerate = async () => {
    const fieldsText = selectedType.fields
      .map((f) => `${f.label}: ${formData[f.key] || "미입력"}`)
      .join("\n");

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedType.type,
          documentLabel: selectedType.label,
          fields: fieldsText,
          tone,
          provider: activeProvider,
          apiKey: getActiveApiKey(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "문서 생성에 실패했습니다.");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      success(`${selectedType.label}이(가) 생성되었습니다!`);
    } catch (err) {
      error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    success("문서가 클립보드에 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType.label}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    success("문서가 다운로드되었습니다!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Document Types */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-violet-600" />
                문서 유형 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.type}
                    onClick={() => {
                      setSelectedType(doc);
                      setFormData({});
                      setGeneratedContent("");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedType.type === doc.type
                        ? "border-violet-200 bg-violet-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{doc.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{doc.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form & Result */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileEdit className="h-5 w-5 text-violet-600" />
                {selectedType.icon} {selectedType.label} 정보 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedType.fields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              ))}

              <Select
                label="문서 톤앤매너"
                value={tone}
                onChange={setTone}
                options={[
                  { value: "formal", label: "공식적/격식체" },
                  { value: "friendly", label: "친근한/구어체" },
                  { value: "professional", label: "전문적/비즈니스" },
                  { value: "casual", label: "캐주얼/일상적" },
                ]}
              />

              <Button
                onClick={handleGenerate}
                loading={isGenerating}
                className="w-full"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                {selectedType.label} 자동 생성
              </Button>
            </CardContent>
          </Card>

          {/* Generated Document */}
          {generatedContent && (
            <Card className="border-emerald-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Check className="h-5 w-5 text-emerald-500" />
                    생성된 {selectedType.label}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerate}
                      loading={isGenerating}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      재생성
                    </Button>
                    <Button
                      variant="secondary"
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
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />
                      저장
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto font-mono">
                  {generatedContent}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
