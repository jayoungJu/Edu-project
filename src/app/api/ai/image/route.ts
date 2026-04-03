import { NextRequest, NextResponse } from "next/server";
import { generateImageWithDALLE } from "@/lib/ai-providers";
import { generateImageWithNanoBanana } from "@/lib/ai-providers/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size, apiKey, provider } = body as {
      prompt: string;
      size?: "1024x1024" | "1792x1024" | "1024x1792";
      apiKey: string;
      provider?: "openai" | "gemini";
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt는 필수 항목입니다." }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: "이미지 생성에 API 키가 필요합니다." }, { status: 400 });
    }

    // Gemini Nano Banana 이미지 생성
    if (provider === "gemini") {
      // size → aspectRatio 매핑
      const aspectRatioMap: Record<string, "1:1" | "3:4" | "4:3" | "16:9" | "9:16"> = {
        "1024x1024": "1:1",
        "1792x1024": "16:9",
        "1024x1792": "9:16",
      };
      const aspectRatio = aspectRatioMap[size || "1024x1024"] || "1:1";
      const dataUrl = await generateImageWithNanoBanana(prompt, apiKey, aspectRatio);
      return NextResponse.json({ url: dataUrl });
    }

    // OpenAI DALL-E 3 (기본)
    const url = await generateImageWithDALLE(prompt, apiKey, size || "1024x1024");
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
