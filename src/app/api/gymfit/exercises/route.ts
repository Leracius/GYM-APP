import { NextRequest, NextResponse } from "next/server";

const GYMFIT_API_BASE = "https://api.gymfit-api.com/v2";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar GYMFIT_API_KEY en el entorno del servidor." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const upstreamUrl = new URL(`${GYMFIT_API_BASE}/exercises/search`);
  const query = searchParams.get("query")?.trim();
  if (query) upstreamUrl.searchParams.set("query", query);
  upstreamUrl.searchParams.set("limit", searchParams.get("limit") || "18");
  upstreamUrl.searchParams.set("facets", "true");
  const allowedFilters = [
    "bodyPart", "type", "equipment", "muscle", "muscleRole", "family", "tier",
    "trackingType", "laterality", "sort", "category", "difficulty", "muscleGroup",
    "purpose", "force", "include", "group",
  ];
  for (const filter of allowedFilters) {
    const value = searchParams.get(filter)?.trim();
    if (value) upstreamUrl.searchParams.set(filter, value);
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      next: { revalidate: 60 },
    });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con GymFit API. Intentá de nuevo." },
      { status: 502 },
    );
  }
}
