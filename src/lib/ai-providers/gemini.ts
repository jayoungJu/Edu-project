import { Message } from "@/types";

// ─── Chat: gemini-3.1-pro-preview ────────────────────────────
export async function chatWithGemini(
  messages: Message[],
  apiKey: string,
  systemPrompt?: string
): Promise<string> {
  // system 역할은 contents에 포함 불가 → systemInstruction으로 분리
  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "안녕하세요" }] });
  }

  const combinedSystem = [systemPrompt, ...systemMessages.map((m) => m.content)]
    .filter(Boolean)
    .join("\n");

  const body: Record<string, unknown> = { contents };
  if (combinedSystem) {
    body.systemInstruction = { parts: [{ text: combinedSystem }] };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
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

// ─── Image: Nano Banana (gemini-3.1-flash-image-preview) ─────
export async function generateImageWithNanoBanana(
  prompt: string,
  apiKey: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16" = "1:1"
): Promise<string> {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: { aspectRatio },
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = (error as { error?: { message?: string } }).error?.message || response.statusText;
    throw new Error(`Nano Banana API 오류 (${response.status}): ${msg}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];

  // inlineData 파트에서 base64 이미지 추출
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Nano Banana: 이미지 데이터를 받지 못했습니다.");
}
