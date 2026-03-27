import { NextRequest, NextResponse } from "next/server";
import { AIProvider, Message } from "@/types";
import { chat } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purpose, context, provider, apiKey } = body as {
      purpose: string;
      context: string;
      provider: AIProvider;
      apiKey: string;
    };

    if (!purpose) {
      return NextResponse.json({ error: "purpose는 필수 항목입니다." }, { status: 400 });
    }

    const systemPrompt = `당신은 AI 프롬프트 작성 전문가입니다.
소상공인이 AI를 효과적으로 활용할 수 있도록 최적화된 프롬프트를 작성해주세요.

좋은 프롬프트의 조건:
1. 명확하고 구체적인 목표 제시
2. 필요한 맥락 정보 포함
3. 원하는 출력 형식 명시
4. 예시나 제약 조건 포함
5. 한국 소상공인 비즈니스에 적합

항상 한국어로 프롬프트를 작성하고, 바로 사용 가능한 완성된 프롬프트를 제공해주세요.`;

    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: `다음 용도에 맞는 최적화된 AI 프롬프트를 작성해주세요.

활용 목적: ${purpose}
${context ? `세부 맥락:\n${context}` : ""}

위 목적에 맞게 바로 사용할 수 있는 완성된 프롬프트를 작성해주세요.
프롬프트 외에 다른 설명은 최소화하고 프롬프트 본문에 집중해주세요.`,
        createdAt: new Date(),
      },
    ];

    const content = await chat(messages, { provider, apiKey: apiKey || "", systemPrompt });
    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
