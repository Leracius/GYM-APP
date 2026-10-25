import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
  try {
    const response = await fetch(`https://api.gymfit-api.com/v2/muscles/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      next: { revalidate: 3600 },
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar el músculo." }, { status: 502 });
  }
}
