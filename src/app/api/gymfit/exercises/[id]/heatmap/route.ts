import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
  const url = new URL(`https://api.gymfit-api.com/v2/exercises/${encodeURIComponent(id)}/heatmap`);
  const view = request.nextUrl.searchParams.get("view");
  if (view === "front" || view === "back") url.searchParams.set("view", view);
  url.searchParams.set("target", "f97316");
  url.searchParams.set("secondary", "60a5fa");
  try {
    const response = await fetch(url, { headers: { Accept: "image/svg+xml" , "X-API-KEY": apiKey }, next: { revalidate: 3600 } });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "image/svg+xml", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar el mapa muscular." }, { status: 502 });
  }
}
