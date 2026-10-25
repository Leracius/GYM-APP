"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import type { WgerExerciseInfo, WgerTranslation } from "@/types/wger";

const terms: Record<string, string> = {
  chest: "Pecho", back: "Espalda", legs: "Piernas", shoulders: "Hombros", arms: "Brazos", abs: "Abdomen",
  biceps: "Bíceps", triceps: "Tríceps", quadriceps: "Cuádriceps", glutes: "Glúteos", hamstrings: "Isquiotibiales",
  barbell: "Barra", dumbbell: "Mancuerna", kettlebell: "Pesa rusa", "body weight": "Peso corporal", "pull-up bar": "Barra de dominadas",
  bench: "Banco", machine: "Máquina", cable: "Polea", strength: "Fuerza", stretching: "Estiramiento",
};

function es(value?: string | null) {
  if (!value) return "Sin especificar";
  return terms[value.toLowerCase()] ?? value;
}

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export default function WgerExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<WgerExerciseInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/exercises/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el ejercicio.");
        return data as WgerExerciseInfo;
      })
      .then((data) => { if (active) setExercise(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Error al cargar el ejercicio."); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="mx-auto max-w-3xl px-4 py-8"><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--accent)]"><ArrowLeft size={17} />Volver a ejercicios</Link><p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p></main>;
  if (!exercise) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--text-secondary)]" role="status">Cargando ejercicio…</main>;

  const translation: WgerTranslation | undefined = exercise.translations.find((item) => item.language === 4);
  const exerciseName = translation?.name || `Ejercicio ${exercise.id}`;
  const description = translation?.description ? plainText(translation.description) : "No hay instrucciones disponibles en español para este ejercicio.";

  return <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-5 pb-12 sm:px-6 sm:py-8">
    <Link href="/?library=wger" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"><ArrowLeft size={17} />Volver a ejercicios</Link>
    <article className="mt-4 overflow-hidden rounded-3xl border border-[var(--separator)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
      <header className="border-b border-[var(--separator)] bg-[var(--surface-2)] p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--accent)]">Biblioteca wger</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{exerciseName}</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-[var(--app-bg)] px-3 py-1.5">{es(exercise.category?.name)}</span>
          {exercise.equipment.map((item) => <span key={item.id} className="rounded-full bg-[var(--app-bg)] px-3 py-1.5">{es(item.name)}</span>)}
        </div>
      </header>
      <div className="space-y-8 p-5 sm:p-8">
        <section><h2 className="text-lg font-semibold">Cómo hacerlo</h2><div className="mt-3 rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)] p-4 text-sm leading-7 text-[var(--text-secondary)] sm:p-6">{description}</div></section>
        <section><h2 className="text-lg font-semibold">Músculos principales</h2>{exercise.muscles.length ? <div className="mt-3 flex flex-wrap gap-2">{exercise.muscles.map((muscle) => <span key={muscle.id} className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-sm text-[var(--accent)]">{es(muscle.name)}</span>)}</div> : <p className="mt-2 text-sm text-[var(--text-secondary)]">No hay músculos especificados.</p>}</section>
        {exercise.muscles_secondary.length > 0 && <section><h2 className="text-lg font-semibold">Músculos secundarios</h2><div className="mt-3 flex flex-wrap gap-2">{exercise.muscles_secondary.map((muscle) => <span key={muscle.id} className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">{es(muscle.name)}</span>)}</div></section>}
      </div>
    </article>
    {!translation && <p className="mt-4 flex gap-2 text-xs leading-5 text-[var(--text-tertiary)]"><Dumbbell size={14} className="mt-0.5 shrink-0" />wger no ofrece una traducción al español para este ejercicio; se muestra un aviso en lugar de reemplazarla por contenido en inglés.</p>}
  </main>;
}
