import { NextResponse } from "next/server";
import { WgerExerciseInfo } from "@/types/wger";

const WGER_API_BASE = "https://wger.de/api/v2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Identificador de ejercicio inválido." }, { status: 400 });
  }

  try {
    const url = new URL(`${WGER_API_BASE}/exerciseinfo/${id}/`);
    url.searchParams.set("format", "json");
    url.searchParams.set("language", "4");
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: "No se encontró el ejercicio." }, { status: response.status });
    }
    return NextResponse.json(data as WgerExerciseInfo);
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con la biblioteca de ejercicios." },
      { status: 502 },
    );
  }
}
