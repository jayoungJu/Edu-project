import { NextRequest, NextResponse } from "next/server";

// ─── OpenAI Sora ────────────────────────────────────────────
async function generateWithOpenAI(params: {
  prompt: string;
  duration: number;
  ratio: string;
  apiKey: string;
  imageUrl?: string;
}) {
  const { prompt, duration, ratio, apiKey, imageUrl } = params;

  const sizeMap: Record<string, string> = {
    "16:9": "1280x720",
    "9:16": "720x1280",
    "1:1": "1080x1080",
  };
  const size = sizeMap[ratio] || "1280x720";

  // Image-to-video: use Sora with an init frame
  const body: Record<string, unknown> = {
    model: "sora-1.0",
    prompt,
    size,
    duration,
    n: 1,
  };
  if (imageUrl) {
    body.prompt_images = [{ url: imageUrl }];
  }

  const res = await fetch("https://api.openai.com/v1/videos/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || res.statusText);
  }

  const data = await res.json();
  // OpenAI returns { id, status, ... }
  return { id: data.id as string };
}

// ─── Google Gemini Veo 2 ─────────────────────────────────────
async function generateWithGemini(params: {
  prompt: string;
  duration: number;
  ratio: string;
  apiKey: string;
  imageUrl?: string;
}) {
  const { prompt, duration, ratio, apiKey, imageUrl } = params;

  const aspectRatioMap: Record<string, string> = {
    "16:9": "16:9",
    "9:16": "9:16",
    "1:1": "1:1",
  };
  const aspectRatio = aspectRatioMap[ratio] || "16:9";

  const instance: Record<string, unknown> = { prompt };
  if (imageUrl) {
    // Base64 data URL → extract mime and data
    const match = imageUrl.match(/^data:(.+);base64,(.+)$/);
    if (match) {
      instance.image = { bytesBase64Encoded: match[2], mimeType: match[1] };
    }
  }

  const body = {
    instances: [instance],
    parameters: {
      aspectRatio,
      sampleCount: 1,
      durationSeconds: duration,
      enhancePrompt: true,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message || res.statusText;
    throw new Error(msg);
  }

  const data = await res.json();
  // Returns long-running operation: { name: "operations/xxx", ... }
  return { id: data.name as string };
}

// ─── Route Handler ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { mode, prompt, duration, ratio, apiKey, imageUrl, provider } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다." }, { status: 400 });
    }
    if (!prompt && mode !== "video-effects") {
      return NextResponse.json({ error: "영상 설명을 입력해주세요." }, { status: 400 });
    }

    const params = { prompt: prompt || "", duration: duration || 5, ratio: ratio || "16:9", apiKey, imageUrl };

    let result: { id: string };
    if (provider === "gemini") {
      result = await generateWithGemini(params);
    } else {
      // default: openai
      result = await generateWithOpenAI(params);
    }

    return NextResponse.json({ id: result.id, provider });
  } catch (err) {
    console.error("Video generate error:", err);
    const message = err instanceof Error ? err.message : "영상 생성 요청 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
