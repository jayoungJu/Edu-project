import { NextRequest, NextResponse } from "next/server";
import { AIProvider, Message } from "@/types";
import { chat } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, provider, apiKey } = body as {
      prompt: string;
      provider: AIProvider;
      apiKey: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt는 필수 항목입니다." }, { status: 400 });
    }

    const systemPrompt = `당신은 이미지 생성 AI (DALL-E 3) 전문가입니다.
사용자의 한국어 이미지 설명을 DALL-E 3에 최적화된 영어 프롬프트로 변환해주세요.

변환 규칙:
1. 자세하고 구체적인 시각적 설명 추가
2. 조명, 구도, 스타일 정보 포함
3. 한국 비즈니스/문화적 맥락 반영
4. 상업적으로 활용 가능한 품질의 이미지 생성에 초점
5. 영어로 작성 (DALL-E 3 최적화)`;

    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: `다음 이미지 설명을 DALL-E 3에 최적화된 영어 프롬프트로 변환해주세요.
단, 결과는 향상된 프롬프트만 출력하고 다른 설명은 포함하지 마세요.

원본 설명 (한국어): ${prompt}`,
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
