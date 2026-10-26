"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Dumbbell,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  ChevronRight,
  Maximize2,
  Share2,
} from "lucide-react";
import type { WgerExerciseInfo, WgerTranslation } from "@/types/wger";

const terms: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  legs: "Piernas",
  shoulders: "Hombros",
  arms: "Brazos",
  abs: "Abdomen",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Cuádriceps",
  glutes: "Glúteos",
  hamstrings: "Isquiotibiales",
  barbell: "Barra",
  dumbbell: "Mancuerna",
  kettlebell: "Pesa rusa",
  "body weight": "Peso corporal",
  bodyweight: "Peso corporal",
  "pull-up bar": "Barra de dominadas",
  bench: "Banco",
  machine: "Máquina",
  cable: "Polea",
  strength: "Fuerza",
  stretching: "Estiramiento",
  cardio: "Cardio",
};

function es(value?: string | null) {
  if (!value) return "Sin especificar";
  return terms[value.toLowerCase()] ?? value;
}

function cleanHtml(value: string) {
  return value
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function WgerExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<WgerExerciseInfo | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"instructions" | "muscles" | "media">("instructions");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/exercises/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el ejercicio.");
        return data as WgerExerciseInfo;
      })
      .then((data) => {
        if (active) setExercise(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Error al cargar el ejercicio.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/?library=wger"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={18} />
          Volver a ejercicios
        </Link>
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300"
        >
          <p className="font-semibold text-red-200">No se pudo cargar la información:</p>
          <p className="mt-1">{error}</p>
        </div>
      </main>
    );
  }

  if (!exercise) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] animate-pulse">
          <Dumbbell size={24} />
        </div>
        <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
          Cargando detalles del ejercicio…
        </p>
      </main>
    );
  }

  // Translation lookup (Spanish first, then English, then first available)
  const translationEs: WgerTranslation | undefined = exercise.translations.find((t) => t.language === 4);
  const translationEn: WgerTranslation | undefined = exercise.translations.find((t) => t.language === 2);
  const activeTranslation = translationEs || translationEn || exercise.translations[0];

  const exerciseName = activeTranslation?.name || `Ejercicio #${exercise.id}`;
  const rawDescription = activeTranslation?.description || "";
  const cleanedDesc = cleanHtml(rawDescription);

  const images = exercise.images && exercise.images.length > 0 ? exercise.images : [];
  const currentImage = images[selectedImageIndex] || images[0];
  const currentImageUrl = currentImage?.thumbnails?.medium || currentImage?.image;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-5 pb-16 sm:px-6 sm:py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/?library=wger"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Volver a ejercicios</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
          <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">ID #{exercise.id}</span>
          <span className="hidden sm:inline">wger v2</span>
        </div>
      </div>

      {/* Main Container Card */}
      <article className="mt-4 overflow-hidden rounded-3xl border border-[var(--separator)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
        {/* HERO SECTION: Title + Gallery / Visual Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--separator)]">
          {/* Header Info Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[var(--surface-2)] to-transparent">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  {es(exercise.category?.name)}
                </span>
                {exercise.equipment?.map((eq) => (
                  <span
                    key={eq.id}
                    className="rounded-full bg-[var(--surface-2)] border border-[var(--separator)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {es(eq.name)}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl leading-tight">
                {exerciseName}
              </h1>

              {translationEs && translationEn && translationEs.name !== translationEn.name && (
                <p className="mt-1 text-sm font-medium text-[var(--text-tertiary)]">
                  Nombre original en inglés: <span className="text-[var(--text-secondary)]">{translationEn.name}</span>
                </p>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)]/60 p-3 sm:p-4 backdrop-blur-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Categoría</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)] truncate">{es(exercise.category?.name)}</p>
              </div>
              <div className="border-l border-[var(--separator)] pl-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Músculos</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--accent)]">
                  {exercise.muscles?.length || 0} princ.
                  {exercise.muscles_secondary?.length ? ` + ${exercise.muscles_secondary.length}` : ""}
                </p>
              </div>
              <div className="border-l border-[var(--separator)] pl-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Imágenes</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{images.length}</p>
              </div>
            </div>
          </div>

          {/* Media / Main Photo Showcase Column */}
          <div className="lg:col-span-5 relative flex flex-col justify-center items-center bg-[#070707] min-h-[300px] sm:min-h-[360px] border-t lg:border-t-0 lg:border-l border-[var(--separator)] p-6">
            {currentImageUrl ? (
              <div className="w-full flex flex-col items-center justify-center">
                <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-white/5 p-4 shadow-inner group">
                  <img
                    src={currentImageUrl}
                    alt={exerciseName}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  {currentImage?.is_main && (
                    <span className="absolute top-3 left-3 rounded-md bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                      Vista principal
                    </span>
                  )}
                  <a
                    href={currentImage?.image}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-white border border-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Ver imagen completa"
                  >
                    <Maximize2 size={14} />
                  </a>
                </div>

                {/* Thumbnails row if more than 1 image */}
                {images.length > 1 && (
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto max-w-full py-1">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border p-1 bg-black/60 transition-all ${
                          selectedImageIndex === idx
                            ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
                            : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.thumbnails?.small || img.thumbnails?.medium || img.image}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-[var(--text-tertiary)]">
                <div className="h-16 w-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-tertiary)] mb-3">
                  <Dumbbell size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">Sin imagen disponible</p>
                <p className="mt-1 text-xs max-w-xs text-[var(--text-tertiary)]">
                  wger aún no dispone de capturas ilustradas para este ejercicio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[var(--separator)] bg-[var(--surface-2)]/60 px-6 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("instructions")}
            className={`py-3.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 tracking-wider shrink-0 ${
              activeTab === "instructions"
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Info size={15} />
            01 / INSTRUCCIONES Y EJECUCIÓN
          </button>
          <button
            onClick={() => setActiveTab("muscles")}
            className={`py-3.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 tracking-wider shrink-0 ${
              activeTab === "muscles"
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Activity size={15} />
            02 / ANATOMÍA Y MÚSCULOS ({exercise.muscles?.length || 0})
          </button>
          {images.length > 0 && (
            <button
              onClick={() => setActiveTab("media")}
              className={`py-3.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 tracking-wider shrink-0 ${
                activeTab === "media"
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Layers size={15} />
              03 / GALERÍA ({images.length})
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* TAB 1: INSTRUCTIONS & EXECUTION */}
          {activeTab === "instructions" && (
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles size={18} className="text-[var(--accent)]" />
                    Técnica y paso a paso
                  </h2>
                  {translationEs ? (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      ✓ En español
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      Idioma original
                    </span>
                  )}
                </div>

                <div className="mt-3 rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)] p-5 sm:p-6 text-sm leading-7 text-[var(--text-secondary)] shadow-sm">
                  {cleanedDesc ? (
                    <div className="whitespace-pre-line space-y-4 font-sans text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
                      {cleanedDesc}
                    </div>
                  ) : (
                    <p className="text-sm italic text-[var(--text-tertiary)]">
                      No hay descripción detallada registrada para este ejercicio.
                    </p>
                  )}
                </div>
              </section>

              {/* Equipment detail box */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Equipamiento requerido
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {exercise.equipment && exercise.equipment.length > 0 ? (
                    exercise.equipment.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm"
                      >
                        <Dumbbell size={16} className="text-[var(--accent)]" />
                        <span>{es(item.name)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)]">
                      Peso corporal (sin equipamiento adicional)
                    </div>
                  )}
                </div>
              </section>

              {/* Available translations summary */}
              {exercise.translations && exercise.translations.length > 1 && (
                <section className="pt-4 border-t border-[var(--separator)]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Otras traducciones disponibles en la API ({exercise.translations.length})
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {exercise.translations.map((tr) => (
                      <span
                        key={tr.id}
                        className="rounded-lg border border-[var(--separator)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                      >
                        {tr.name} <span className="text-[var(--text-tertiary)]">({tr.language === 4 ? "ES" : tr.language === 2 ? "EN" : `L${tr.language}`})</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: ANATOMY & MUSCLES */}
          {activeTab === "muscles" && (
            <div className="space-y-8">
              {/* Primary Muscles */}
              <section>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Músculos Principales ({exercise.muscles?.length || 0})
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Grupos musculares que realizan la mayor parte de la fuerza y tensión durante el movimiento.
                </p>

                {exercise.muscles && exercise.muscles.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {exercise.muscles.map((muscle) => (
                      <div
                        key={muscle.id}
                        className="flex items-center gap-3.5 rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-2)] p-3.5 shadow-sm"
                      >
                        {muscle.image_url_main ? (
                          <div className="h-16 w-16 shrink-0 rounded-xl bg-black/60 border border-white/5 p-1 flex items-center justify-center overflow-hidden">
                            <img
                              src={muscle.image_url_main}
                              alt={muscle.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                            <Activity size={24} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">
                            {muscle.name_en || es(muscle.name)}
                          </p>
                          <p className="text-xs italic text-[var(--accent)] font-mono">
                            {muscle.name}
                          </p>
                          <span className="mt-1 inline-block text-[10px] uppercase font-semibold text-[var(--text-tertiary)] bg-[var(--app-bg)] px-2 py-0.5 rounded">
                            {muscle.is_front ? "Vista Frontal" : "Vista Posterior"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-tertiary)] italic">
                    No se especificaron músculos primarios.
                  </p>
                )}
              </section>

              {/* Secondary Muscles */}
              {exercise.muscles_secondary && exercise.muscles_secondary.length > 0 && (
                <section className="pt-4 border-t border-[var(--separator)]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-secondary)]" />
                    <h2 className="text-base font-bold text-[var(--text-primary)]">
                      Músculos Secundarios ({exercise.muscles_secondary.length})
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Músculos estabilizadores o sinergistas que asisten durante la ejecución.
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {exercise.muscles_secondary.map((sm) => (
                      <div
                        key={sm.id}
                        className="flex items-center gap-3.5 rounded-2xl border border-[var(--separator)] bg-[var(--surface-2)] p-3.5"
                      >
                        {sm.image_url_secondary ? (
                          <div className="h-14 w-14 shrink-0 rounded-xl bg-black/60 border border-white/5 p-1 flex items-center justify-center overflow-hidden">
                            <img
                              src={sm.image_url_secondary}
                              alt={sm.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-14 shrink-0 rounded-xl bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-secondary)]">
                            <Activity size={20} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {sm.name_en || es(sm.name)}
                          </p>
                          <p className="text-xs italic text-[var(--text-tertiary)] font-mono">{sm.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA GALLERY */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Imágenes y diagramas ({images.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div
                    key={img.id || i}
                    className="overflow-hidden rounded-2xl border border-[var(--separator)] bg-[#070707] flex flex-col group shadow-sm"
                  >
                    <div className="relative aspect-square flex items-center justify-center p-4 bg-black/50">
                      <img
                        src={img.thumbnails?.medium || img.image}
                        alt=""
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {img.is_main && (
                        <span className="absolute top-2 left-2 rounded-md bg-[var(--accent-fill)] text-[var(--accent-on-fill)] px-2 py-0.5 text-[10px] font-bold uppercase">
                          Principal
                        </span>
                      )}
                      <a
                        href={img.image}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 transition-colors"
                        title="Abrir en tamaño completo"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <div className="p-3 bg-[var(--surface-2)] text-xs text-[var(--text-secondary)] flex items-center justify-between border-t border-[var(--separator)]">
                      <span>Clip #{img.id}</span>
                      {img.is_ai_generated && (
                        <span className="text-[10px] text-[var(--accent)] font-semibold">Generado 3D</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Footer Disclaimer */}
      {!translationEs && (
        <p className="mt-4 flex gap-2 text-xs leading-5 text-[var(--text-tertiary)]">
          <Dumbbell size={14} className="mt-0.5 shrink-0" />
          wger no ofrece una traducción oficial al español para este ejercicio específico; se muestra la información en idioma original para no perder las instrucciones clave.
        </p>
      )}
    </main>
  );
}
