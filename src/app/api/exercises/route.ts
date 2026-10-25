import { NextRequest, NextResponse } from "next/server";
import { WgerApiResponse, WgerExerciseInfo } from "@/types/wger";

const WGER_API_BASE = "https://wger.de/api/v2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const limit = searchParams.get("limit") || "18";
    const offset = searchParams.get("offset") || "0";

    const endpointUrl = new URL(`${WGER_API_BASE}/exerciseinfo/`);
    endpointUrl.searchParams.set("format", "json");
    endpointUrl.searchParams.set("language", "4");
    endpointUrl.searchParams.set("limit", limit);
    endpointUrl.searchParams.set("offset", offset);

    if (search) {
      endpointUrl.searchParams.set("name__search", search);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(endpointUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error al consultar la API de wger: ${response.status} ${response.statusText}`,
          targetUrl: endpointUrl.toString(),
        },
        { status: response.status }
      );
    }

    const data: WgerApiResponse<WgerExerciseInfo> = await response.json();

    return NextResponse.json({
      success: true,
      query: search,
      targetUrl: endpointUrl.toString(),
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: data.results,
      raw: data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado en el servidor";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
