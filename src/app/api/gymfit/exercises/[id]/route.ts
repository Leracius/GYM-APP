import { NextRequest, NextResponse } from "next/server";

const GYMFIT_API_BASE = "https://api.gymfit-api.com/v2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar GYMFIT_API_KEY en el entorno del servidor." },
      { status: 503 },
    );
  }

  const { id } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "Identificador de ejercicio inválido." }, { status: 400 });
  }

  try {
    const response = await fetch(`${GYMFIT_API_BASE}/exercises/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json", "X-API-KEY": apiKey },
      next: { revalidate: 300 },
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
