import { Message } from "@/types";

// HyperCLOVA X Open Models - OpenAI 호환 API
const HYPERCLOVA_BASE_URL = "https://namc-aigw.io.naver.com/v1";
export const HYPERCLOVA_DEFAULT_MODEL = "HyperCLOVAX-SEED-Text-Instruct-1.5B";

// 플랫폼 기본 API 키 (서버 환경변수에서 로드)
export function getPlatformApiKey(): string {
  return process.env.HYPERCLOVA_API_KEY || "";
}

export async function chatWithHyperCLOVA(
  messages: Message[],
  apiKey: string,
  systemPrompt?: string,
  model: string = HYPERCLOVA_DEFAULT_MODEL
): Promise<string> {
  // 사용자 키가 없으면 플랫폼 기본 키 사용
  const key = apiKey || getPlatformApiKey();

  if (!key) {
    throw new Error(
      "HyperCLOVA X API 키가 설정되지 않았습니다. 관리자에게 문의하거나 설정에서 API 키를 입력해주세요."
    );
  }

  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  if (systemPrompt) {
    formattedMessages.unshift({ role: "system", content: systemPrompt });
  }

  const response = await fetch(`${HYPERCLOVA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.8,
      frequency_penalty: 0,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(
      `HyperCLOVA X API 오류: ${response.status} - ${error.error?.message || error.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
