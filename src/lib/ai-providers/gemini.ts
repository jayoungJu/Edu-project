import { Message } from "@/types";

export async function chatWithGemini(
  messages: Message[],
  apiKey: string,
  systemPrompt?: string
): Promise<string> {
  // system 역할 메시지를 contents에서 분리 (Gemini는 contents에 system 역할 불가)
  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  // contents는 user/model 교대 순서여야 함
  const contents = chatMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // contents가 비어있으면 빈 user 메시지 추가
  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "안녕하세요" }] });
  }

  // systemInstruction: 코드에서 전달된 것 + 메시지 배열의 system 메시지 합산
  const combinedSystem = [
    systemPrompt,
    ...systemMessages.map((m) => m.content),
  ]
    .filter(Boolean)
    .join("\n");

  const body: Record<string, unknown> = { contents };

  if (combinedSystem) {
    body.systemInstruction = {
      parts: [{ text: combinedSystem }],
    };
  }

  // v1beta → v1 (gemini-3.0-pro는 안정 버전 엔드포인트 사용)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-3.0-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = (error as { error?: { message?: string } }).error?.message || response.statusText;
    throw new Error(`Gemini API 오류 (${response.status}): ${msg}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
