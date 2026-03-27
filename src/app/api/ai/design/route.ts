import { NextRequest, NextResponse } from "next/server";
import { AIProvider, Message } from "@/types";
import { chat } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      businessName,
      tagline,
      colorPalette,
      colors,
      fontPairing,
      layoutStyle,
      additionalInfo,
      provider,
      apiKey,
    } = body as {
      category: string;
      businessName: string;
      tagline: string;
      colorPalette: string;
      colors: string[];
      fontPairing: string;
      layoutStyle: string;
      additionalInfo: string;
      provider: AIProvider;
      apiKey: string;
    };

    const systemPrompt = `당신은 소상공인 전문 브랜드 디자이너입니다.
선택된 디자인 요소들을 바탕으로 실용적이고 전문적인 디자인 가이드를 제공해주세요.
Canva, 미리캔버스 같은 무료 디자인 툴에서 바로 적용할 수 있는 구체적인 지침을 포함해주세요.`;

    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: `다음 정보를 바탕으로 ${category} 디자인 가이드를 작성해주세요.

사업체명: ${businessName}
슬로건: ${tagline || "없음"}
디자인 유형: ${category}
컬러 팔레트: ${colorPalette} (${colors.join(", ")})
폰트 조합: ${fontPairing}
레이아웃 스타일: ${layoutStyle}
${additionalInfo ? `추가 요청사항: ${additionalInfo}` : ""}

포함해주세요:
1. 전체적인 디자인 방향성 및 컨셉
2. 컬러 사용 가이드 (주색, 보조색, 배경색 각각의 활용 방법)
3. 타이포그래피 가이드 (제목/본문/강조 텍스트 사용법)
4. 레이아웃 구성 가이드
5. Canva/미리캔버스 활용 팁
6. 동일 스타일 적용 가능한 다른 디자인물 추천`,
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
