"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Dumbbell, Search } from "lucide-react";
import type { GymFitExerciseSummary, GymFitSearchResponse } from "@/types/gymfit";

const valueTranslations: Record<string, string> = {
  chest: "Pecho", back: "Espalda", legs: "Piernas", shoulders: "Hombros",
  arms: "Brazos", core: "Zona media", quadriceps: "Cuádriceps", hamstrings: "Isquiotibiales",
  glutes: "Glúteos", biceps: "Bíceps", triceps: "Tríceps", calves: "Pantorrillas",
  barbell: "Barra", dumbbell: "Mancuerna", kettlebell: "Pesa rusa", "body weight": "Peso corporal",
  bodyweight: "Peso corporal", machine: "Máquina", cable: "Polea", bench: "Banco",
  beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado",
  strength: "Fuerza", compound: "Compuesto", isolation: "Aislado",
};

function spanishValue(value?: string | null) {
  if (!value) return "Sin especificar";
  return valueTranslations[value.toLowerCase()] ?? value;
}

function ExerciseResult({ exercise }: { exercise: GymFitExerciseSummary }) {
  return (
    <Link
      href={`/ejercicios/gymfit/${encodeURIComponent(exercise.slug || exercise.id)}`}
      className="group min-h-40 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--accent-border)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="flex h-full flex-col">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Dumbbell aria-hidden="true" /></span>
        <h2 className="text-base font-semibold leading-snug group-hover:text-[var(--accent)]">{exercise.name}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{spanishValue(exercise.bodyPart || exercise.primaryGroups?.[0])}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4 text-xs text-[var(--text-secondary)]">
          {exercise.equipment && <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">{spanishValue(exercise.equipment)}</span>}
          {exercise.difficulty && <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">{spanishValue(exercise.difficulty)}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function GymFitExerciseLibrary() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GymFitExerciseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const params = new URLSearchParams({ limit: "18" });
      if (query.trim()) params.set("query", query.trim());
      const response = await fetch(`/api/gymfit/exercises?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo buscar en GymFit API.");
      const payload = data as GymFitSearchResponse;
      setResults(payload.results ?? []);
      setTotal(payload.total ?? payload.count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al buscar ejercicios.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--separator)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)]"><ArrowLeft size={17} />Volver a wger</Link>
        <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">Fuente: GymFit API</span>
      </div>

      <section className="rounded-3xl border border-[var(--separator)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--accent)]">Biblioteca alternativa</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Compará ejercicios de GymFit</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Buscá por nombre, grupo muscular o equipamiento. Esta biblioteca funciona en paralelo a wger y conserva su propia fuente de datos.</p>
        <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="gymfit-search">Buscar ejercicios en GymFit</label>
          <input id="gymfit-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej.: press de banca, piernas, mancuerna" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" />
          <button disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-fill)] px-5 font-semibold text-[var(--accent-on-fill)] disabled:opacity-60"><Search size={18} />{loading ? "Buscando…" : "Buscar"}</button>
        </form>
      </section>

      {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {loading && <p role="status" className="py-10 text-center text-sm text-[var(--text-secondary)]">Buscando ejercicios…</p>}
      {!loading && searched && !error && <section className="mt-7">
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{total} resultados en GymFit API</p>
        {results.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{results.map((exercise) => <ExerciseResult key={exercise.id} exercise={exercise} />)}</div> : <div className="rounded-2xl border border-dashed border-[var(--separator)] p-10 text-center text-sm text-[var(--text-secondary)]">No encontramos ejercicios para esa búsqueda.</div>}
        <p className="mt-5 text-xs leading-5 text-[var(--text-tertiary)]">Los títulos, controles y categorías comunes están en español. La API no documenta contenido localizado, por lo que algunas descripciones pueden venir en su idioma original.</p>
      </section>}
    </main>
  );
}
