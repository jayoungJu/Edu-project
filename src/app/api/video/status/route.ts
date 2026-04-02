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
  // OpenAI status: queued | processing | completed | failed
  const raw = (data.status as string)?.toLowerCase() || "";
  const status =
    raw === "completed" ? "succeeded" :
    raw === "failed" ? "failed" :
    raw === "processing" ? "processing" : "pending";

  const videoUrl = data.data?.[0]?.url ?? null;
  return { status, videoUrl, progress: data.progress ?? 0 };
}

// ─── Gemini Veo 2 status ──────────────────────────────────────
async function checkGeminiStatus(operationName: string, apiKey: string) {
  // operationName is like "operations/xxx" or full path
  const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || res.statusText);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Gemini 오류");
  }

  if (!data.done) {
    // Still running — extract percentage if available
    const progress = data.metadata?.progressPercent ?? 0;
    return { status: "processing", videoUrl: null, progress };
  }

  // Completed
  const videoUri =
    data.response?.videos?.[0]?.uri ??
    data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ??
    null;

  if (!videoUri) {
    return { status: "failed", videoUrl: null, progress: 100 };
  }

  return { status: "succeeded", videoUrl: videoUri as string, progress: 100 };
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
