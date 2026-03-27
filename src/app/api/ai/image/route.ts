import { NextRequest, NextResponse } from "next/server";
import { generateImageWithDALLE } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size, apiKey } = body as {
      prompt: string;
      size?: "1024x1024" | "1792x1024" | "1024x1792";
      apiKey: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt는 필수 항목입니다." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "이미지 생성에는 OpenAI API 키가 필요합니다." },
        { status: 400 }
      );
    }

    const url = await generateImageWithDALLE(prompt, apiKey, size || "1024x1024");
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
