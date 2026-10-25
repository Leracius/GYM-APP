"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WgerExerciseInfo, WgerApiResponse } from "@/types/wger";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ApiResponseViewer } from "@/components/ApiResponseViewer";
import { ExerciseModal } from "@/components/ExerciseModal";
import { Search, Dumbbell, RefreshCw, Code2, LayoutGrid, AlertCircle, X, CalendarDays, Play, Sun, Moon, Palette, Check, Download } from "lucide-react";
import { WorkoutWorkspace } from "@/components/WorkoutWorkspace";
import { PwaOnboarding } from "@/components/PwaOnboarding";
import { readWorkoutLog, WorkoutSession, writeWorkoutLog } from "@/lib/workout-log";

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

const EQUIPMENT_FILTERS = ["Barbell", "Dumbbell", "Kettlebell", "Pull-up bar", "Bench", "Bodyweight"];
const COLOR_THEMES = [
  { id: "orange", label: "Naranja", shades: ["#7c2d12", "#c2410c", "#f97316", "#fb923c", "#fed7aa"] },
  { id: "blue", label: "Azul", shades: ["#172554", "#1d4ed8", "#3b82f6", "#60a5fa", "#bfdbfe"] },
  { id: "red", label: "Rojo", shades: ["#450a0a", "#b91c1c", "#ef4444", "#f87171", "#fecaca"] },
  { id: "pink", label: "Rosa", shades: ["#500724", "#be185d", "#ec4899", "#f472b6", "#fbcfe8"] },
  { id: "violet", label: "Violeta", shades: ["#2e1065", "#6d28d9", "#8b5cf6", "#a78bfa", "#ddd6fe"] },
] as const;
type ColorTheme = (typeof COLOR_THEMES)[number]["id"];

