import { NextRequest, NextResponse } from "next/server";
import { AIProvider, Message } from "@/types";
import { chat } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, provider, apiKey, systemPrompt } = body as {
      messages: Array<{ role: string; content: string }>;
      provider: AIProvider;
      apiKey: string;
      systemPrompt?: string;
    };

    if (!messages || !provider) {
      return NextResponse.json(
        { error: "messages와 provider는 필수 항목입니다." },
        { status: 400 }
      );
    }

    const formattedMessages: Message[] = messages.map((m, i) => ({
      id: String(i),
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      createdAt: new Date(),
    }));

    const content = await chat(formattedMessages, {
      provider,
      apiKey: apiKey || "",
      systemPrompt: systemPrompt || "당신은 소상공인의 비즈니스를 돕는 친절하고 유능한 AI 어시스턴트입니다. 한국어로 답변해주세요.",
    });

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
