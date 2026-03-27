import { NextRequest, NextResponse } from "next/server";
import { AIProvider, Message } from "@/types";
import { chat } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey } = body as { provider: AIProvider; apiKey: string };

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "provider와 apiKey는 필수 항목입니다." },
        { status: 400 }
      );
    }

    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: "안녕하세요. API 연결 테스트입니다. '연결 성공'이라고만 답해주세요.",
        createdAt: new Date(),
      },
    ];

    await chat(messages, { provider, apiKey });
    return NextResponse.json({ success: true, message: "API 연결 성공" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "API 연결 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
