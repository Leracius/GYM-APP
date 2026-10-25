"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WgerExerciseInfo, WgerApiResponse } from "@/types/wger";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ApiResponseViewer } from "@/components/ApiResponseViewer";
import { ExerciseModal } from "@/components/ExerciseModal";
import {
  Search,
  Dumbbell,
  RefreshCw,
  Code2,
  LayoutGrid,
  AlertCircle,
  X,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

interface LocalApiResponse {
  success: boolean;
  query: string;
  targetUrl: string;
  count: number;
  next: string | null;
  previous: string | null;
  results: WgerExerciseInfo[];
  raw: WgerApiResponse<WgerExerciseInfo>;
  error?: string;
}

const MUSCLE_TARGETS = [
  { label: "Pecho", query: "bench" },
  { label: "Espalda", query: "row" },
  { label: "Piernas", query: "squat" },
  { label: "Bíceps", query: "curl" },
  { label: "Tríceps", query: "dips" },
  { label: "Hombros", query: "press" },
  { label: "Core", query: "crunch" },
];

const EQUIPMENT_FILTERS = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Pull-up bar",
  "Bench",
  "Bodyweight",
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [apiData, setApiData] = useState<LocalApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<WgerExerciseInfo | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "json">("cards");

  const fetchExercises = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/exercises", window.location.origin);
      if (query.trim()) {
        url.searchParams.set("search", query.trim());
      }
      url.searchParams.set("limit", "18");

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      }

      setApiData(data);
      setActiveQuery(query.trim());
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al conectar con la API de wger";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises("");
  }, [fetchExercises]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExercises(searchTerm);
  };

  const handleQuickSelect = (query: string) => {
    setSearchTerm(query);
    fetchExercises(query);
  };

  const handleClear = () => {
    setSearchTerm("");
    fetchExercises("");
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-[#f5f5f7] flex flex-col relative selection:bg-white selection:text-black">
      {/* Ambient Grid Background Pattern */}
      <div className="grid-pattern" />

      {/* Top Launch/Status Strip */}
      <div className="relative z-20 bg-zinc-900/90 border-b border-white/[0.08] py-2 px-4 flex items-center justify-between text-xs font-mono">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between"></div>
      </div>

      {/* Nav Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black shadow-md">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                GYM APP
              </span>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
                / explorador wger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchExercises(searchTerm)}
              disabled={loading}
              className="p-2 rounded-lg bg-zinc-900 border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`}
              />
            </button>
            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-10 space-y-10 relative z-10">
        {/* HERO / COMMAND BAR SECTION */}
        <section className="space-y-6">
          {/* HUD Breadcrumb */}
          <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
            <span>GYM_APP</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300">ÍNDICE_EJERCICIOS</span>
            <span className="ml-auto flex items-center gap-2 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-live"></span>
              <span>activo · listo</span>
            </span>
          </div>

          {/* Large Headline & Stat Readout Grid */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-white leading-none">
                EXPLORADOR <br />
                <span className="font-serif italic font-light lowercase text-zinc-400 text-3xl sm:text-5xl md:text-6xl tracking-normal">
                  base de datos & api
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                Explorá ejercicios, músculos objetivo, equipamiento y respuestas
                JSON de la plataforma open-source{" "}
                <span className="text-zinc-200 font-semibold">
                  wger Workout Manager
                </span>
                .
              </p>
            </div>

            {/* Live Stat Readout Cards */}
            <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden bracket bg-white/[0.08] border border-white/[0.08] shrink-0">
              <div className="px-5 py-4 bg-[#111111]/90">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-none">
                  {apiData?.count ? apiData.count.toLocaleString() : "900+"}
                </div>
                <div className="hud text-zinc-500 mt-2">Ejercicios</div>
              </div>
              <div className="px-5 py-4 bg-[#111111]/90">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-300 leading-none">
                  18
                </div>
                <div className="hud text-zinc-500 mt-2">Músculos</div>
              </div>
              <div className="px-5 py-4 bg-[#111111]/90">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400 leading-none">
                  REST
                </div>
                <div className="hud text-zinc-500 mt-2">v2 API</div>
              </div>
            </div>
          </div>

          {/* Monospace Ticker */}
          <div className="py-2.5 px-4 rounded-lg ticker-mask overflow-hidden bg-zinc-950/70 border border-white/[0.06]">
            <div className="ticker-track hud text-zinc-400">
              <span>◇ API REST · JSON ENTRADA/SALIDA</span>
              <span>◇ TRADUCCIONES MULTI-IDIOMA</span>
              <span>◇ DIAGRAMAS MUSCULARES ANATÓMICOS</span>
              <span>◇ FILTRADO POR EQUIPAMIENTO</span>
              <span>◇ BASE DE DATOS LIBRE Y ABIERTA</span>
              <span>◇ API REST · JSON ENTRADA/SALIDA</span>
              <span>◇ TRADUCCIONES MULTI-IDIOMA</span>
              <span>◇ DIAGRAMAS MUSCULARES ANATÓMICOS</span>
              <span>◇ FILTRADO POR EQUIPAMIENTO</span>
              <span>◇ BASE DE DATOS LIBRE Y ABIERTA</span>
            </div>
          </div>
        </section>

        {/* 01 / MÚSCULO OBJETIVO */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="hud text-zinc-300 font-bold">
              01 / MÚSCULO OBJETIVO
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent"></span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {MUSCLE_TARGETS.map((item) => {
              const isActive =
                activeQuery.toLowerCase() === item.query.toLowerCase();
              return (
                <button
                  key={item.label}
                  onClick={() => handleQuickSelect(item.query)}
                  className={`bracket p-3 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? "bg-white text-black border-white font-bold shadow-lg"
                      : "bg-[#111111]/80 hover:bg-[#18181b] border-white/[0.08] hover:border-white/20 text-zinc-300"
                  }`}
                >
                  <div className="font-display text-xs font-bold uppercase tracking-tight">
                    {item.label}
                  </div>
                  <div
                    className={`font-mono text-[9px] mt-0.5 ${
                      isActive ? "text-zinc-800" : "text-zinc-500"
                    }`}
                  >
                    filtro: &quot;{item.query}&quot;
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 02 / EQUIPAMIENTO */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="hud text-zinc-300 font-bold">
              02 / EQUIPAMIENTO
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent"></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_FILTERS.map((eq) => {
              const isActive = activeQuery.toLowerCase() === eq.toLowerCase();
              return (
                <button
                  key={eq}
                  onClick={() => handleQuickSelect(eq)}
                  className={`font-mono text-[11px] px-3.5 py-1.5 rounded-lg border transition-all ${
                    isActive
                      ? "bg-zinc-800 border-white text-white font-semibold"
                      : "bg-[#111111]/60 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                  }`}
                >
                  {eq}
                </button>
              );
            })}
          </div>
        </section>

        {/* 03 / BIBLIOTECA */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center gap-3">
            <span className="hud text-zinc-300 font-bold">03 / BIBLIOTECA</span>
            <span className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent"></span>
            {apiData && (
              <span className="hud text-zinc-500">
                {apiData.count} EJERCICIOS ENCONTRADOS
              </span>
            )}
          </div>

          {/* Search Bar & View Mode */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ejercicios por nombre, músculo o equipamiento…"
                  className="w-full bg-[#111111]/90 border border-white/[0.08] focus:border-white focus:ring-1 focus:ring-white text-white placeholder-zinc-500 pl-11 pr-24 py-3.5 rounded-xl font-mono text-xs outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 rounded text-zinc-500 hover:text-white"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors uppercase disabled:opacity-50"
                  >
                    {loading ? "..." : "BUSCAR"}
                  </button>
                </div>
              </div>
            </form>

            {/* View Mode Segmented Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#111111] border border-white/[0.08] rounded-xl shrink-0 font-mono text-xs">
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>TARJETAS</span>
              </button>
              <button
                onClick={() => setViewMode("json")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "json"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON CRUDO</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 flex items-start gap-3 font-mono text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ERROR DE SOLICITUD: </span>
                {error}
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-zinc-950/60 border border-white/[0.05] rounded-2xl h-80 animate-pulse flex flex-col p-5 justify-between"
                >
                  <div className="w-full h-44 bg-zinc-900 rounded-xl" />
                  <div className="space-y-2 mt-4">
                    <div className="w-2/3 h-5 bg-zinc-900 rounded" />
                    <div className="w-full h-3 bg-zinc-900/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content Area */}
          {!loading && apiData && (
            <>
              {viewMode === "cards" ? (
                apiData.results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {apiData.results.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onSelect={(item) => setSelectedExercise(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-[#111111]/40 border border-white/[0.06] rounded-2xl">
                    <Dumbbell className="w-10 h-10 mx-auto text-zinc-700 mb-3" />
                    <h4 className="font-display font-bold text-lg text-white mb-1">
                      SIN RESULTADOS
                    </h4>
                    <p className="font-mono text-xs text-zinc-500 max-w-sm mx-auto">
                      No se encontraron registros para la búsqueda &quot;
                      {activeQuery}&quot;. Probá otra palabra clave o limpiá el
                      filtro.
                    </p>
                    <button
                      onClick={handleClear}
                      className="mt-4 font-mono text-xs text-white underline underline-offset-4"
                    >
                      Limpiar filtro de búsqueda
                    </button>
                  </div>
                )
              ) : null}

              {/* JSON Inspector View */}
              {viewMode === "json" && (
                <ApiResponseViewer
                  data={apiData.raw}
                  count={apiData.count}
                  targetUrl={apiData.targetUrl}
                  query={apiData.query}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#070707] py-8 text-xs relative z-10 mt-16 font-mono">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <div>
            <span>GYM APP</span> · Impulsado por wger REST API (AGPLv3)
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Todos los sistemas operativos
            </span>
          </div>
        </div>
      </footer>

      {/* Detailed Modal for Exercise */}
      <ExerciseModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