export default function Home() {
  const [activeSection, setActiveSection] = useState<"workout" | "calendar" | "library">("workout");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("orange");
  const [themeReady, setThemeReady] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [apiData, setApiData] = useState<LocalApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<WgerExerciseInfo | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "json">("cards");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem("my-workout-app.theme");
      const savedColor = window.localStorage.getItem("my-workout-app.color-theme");
      const nextTheme = savedTheme === "light" ? "light" : "dark";
      const nextColor = COLOR_THEMES.some((item) => item.id === savedColor) ? savedColor as ColorTheme : "orange";
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.dataset.palette = nextColor;
      setTheme(nextTheme);
      setColorTheme(nextColor);
      setThemeReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.palette = colorTheme;
    window.localStorage.setItem("my-workout-app.theme", theme);
    window.localStorage.setItem("my-workout-app.color-theme", colorTheme);
  }, [theme, colorTheme, themeReady]);

  useEffect(() => {
    if (!appearanceOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppearanceOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [appearanceOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessions(readWorkoutLog().sessions);
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (storageReady) writeWorkoutLog(sessions);
  }, [sessions, storageReady]);

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
      const msg = err instanceof Error ? err.message : "Error al conectar con la API de wger";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchExercises(""), 0);
    return () => window.clearTimeout(timer);
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
    <div className="min-h-screen flex flex-col relative">
      <header
        className="sticky top-0 z-30 material-thin border-b"
        style={{ borderColor: "rgba(84, 84, 88, 0.65)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[60px] flex items-center justify-between gap-3">
          <div className="brand-lockup flex items-center gap-2.5">
            <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-xl">
              <Dumbbell className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <span className="brand-name font-bold tracking-tight">My Workout App</span>
          </div>

          <nav className="flex items-center gap-1" aria-label="Navegación principal">
            <button onClick={() => setActiveSection("workout")} className={`nav-button ${activeSection === "workout" ? "nav-button-active" : ""}`} aria-current={activeSection === "workout" ? "page" : undefined}><Play className="h-3.5 w-3.5" /><span>Entrenar</span></button>
            <button onClick={() => setActiveSection("calendar")} className={`nav-button ${activeSection === "calendar" ? "nav-button-active" : ""}`} aria-current={activeSection === "calendar" ? "page" : undefined}><CalendarDays className="h-3.5 w-3.5" /><span>Calendario</span></button>
            <button onClick={() => setActiveSection("library")} className={`nav-button ${activeSection === "library" ? "nav-button-active" : ""}`} aria-current={activeSection === "library" ? "page" : undefined}><Dumbbell className="h-3.5 w-3.5" /><span>Ejercicios</span></button>
          </nav>

          <div className="flex items-center gap-2">
          <button className="theme-toggle pwa-trigger" onClick={() => window.dispatchEvent(new Event("my-workout-app:show-install"))} aria-label="Instalar o guardar My Workout App" title="Instalar o guardar app">
            <Download className="h-[18px] w-[18px]" />
          </button>
          <div className="appearance-wrap">
            <button className="theme-toggle" onClick={() => setAppearanceOpen((open) => !open)} aria-label="Apariencia y colores" aria-expanded={appearanceOpen} aria-controls="appearance-panel" title="Apariencia y colores">
              <Palette className="h-[18px] w-[18px]" />
            </button>
            {appearanceOpen && <>
              <button className="appearance-backdrop" onClick={() => setAppearanceOpen(false)} aria-label="Cerrar opciones de apariencia" tabIndex={-1} />
              <section id="appearance-panel" className="appearance-popover" role="dialog" aria-label="Apariencia">
                <div className="appearance-heading"><div><p className="appearance-eyebrow">Personalización</p><h2>Apariencia</h2></div><button className="appearance-close" onClick={() => setAppearanceOpen(false)} aria-label="Cerrar"><X className="h-4 w-4" /></button></div>
                <fieldset className="appearance-section">
                  <legend>Tema de color</legend>
                  <div className="appearance-palette-list">
                    {COLOR_THEMES.map((item) => <button key={item.id} type="button" className={`palette-option ${colorTheme === item.id ? "palette-option-selected" : ""}`} onClick={() => setColorTheme(item.id)} aria-pressed={colorTheme === item.id}>
                      <span className="palette-shades" aria-hidden="true">{item.shades.map((shade) => <i key={shade} style={{ backgroundColor: shade }} />)}</span>
                      <span>{item.label}</span>{colorTheme === item.id && <Check className="palette-check h-4 w-4" aria-hidden="true" />}
                    </button>)}
                  </div>
                </fieldset>
                <fieldset className="appearance-section appearance-mode">
                  <legend>Modo</legend>
                  <div className="mode-options">
                    <button type="button" onClick={() => setTheme("light")} aria-pressed={theme === "light"} className={theme === "light" ? "mode-option mode-option-selected" : "mode-option"}><Sun className="h-4 w-4" />Claro</button>
                    <button type="button" onClick={() => setTheme("dark")} aria-pressed={theme === "dark"} className={theme === "dark" ? "mode-option mode-option-selected" : "mode-option"}><Moon className="h-4 w-4" />Oscuro</button>
                  </div>
                </fieldset>
              </section>
            </>}
          </div>
          {activeSection === "library" && <button
            onClick={() => fetchExercises(searchTerm)}
            disabled={loading}
            className="p-1.5 rounded-full transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "0.5px solid rgba(255, 255, 255, 0.12)",
            }}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "rgba(235, 235, 245, 0.8)" }} />
          </button>}
          </div>
        </div>
      </header>

      {activeSection === "library" ? <main className="library-page flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
              Explorador de ejercicios
            </h1>
            <p className="text-[15px] sm:text-[17px] leading-relaxed max-w-2xl" style={{ color: "rgba(235, 235, 245, 0.6)" }}>
              Descubre ejercicios de la base de datos abierta{" "}
              <span style={{ color: "rgba(235, 235, 245, 0.9)" }}>wger Workout Manager</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <div
              className="px-4 py-2.5 rounded-2xl flex items-center gap-3"
              style={{
                background: "rgba(28, 28, 30, 0.72)",
                backdropFilter: "saturate(180%) blur(40px)",
                WebkitBackdropFilter: "saturate(180%) blur(40px)",
                border: "0.5px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <div className="text-center">
                <div className="text-xl font-semibold tabular-nums">{apiData?.count ? apiData.count.toLocaleString() : "900+"}</div>
                <div className="text-[11px]" style={{ color: "rgba(235, 235, 245, 0.5)" }}>Ejercicios</div>
              </div>
            </div>
            <div
              className="px-4 py-2.5 rounded-2xl flex items-center gap-3"
              style={{
                background: "rgba(28, 28, 30, 0.72)",
                backdropFilter: "saturate(180%) blur(40px)",
                WebkitBackdropFilter: "saturate(180%) blur(40px)",
                border: "0.5px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#30d158", boxShadow: "0 0 8px rgba(48, 209, 88, 0.6)" }}></div>
                <span className="text-[13px]" style={{ color: "rgba(235, 235, 245, 0.8)" }}>API activa</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 animate-slide-up">
          <div className="space-y-3">
            <h2 className="text-[17px] font-semibold tracking-tight">Grupo muscular</h2>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_TARGETS.map((item) => {
                const isActive = activeQuery.toLowerCase() === item.query.toLowerCase();
                return (
                  <button
                    key={item.query}
                    onClick={() => handleQuickSelect(item.query)}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95"
                    style={{
                      background: isActive ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#000000" : "rgba(235, 235, 245, 0.9)",
                      border: isActive ? "none" : "0.5px solid rgba(255, 255, 255, 0.12)",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[17px] font-semibold tracking-tight">Equipamiento</h2>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_FILTERS.map((eq) => {
                const isActive = activeQuery.toLowerCase() === eq.toLowerCase();
                return (
                  <button
                    key={eq}
                    onClick={() => handleQuickSelect(eq)}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95"
                    style={{
                      background: isActive ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#000000" : "rgba(235, 235, 245, 0.9)",
                      border: isActive ? "none" : "0.5px solid rgba(255, 255, 255, 0.12)",
                    }}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold tracking-tight">Biblioteca</h2>
            {apiData && (
              <span className="text-[13px]" style={{ color: "rgba(235, 235, 245, 0.5)" }}>
                {apiData.count} ejercicios
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(235, 235, 245, 0.4)" }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ejercicios..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl text-[15px] outline-none transition-all ios-focus"
                style={{
                  background: "rgba(118, 118, 128, 0.24)",
                  color: "rgba(235, 235, 245, 0.9)",
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-full active:scale-95"
                    style={{ background: "rgba(142, 142, 147, 0.6)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg text-[13px] font-medium transition-all active:scale-95 disabled:opacity-40"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#000000",
                  }}
                >
                  {loading ? "..." : "Buscar"}
                </button>
              </div>
            </form>

            <div className="flex items-center p-0.5 rounded-lg self-start" style={{ background: "rgba(118, 118, 128, 0.24)" }}>
              <button
                onClick={() => setViewMode("cards")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-medium transition-all"
                style={{
                  background: viewMode === "cards" ? "rgba(99, 99, 102, 0.8)" : "transparent",
                  color: "rgba(235, 235, 245, 0.9)",
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Tarjetas
              </button>
              <button
                onClick={() => setViewMode("json")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-medium transition-all"
                style={{
                  background: viewMode === "json" ? "rgba(99, 99, 102, 0.8)" : "transparent",
                  color: "rgba(235, 235, 245, 0.9)",
                }}
              >
                <Code2 className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-xl flex items-start gap-2.5 text-[13px]"
              style={{
                background: "rgba(255, 59, 48, 0.15)",
                border: "0.5px solid rgba(255, 59, 48, 0.4)",
                color: "#ff453a",
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rounded-xl h-52 animate-pulse"
                  style={{
                    background: "rgba(28, 28, 30, 0.4)",
                    border: "0.5px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              ))}
            </div>
          )}

          {!loading && apiData && (
            <>
              {viewMode === "cards" ? (
                apiData.results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {apiData.results.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onSelect={(item) => setSelectedExercise(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center py-16 rounded-2xl"
                    style={{
                      background: "rgba(28, 28, 30, 0.4)",
                      border: "0.5px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Dumbbell className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(235, 235, 245, 0.3)" }} />
                    <h4 className="text-[17px] font-semibold mb-1">Sin resultados</h4>
                    <p className="text-[13px] mb-4" style={{ color: "rgba(235, 235, 245, 0.5)" }}>
                      No se encontraron ejercicios para &quot;{activeQuery}&quot;
                    </p>
                    <button onClick={handleClear} className="text-[13px] font-medium" style={{ color: "#0a84ff" }}>
                      Limpiar búsqueda
                    </button>
                  </div>
                )
              ) : null}

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
      </main> : <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {storageReady && <WorkoutWorkspace view={activeSection} sessions={sessions} onSessionsChange={setSessions} onNavigateToWorkout={() => setActiveSection("workout")} />}
      </main>}

      <footer className="mt-12 py-6 border-t" style={{ borderColor: "rgba(84, 84, 88, 0.65)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[13px]" style={{ color: "rgba(235, 235, 245, 0.4)" }}>
            My Workout App · registro local · wger REST API
          </p>
        </div>
      </footer>

      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      <PwaOnboarding />
    </div>
  );
}
