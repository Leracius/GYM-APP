import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta configurar GYMFIT_API_KEY." }, { status: 503 });
  try {
    const response = await fetch("https://api.gymfit-api.com/v2/muscle-groups", {
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      next: { revalidate: 86400 },
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los grupos musculares." }, { status: 502 });
  }
}
