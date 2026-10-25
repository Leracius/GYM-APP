import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const url = new URL("https://api.gymfit-api.com/v2/exercises/suggest");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las sugerencias." }, { status: 502 });
  }
}
