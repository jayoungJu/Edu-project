import { NextRequest, NextResponse } from "next/server";

const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";

export async function POST(req: NextRequest) {
  try {
    const { mode, prompt, duration, ratio, apiKey, imageUrl } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "Runway API 키가 필요합니다." }, { status: 400 });
    }

    // Map ratio to Runway resolution format
    const resolutionMap: Record<string, string> = {
      "16:9": "1280:720",
      "9:16": "720:1280",
      "1:1": "960:960",
    };
    const resolution = resolutionMap[ratio] || "1280:720";

    let endpoint: string;
    let body: Record<string, unknown>;

    if (mode === "text-to-video") {
      endpoint = `${RUNWAY_API_BASE}/text_to_video`;
      body = {
        prompt_text: prompt,
        duration: duration || 5,
        resolution,
        watermark: false,
      };
    } else {
      // image-to-video, video-effects, ai-avatar — all use image_to_video endpoint
      endpoint = `${RUNWAY_API_BASE}/image_to_video`;
      body = {
        prompt_image: imageUrl || "",
        prompt_text: prompt || "",
        duration: duration || 5,
        resolution,
        watermark: false,
      };

      // For text-only avatar/effects without an image, fall back to text_to_video
      if (!imageUrl) {
        endpoint = `${RUNWAY_API_BASE}/text_to_video`;
        body = {
          prompt_text: prompt,
          duration: duration || 5,
          resolution,
          watermark: false,
        };
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = (errData as { message?: string }).message || response.statusText;
      return NextResponse.json(
        { error: `Runway API 오류: ${message}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Video generate error:", err);
    return NextResponse.json({ error: "영상 생성 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}
