"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import Image from "next/image";
import type { GymFitAlternative, GymFitExerciseDetail, GymFitExerciseSummary, GymFitProgression } from "@/types/gymfit";

const translations: Record<string, string> = {
  chest: "Pecho", back: "Espalda", legs: "Piernas", shoulders: "Hombros", arms: "Brazos", core: "Zona media",
  quadriceps: "Cuádriceps", hamstrings: "Isquiotibiales", glutes: "Glúteos", biceps: "Bíceps", triceps: "Tríceps",
  calves: "Pantorrillas", barbell: "Barra", dumbbell: "Mancuerna", kettlebell: "Pesa rusa", "body weight": "Peso corporal",
  bodyweight: "Peso corporal", machine: "Máquina", cable: "Polea", bench: "Banco", beginner: "Principiante",
  intermediate: "Intermedio", advanced: "Avanzado", strength: "Fuerza", compound: "Compuesto", isolation: "Aislado",
};

function es(value?: string | null) {
  if (!value) return "Sin especificar";
  return translations[value.toLowerCase()] ?? value;
}

export default function GymFitExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<GymFitExerciseDetail | null>(null);
  const [alternatives, setAlternatives] = useState<GymFitAlternative[]>([]);
  const [heatmapView, setHeatmapView] = useState<"front" | "back">("front");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/gymfit/exercises/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el ejercicio.");
        return data as GymFitExerciseDetail;
      })
      .then(async (data) => {
        if (!active) return;
        setExercise(data);
        try {
          const response = await fetch(`/api/gymfit/exercises/${encodeURIComponent(id)}/alternatives`);
          if (response.ok) setAlternatives(await response.json() as GymFitAlternative[]);
        } catch { /* Las alternativas son complementarias al detalle principal. */ }
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Error al cargar el ejercicio."); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="mx-auto max-w-3xl px-4 py-8"><Link href="/gymfit" className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--accent)]"><ArrowLeft size={17} />Volver a la búsqueda</Link><p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p></main>;
  if (!exercise) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--text-secondary)]" role="status">Cargando ejercicio…</main>;

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-5 pb-12 sm:px-6 sm:py-8">
    <Link href="/gymfit" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"><ArrowLeft size={17} />Volver a resultados</Link>
    <article className="mt-4 overflow-hidden rounded-3xl border border-[var(--separator)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
      <header className="border-b border-[var(--separator)] bg-[var(--surface-2)] p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--accent)]">GymFit API · Detalle del ejercicio</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{exercise.name}</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-[var(--app-bg)] px-3 py-1.5">{es(exercise.bodyPart)}</span>
          <span className="rounded-full bg-[var(--app-bg)] px-3 py-1.5">{es(exercise.equipment)}</span>
          {exercise.difficulty && <span className="rounded-full bg-[var(--app-bg)] px-3 py-1.5">{es(exercise.difficulty)}</span>}
        </div>
      </header>
      <div className="space-y-8 p-5 sm:p-8">
        {exercise.description && <section><h2 className="text-lg font-semibold">Acerca del ejercicio</h2><p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{exercise.description}</p></section>}
        <section><h2 className="text-lg font-semibold">Cómo hacerlo</h2>{exercise.instructions.length ? <ol className="mt-4 space-y-3">{exercise.instructions.map((step) => <li key={step.order} className="flex gap-3 rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)] p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">{step.order}</span><p className="pt-1 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p></li>)}</ol> : <p className="mt-2 text-sm text-[var(--text-secondary)]">No hay instrucciones disponibles.</p>}</section>
        {exercise.targetMuscles.length > 0 && <section><h2 className="text-lg font-semibold">Músculos principales</h2><div className="mt-3 flex flex-wrap gap-2">{exercise.targetMuscles.map((muscle) => <span key={muscle.id} className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-sm text-[var(--accent)]">{muscle.commonName || es(muscle.name)}</span>)}</div></section>}
        {exercise.secondaryMuscles.length > 0 && <section><h2 className="text-lg font-semibold">Músculos secundarios</h2><div className="mt-3 flex flex-wrap gap-2">{exercise.secondaryMuscles.map((muscle) => <span key={muscle.id} className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">{muscle.commonName || es(muscle.name)}</span>)}</div></section>}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Mapa muscular</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Naranja: músculo principal · Azul: músculos secundarios</p></div>
            <div className="inline-flex rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] p-1"><button onClick={() => setHeatmapView("front")} aria-pressed={heatmapView === "front"} className={`min-h-10 rounded-lg px-3 text-sm ${heatmapView === "front" ? "bg-[var(--accent-fill)] text-[var(--accent-on-fill)]" : "text-[var(--text-secondary)]"}`}>Frente</button><button onClick={() => setHeatmapView("back")} aria-pressed={heatmapView === "back"} className={`min-h-10 rounded-lg px-3 text-sm ${heatmapView === "back" ? "bg-[var(--accent-fill)] text-[var(--accent-on-fill)]" : "text-[var(--text-secondary)]"}`}>Espalda</button></div>
          </div>
          <div className="mt-4 flex justify-center rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)] p-3"><Image src={`/api/gymfit/exercises/${encodeURIComponent(id)}/heatmap?view=${heatmapView}`} alt={`Mapa de músculos trabajados, vista de ${heatmapView === "front" ? "frente" : "espalda"}`} width={560} height={420} unoptimized className="max-h-[420px] w-full object-contain" /></div>
        </section>
        <ProgressionSection title="Más fácil" items={exercise.easier ?? []} />
        <ProgressionSection title="Más difícil" items={exercise.harder ?? []} />
        {alternatives.length > 0 && <section><h2 className="text-lg font-semibold">Ejercicios alternativos</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Opciones parecidas según los músculos y el patrón de movimiento.</p><RelatedExercises items={alternatives} /></section>}
        {exercise.variations?.length ? <section><h2 className="text-lg font-semibold">Variantes</h2><RelatedExercises items={exercise.variations} /></section> : null}
        {exercise.tips?.length ? <section><h2 className="text-lg font-semibold">Consejos</h2><ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-[var(--text-secondary)]">{exercise.tips.map((tip, index) => <li key={`${tip}-${index}`}>{tip}</li>)}</ul></section> : null}
        {exercise.mistakes?.length ? <section><h2 className="text-lg font-semibold">Errores frecuentes</h2><ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-[var(--text-secondary)]">{exercise.mistakes.map((mistake, index) => <li key={`${mistake}-${index}`}>{mistake}</li>)}</ul></section> : null}
      </div>
    </article>
    <div className="mt-5 flex items-center gap-2 text-xs text-[var(--text-tertiary)]"><Dumbbell size={14} />La fuente GymFit no ofrece idioma español en su especificación; el texto descriptivo conserva el idioma de origen.</div>
  </main>;
}

function RelatedExercises({ items }: { items: Array<GymFitExerciseSummary & { score?: number; reasons?: string[] }> }) {
  return <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{items.map((item) => <Link key={item.id} href={`/ejercicios/gymfit/${encodeURIComponent(item.slug || item.id)}`} className="rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)] p-4 transition hover:border-[var(--accent-border)]"><span className="font-semibold">{item.name}</span>{item.equipment && <span className="mt-1 block text-sm text-[var(--text-secondary)]">{es(item.equipment)}</span>}{item.score !== undefined && <span className="mt-2 block text-xs text-[var(--accent)]">Coincidencia: {Math.round(item.score * 100)}%</span>}{item.reasons?.length ? <span className="mt-1 block text-xs text-[var(--text-tertiary)]">{item.reasons.map((reason) => es(reason)).join(" · ")}</span> : null}</Link>)}</div>;
}

function ProgressionSection({ title, items }: { title: string; items: GymFitProgression[] }) {
  if (!items.length) return null;
  return <section><h2 className="text-lg font-semibold">Progresión: {title}</h2><RelatedExercises items={items} /></section>;
}
