import { AIProvider, Message } from "@/types";
import { chatWithHyperCLOVA, getPlatformApiKey } from "./hyperclova";
import { chatWithOpenAI } from "./openai";
import { chatWithGemini } from "./gemini";
import { chatWithClaude } from "./claude";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  systemPrompt?: string;
}

export async function chat(
  messages: Message[],
  config: AIConfig
): Promise<string> {
  const { provider, systemPrompt } = config;
  let { apiKey } = config;

  // HyperCLOVA X: 사용자 키가 없으면 플랫폼 기본 키 사용
  if (provider === "hyperclova" && !apiKey) {
    apiKey = getPlatformApiKey();
  }

  if (!apiKey && provider !== "hyperclova") {
    throw new Error(`${provider} API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.`);
  }

  switch (provider) {
    case "hyperclova":
      return chatWithHyperCLOVA(messages, apiKey, systemPrompt);
    case "openai":
      return chatWithOpenAI(messages, apiKey, systemPrompt);
    case "gemini":
      return chatWithGemini(messages, apiKey, systemPrompt);
    case "claude":
      return chatWithClaude(messages, apiKey, systemPrompt);
    default:
      throw new Error(`지원하지 않는 AI 제공자: ${provider}`);
  }
}

export { chatWithHyperCLOVA, chatWithOpenAI, chatWithGemini, chatWithClaude };
export { generateImageWithDALLE } from "./openai";
