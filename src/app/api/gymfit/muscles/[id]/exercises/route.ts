import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
  const upstreamUrl = new URL(`https://api.gymfit-api.com/v2/muscles/${encodeURIComponent(id)}/exercises`);
  for (const key of ["query", "type", "limit", "offset", "equipment", "muscleRole", "tier", "sort", "category", "difficulty", "include"]) {
    const value = request.nextUrl.searchParams.get(key)?.trim();
    if (value) upstreamUrl.searchParams.set(key, value);
  }
  try {
    const response = await fetch(upstreamUrl, { headers: { Accept: "application/json", "X-API-KEY": apiKey }, next: { revalidate: 300 } });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar ejercicios para ese músculo." }, { status: 502 });
  }
}
