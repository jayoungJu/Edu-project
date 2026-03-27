"use client";

import React, { useState } from "react";
import {
  Settings,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Info,
  Sparkles,
  Shield,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useSettingsStore } from "@/store/settings";
import { AIProvider } from "@/types";
import { PROVIDER_LABELS } from "@/lib/utils";

const providers: Array<{
  id: AIProvider;
  label: string;
  description: string;
  features: string[];
  isDefault?: boolean;
  apiDocUrl: string;
  keyPlaceholder: string;
  icon: string;
}> = [
  {
    id: "hyperclova",
    label: "HyperCLOVA X",
    description: "네이버의 한국어 특화 AI 모델. 한국어 이해와 생성에 최적화되어 있습니다.",
    features: ["한국어 특화", "한국 문화 이해", "기본 제공 모델"],
    isDefault: true,
    apiDocUrl: "https://www.ncloud.com/product/aiService/clovaStudio",
    keyPlaceholder: "NCP-CLOVASTUDIO-API-KEY를 입력하세요",
    icon: "🇰🇷",
  },
  {
    id: "openai",
    label: "ChatGPT (OpenAI)",
    description: "GPT-4o, DALL-E 3 등 OpenAI의 최신 모델을 사용합니다. 이미지 생성 기능을 활용하려면 필수입니다.",
    features: ["GPT-4o 지원", "DALL-E 3 이미지 생성", "다국어 지원"],
    apiDocUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...로 시작하는 API 키를 입력하세요",
    icon: "🤖",
  },
  {
    id: "gemini",
    label: "Gemini (Google)",
    description: "Google의 Gemini 1.5 Pro 모델. 긴 문맥 처리와 멀티모달 기능이 뛰어납니다.",
    features: ["Gemini 1.5 Pro", "긴 컨텍스트 지원", "멀티모달"],
    apiDocUrl: "https://aistudio.google.com/app/apikey",
    keyPlaceholder: "AIza...로 시작하는 API 키를 입력하세요",
    icon: "💎",
  },
  {
    id: "claude",
    label: "Claude (Anthropic)",
    description: "Anthropic의 Claude 3.5 Haiku 모델. 안전하고 정확한 답변을 제공합니다.",
    features: ["Claude 3.5 Haiku", "높은 안전성", "정확한 분석"],
    apiDocUrl: "https://console.anthropic.com/",
    keyPlaceholder: "sk-ant-...로 시작하는 API 키를 입력하세요",
    icon: "✨",
  },
];

function ApiKeyInput({
  provider,
  value,
  onChange,
  isActive,
}: {
  provider: typeof providers[number];
  value: string;
  onChange: (key: string) => void;
  isActive: boolean;
}) {
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const hasKey = value.length > 0;

  const handleTest = async () => {
    if (!value) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id, apiKey: value }),
      });
      if (response.ok) {
        setTestResult("success");
      } else {
        setTestResult("error");
      }
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder={provider.keyPlaceholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        {hasKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            loading={isTesting}
            className="shrink-0 h-10"
          >
            연결 테스트
          </Button>
        )}
      </div>
      {testResult === "success" && (
        <div className="mt-1.5 flex items-center gap-1.5 text-emerald-600 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" />
          API 키가 유효합니다
        </div>
      )}
      {testResult === "error" && (
        <div className="mt-1.5 flex items-center gap-1.5 text-red-500 text-xs">
          <XCircle className="h-3.5 w-3.5" />
          API 키가 유효하지 않습니다. 다시 확인해주세요.
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { toasts, removeToast, success } = useToast();
  const {
    activeProvider,
    hyperclovaApiKey,
    openaiApiKey,
    geminiApiKey,
    claudeApiKey,
    setActiveProvider,
    setApiKey,
    resetSettings,
  } = useSettingsStore();

  const apiKeys: Record<AIProvider, string> = {
    hyperclova: hyperclovaApiKey,
    openai: openaiApiKey,
    gemini: geminiApiKey,
    claude: claudeApiKey,
  };

  const handleSave = () => {
    success("설정이 저장되었습니다!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="space-y-6">
        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">API 키 보안 안내</p>
            <p className="text-sm text-blue-700 mt-0.5">
              API 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다.
              서버로 전송 시에는 해당 AI 서비스 API 호출에만 사용됩니다.
              공유 컴퓨터에서는 사용 후 키를 삭제해주세요.
            </p>
          </div>
        </div>

        {/* Active Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              기본 AI 모델 선택
            </CardTitle>
            <CardDescription>
              채팅, 문서 생성 등에 기본으로 사용할 AI 모델을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setActiveProvider(provider.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    activeProvider === provider.id
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{provider.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {provider.isDefault && (
                        <Badge variant="success" className="text-xs">기본</Badge>
                      )}
                      {activeProvider === provider.id && (
                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{provider.label}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.features.slice(0, 2).map((f) => (
                      <span key={f} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-violet-600" />
              API 키 관리
            </CardTitle>
            <CardDescription>
              사용할 AI 서비스의 API 키를 입력하세요. 이미지 생성은 OpenAI API 키가 필수입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {providers.map((provider) => (
              <div key={provider.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{provider.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{provider.label}</p>
                      <p className="text-xs text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                  <a
                    href={provider.apiDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
                  >
                    API 키 발급
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ApiKeyInput
                  provider={provider}
                  value={apiKeys[provider.id]}
                  onChange={(key) => setApiKey(provider.id, key)}
                  isActive={activeProvider === provider.id}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-5 w-5 text-violet-600" />
              API 키 발급 가이드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "HyperCLOVA X",
                  steps: [
                    "NAVER Cloud Platform (ncloud.com) 가입",
                    "CLOVA Studio 서비스 신청",
                    "테스트 앱 생성 후 API 키 발급",
                    "무료 크레딧으로 시작 가능",
                  ],
                },
                {
                  title: "OpenAI (ChatGPT/DALL-E)",
                  steps: [
                    "platform.openai.com 가입",
                    "API Keys 메뉴에서 키 생성",
                    "결제 수단 등록 필요 (종량제)",
                    "GPT-4o-mini: $0.15/1M 토큰",
                  ],
                },
              ].map((guide) => (
                <div key={guide.title} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-2">{guide.title}</p>
                  <ol className="space-y-1">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-700 font-medium flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save/Reset */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-4 w-4" />
            설정 저장
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm("모든 설정을 초기화하시겠습니까?")) {
                resetSettings();
                success("설정이 초기화되었습니다.");
              }
            }}
          >
            초기화
          </Button>
        </div>
      </div>
    </div>
  );
}
