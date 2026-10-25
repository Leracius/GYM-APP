import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
  const url = new URL(`https://api.gymfit-api.com/v2/exercises/${encodeURIComponent(id)}/alternatives`);
  const limit = request.nextUrl.searchParams.get("limit") || "8";
  url.searchParams.set("limit", limit);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json", "X-API-KEY": apiKey }, next: { revalidate: 300 } });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar alternativas." }, { status: 502 });
  }
}
