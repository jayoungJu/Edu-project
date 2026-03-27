import { Message } from "@/types";

export async function chatWithClaude(
  messages: Message[],
  apiKey: string,
  systemPrompt?: string,
  model = "claude-3-5-haiku-20241022"
): Promise<string> {
  const formattedMessages = messages.map((msg) => ({
    role: msg.role === "system" ? "user" : msg.role,
    content: msg.content,
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemPrompt || "당신은 소상공인의 비즈니스를 돕는 유용한 AI 어시스턴트입니다.",
      messages: formattedMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Claude API 오류: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}
