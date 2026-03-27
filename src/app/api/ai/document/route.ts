import { NextRequest, NextResponse } from "next/server";
import { AIProvider, Message } from "@/types";
import { chat } from "@/lib/ai-providers";

const documentSystemPrompts: Record<string, string> = {
  business_plan: `당신은 소상공인 전문 컨설턴트입니다. 실제 투자자와 금융기관에서 인정받을 수 있는 수준의 사업계획서를 작성해주세요.`,
  proposal: `당신은 비즈니스 제안서 전문 작성가입니다. 설득력 있고 전문적인 제안서를 작성해주세요.`,
  marketing: `당신은 마케팅 카피라이터 전문가입니다. 타겟 고객의 감성을 자극하고 구매 행동을 유도하는 문구를 작성해주세요.`,
  email: `당신은 비즈니스 커뮤니케이션 전문가입니다. 효과적이고 전문적인 이메일/문자 메시지를 작성해주세요.`,
  contract: `당신은 계약서 작성 전문가입니다. 법적으로 명확하고 양 당사자를 보호하는 계약서를 작성해주세요. (주의: 실제 계약 체결 전 법률 전문가 검토 권고)`,
  sns_post: `당신은 SNS 마케팅 전문가입니다. 높은 참여율과 바이럴 효과를 위한 SNS 게시물을 작성해주세요.`,
  report: `당신은 비즈니스 보고서 작성 전문가입니다. 명확하고 분석적인 실적 보고서를 작성해주세요.`,
  announcement: `당신은 고객 커뮤니케이션 전문가입니다. 고객 친화적이고 명확한 공지사항을 작성해주세요.`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, documentLabel, fields, tone, provider, apiKey } = body as {
      documentType: string;
      documentLabel: string;
      fields: string;
      tone: string;
      provider: AIProvider;
      apiKey: string;
    };

    if (!documentType || !fields) {
      return NextResponse.json(
        { error: "documentType과 fields는 필수 항목입니다." },
        { status: 400 }
      );
    }

    const toneGuide: Record<string, string> = {
      formal: "공식적이고 격식있는 문체",
      friendly: "친근하고 따뜻한 문체",
      professional: "전문적이고 비즈니스적인 문체",
      casual: "캐주얼하고 읽기 쉬운 문체",
    };

    const systemPrompt =
      documentSystemPrompts[documentType] ||
      "당신은 전문 문서 작성가입니다. 소상공인을 위한 실용적인 문서를 작성해주세요.";

    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: `다음 정보를 바탕으로 ${documentLabel}을(를) 작성해주세요.

[입력 정보]
${fields}

[작성 지침]
- 톤앤매너: ${toneGuide[tone] || "공식적인 문체"}
- 한국 소상공인 실정에 맞게 작성
- 실제로 바로 사용할 수 있는 완성된 문서 형태로 작성
- 필요한 경우 섹션 구분선이나 소제목 활용
- 빈칸([  ])이 있는 경우 적절한 내용으로 채워주세요`,
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
