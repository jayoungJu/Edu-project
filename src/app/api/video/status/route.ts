import { NextRequest, NextResponse } from "next/server";

const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const apiKey = searchParams.get("apiKey");

  if (!id || !apiKey) {
    return NextResponse.json({ error: "id와 apiKey가 필요합니다." }, { status: 400 });
  }

  try {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
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

    // Normalize status: Runway returns PENDING / RUNNING / SUCCEEDED / FAILED
    const status = (data.status as string)?.toLowerCase();
    const normalized =
      status === "succeeded"
        ? "succeeded"
        : status === "failed"
        ? "failed"
        : status === "running"
        ? "processing"
        : "pending";

    return NextResponse.json({
      id: data.id,
      status: normalized,
      videoUrl: data.output?.[0] ?? null,
      progress: data.progressRatio ?? 0,
    });
  } catch (err) {
    console.error("Video status error:", err);
    return NextResponse.json({ error: "상태 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
