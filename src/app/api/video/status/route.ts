import { NextRequest, NextResponse } from "next/server";

// ─── OpenAI Sora status ──────────────────────────────────────
async function checkOpenAIStatus(id: string, apiKey: string) {
  const res = await fetch(`https://api.openai.com/v1/videos/generations/${id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || res.statusText);
  }

  const data = await res.json();
  const raw = (data.status as string)?.toLowerCase() || "";
  const status =
    raw === "completed" ? "succeeded" :
    raw === "failed"    ? "failed"    :
    raw === "processing"? "processing": "pending";

  const videoUrl = data.data?.[0]?.url ?? null;
  return { status, videoUrl, progress: data.progress ?? 0 };
}

// ─── Gemini Veo 3.1 status ────────────────────────────────────
async function checkGeminiStatus(operationName: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message || res.statusText;
    throw new Error(`Gemini 상태 확인 오류 (${res.status}): ${msg}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Gemini 오류");
  }

  // 아직 진행 중
  if (!data.done) {
    const progress = data.metadata?.progressPercent ?? 0;
    return { status: "processing", videoUrl: null, progress };
  }

  // ── 완료: Veo 3.1 응답 형식 처리 ──────────────────────────
  const response = data.response ?? {};

  // 형식 1: predictions 배열 (base64 인코딩 영상)
  const predictions = response.predictions ?? [];
  if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
    const mime = predictions[0].mimeType || "video/mp4";
    const videoUrl = `data:${mime};base64,${predictions[0].bytesBase64Encoded}`;
    return { status: "succeeded", videoUrl, progress: 100 };
  }

  // 형식 2: generateVideoResponse (URI 방식)
  const samples = response.generateVideoResponse?.generatedSamples ?? [];
  if (samples.length > 0 && samples[0].video?.uri) {
    return { status: "succeeded", videoUrl: samples[0].video.uri as string, progress: 100 };
  }

  // 형식 3: videos 배열
  const videos = response.videos ?? [];
  if (videos.length > 0 && videos[0].uri) {
    return { status: "succeeded", videoUrl: videos[0].uri as string, progress: 100 };
  }

  // done=true 인데 영상 데이터 없으면 실패로 처리
  return { status: "failed", videoUrl: null, progress: 100 };
}

// ─── Route Handler ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const apiKey = searchParams.get("apiKey");
  const provider = searchParams.get("provider") || "openai";

  if (!id || !apiKey) {
    return NextResponse.json({ error: "id와 apiKey가 필요합니다." }, { status: 400 });
  }

  try {
    let result: { status: string; videoUrl: string | null; progress: number };

    if (provider === "gemini") {
      result = await checkGeminiStatus(id, apiKey);
    } else {
      result = await checkOpenAIStatus(id, apiKey);
    }

    return NextResponse.json({ id, provider, ...result });
  } catch (err) {
    console.error("Video status error:", err);
    const message = err instanceof Error ? err.message : "상태 조회 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
