import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });
  const upstreamUrl = new URL("https://api.gymfit-api.com/v2/muscles/search");
  for (const key of ["query", "bodyPart", "group", "limit", "offset"]) {
    const value = request.nextUrl.searchParams.get(key)?.trim();
    if (value) upstreamUrl.searchParams.set(key, value);
  }
  try {
    const response = await fetch(upstreamUrl, { headers: { Accept: "application/json", "X-API-KEY": apiKey }, next: { revalidate: 300 } });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "No se pudieron buscar músculos." }, { status: 502 });
  }
}
