import { Message } from "@/types";

const HYPERCLOVA_API_URL =
  "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-003";

export async function chatWithHyperCLOVA(
  messages: Message[],
  apiKey: string,
  systemPrompt?: string
): Promise<string> {
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  if (systemPrompt) {
    formattedMessages.unshift({ role: "system", content: systemPrompt });
  }

  const response = await fetch(HYPERCLOVA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-NCP-CLOVASTUDIO-API-KEY": apiKey,
      "X-NCP-APIGW-API-KEY": apiKey,
    },
    body: JSON.stringify({
      messages: formattedMessages,
      topP: 0.8,
      topK: 0,
      maxTokens: 2048,
      temperature: 0.5,
      repeatPenalty: 1.1,
      stopBefore: [],
      includeAiFilters: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HyperCLOVA X API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.result?.message?.content || "";
}

export async function generatePromptWithHyperCLOVA(
  userInput: string,
  context: string,
  apiKey: string
): Promise<string> {
  const systemPrompt = `당신은 소상공인의 비즈니스를 돕는 AI 어시스턴트입니다.
사용자의 요청을 바탕으로 최적화된 AI 프롬프트를 생성해주세요.
명확하고 구체적이며, 실제 비즈니스에 활용 가능한 프롬프트를 작성해주세요.`;

  const messages: Message[] = [
    {
      id: "1",
      role: "user",
      content: `다음 용도로 사용할 최적의 프롬프트를 작성해주세요:\n용도: ${userInput}\n맥락: ${context}`,
      createdAt: new Date(),
    },
  ];

  return chatWithHyperCLOVA(messages, apiKey, systemPrompt);
}
