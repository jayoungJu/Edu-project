"use client";

import React, { useState } from "react";
import {
  Settings,
  Key,
  Eye,
  EyeOff,
  Check,
  Info,
  Sparkles,
  Shield,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Lock,
  Video,
  Clapperboard,
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
  isBuiltIn?: boolean;
  apiDocUrl: string;
  keyPlaceholder: string;
  icon: string;
}> = [
  {
    id: "hyperclova",
    label: "HyperCLOVA X",
    description: "네이버의 한국어 특화 AI 모델. 별도 API 키 없이 바로 사용 가능한 기본 내장 모델입니다.",
    features: ["한국어 특화", "한국 문화 이해", "기본 내장 모델 (API 키 불필요)"],
    isDefault: true,
    isBuiltIn: true,
    apiDocUrl: "https://namc-aigw.io.naver.com",
    keyPlaceholder: "개인 API 키 입력 (없으면 기본 키로 자동 동작)",
    icon: "🇰🇷",
  },
  {
    id: "openai",
    label: "ChatGPT (OpenAI)",
    description: "GPT-5.4 모델 사용. 이미지 생성(DALL-E 3) 기능을 활용하려면 필수입니다.",
    features: ["GPT-5.4", "DALL-E 3 이미지 생성", "다국어 지원"],
    apiDocUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...로 시작하는 API 키를 입력하세요",
    icon: "🤖",
  },
  {
    id: "gemini",
    label: "Gemini (Google)",
    description: "Google의 Gemini 3.1 Pro Preview 모델. 이미지 생성(Nano Banana) 및 Veo 3.1 영상 생성 지원.",
    features: ["Gemini 3.1 Pro", "Nano Banana 이미지", "Veo 3.1 영상"],
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
}: {
  provider: typeof providers[number];
  value: string;
  onChange: (key: string) => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const hasKey = value.length > 0;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id, apiKey: value }),
      });
      setTestResult(response.ok ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  };

  // HyperCLOVA X는 키 없이도 테스트 가능 (플랫폼 기본 키 사용)
  const canTest = provider.isBuiltIn || hasKey;

  return (
    <div>
      {provider.isBuiltIn && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">
            플랫폼 기본 키가 내장되어 있어 별도 입력 없이 사용 가능합니다
          </p>
        </div>
      )}
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
        {canTest && (
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
          연결 성공
        </div>
      )}
      {testResult === "error" && (
        <div className="mt-1.5 flex items-center gap-1.5 text-red-500 text-xs">
          <XCircle className="h-3.5 w-3.5" />
          연결 실패. API 키를 다시 확인해주세요.
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
        {/* 보안 안내 */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">API 키 보안 안내</p>
            <p className="text-sm text-blue-700 mt-0.5">
              사용자가 입력한 API 키는 브라우저 로컬 스토리지에 저장됩니다.
              HyperCLOVA X는 플랫폼에 기본 내장되어 별도 키 없이 사용 가능합니다.
            </p>
          </div>
        </div>

        {/* 기본 AI 모델 선택 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              기본 AI 모델 선택
            </CardTitle>
            <CardDescription>
              사용할 AI 모델을 선택하세요. 다른 모델의 API 키를 삭제하면 자동으로 HyperCLOVA X로 복귀합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => {
                const isActive = activeProvider === provider.id;
                const hasUserKey = apiKeys[provider.id].length > 0;
                const isAvailable = provider.isBuiltIn || hasUserKey;

                return (
                  <button
                    key={provider.id}
                    onClick={() => {
                      if (isAvailable) setActiveProvider(provider.id);
                    }}
                    disabled={!isAvailable}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? "border-violet-300 bg-violet-50"
                        : isAvailable
                        ? "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{provider.icon}</span>
                      <div className="flex items-center gap-1.5">
                        {provider.isBuiltIn && (
                          <Badge variant="success" className="text-xs">내장</Badge>
                        )}
                        {!provider.isBuiltIn && hasUserKey && (
                          <Badge variant="secondary" className="text-xs">키 설정됨</Badge>
                        )}
                        {!provider.isBuiltIn && !hasUserKey && (
                          <Badge variant="outline" className="text-xs text-gray-400">키 필요</Badge>
                        )}
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{provider.label}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {provider.features.slice(0, 2).map((f) => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* API 키 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-violet-600" />
              API 키 관리
            </CardTitle>
            <CardDescription>
              HyperCLOVA X는 플랫폼 기본 키로 동작합니다. 다른 AI 모델을 사용하려면 해당 API 키를 입력하세요.
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
                  {!provider.isBuiltIn && (
                    <a
                      href={provider.apiDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 shrink-0"
                    >
                      API 키 발급
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <ApiKeyInput
                  provider={provider}
                  value={apiKeys[provider.id]}
                  onChange={(key) => setApiKey(provider.id, key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 영상 생성 AI 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-violet-600" />
              AI 영상 스튜디오 — 지원 API
            </CardTitle>
            <CardDescription>
              영상 생성은 별도 API 키 없이 아래 기존 AI 키를 그대로 사용합니다.
              영상 스튜디오에서 원하는 제공자를 선택하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: "🤖",
                  name: "ChatGPT (OpenAI Sora)",
                  desc: "OpenAI API 키로 Sora 모델 영상 생성",
                  keyField: "openaiApiKey" as const,
                  docUrl: "https://platform.openai.com/api-keys",
                  docLabel: "OpenAI API 키 발급",
                },
                {
                  icon: "💎",
                  name: "Gemini (Google Veo 2)",
                  desc: "Gemini API 키로 Veo 2 모델 영상 생성",
                  keyField: "geminiApiKey" as const,
                  docUrl: "https://aistudio.google.com/app/apikey",
                  docLabel: "Gemini API 키 발급",
                },
              ].map((item) => {
                const hasKey = apiKeys[item.keyField === "openaiApiKey" ? "openai" : "gemini"].length > 0;
                return (
                  <div key={item.name} className="p-3 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      {hasKey ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />사용 가능
                        </span>
                      ) : (
                        <a
                          href={item.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 shrink-0"
                        >
                          {item.docLabel}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              위 API 키는 &quot;API 키 관리&quot; 섹션에서 입력하세요. 영상 스튜디오 페이지에서 제공자를 전환할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        {/* 모델 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-5 w-5 text-violet-600" />
              HyperCLOVA X 모델 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-600 font-medium">모델명</th>
                    <th className="text-left py-2 pr-4 text-gray-600 font-medium">컨텍스트</th>
                    <th className="text-left py-2 text-gray-600 font-medium">특징</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: "HyperCLOVAX-SEED-Text-Instruct-1.5B", ctx: "131,072", feat: "기본 모델 (기본값)" },
                    { name: "HyperCLOVAX-SEED-Think-14B", ctx: "131,072", feat: "추론 특화 (300 토큰)" },
                    { name: "Qwen2.5-VL-32B-Instruct", ctx: "128,000", feat: "비전 지원" },
                    { name: "Llama-4-Maverick-17B-128E", ctx: "131,072", feat: "멀티모달" },
                  ].map((m) => (
                    <tr key={m.name}>
                      <td className="py-2 pr-4 font-mono text-xs text-gray-800">{m.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{m.ctx}</td>
                      <td className="py-2 text-gray-600">{m.feat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Base URL: <code className="bg-gray-100 px-1 py-0.5 rounded">https://namc-aigw.io.naver.com</code>
              &nbsp;· OpenAI 호환 API
            </p>
          </CardContent>
        </Card>

        {/* 저장/초기화 */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-4 w-4" />
            설정 저장
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm("모든 설정을 초기화하시겠습니까?\nHyperCLOVA X로 복귀합니다.")) {
                resetSettings();
                success("설정이 초기화되었습니다. HyperCLOVA X로 복귀합니다.");
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
