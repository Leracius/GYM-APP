"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Dumbbell, Search } from "lucide-react";
import type {
  GymFitExerciseSummary,
  GymFitFacet,
  GymFitMuscle,
  GymFitMuscleGroup,
  GymFitMuscleSearchResponse,
  GymFitSearchResponse,
  GymFitSuggestionResponse,
} from "@/types/gymfit";

type FilterState = {
  equipment: string;
  muscleGroup: string;
  difficulty: string;
  type: string;
  sort: string;
};
const emptyFilters: FilterState = {
  equipment: "",
  muscleGroup: "",
  difficulty: "",
  type: "",
  sort: "relevance",
};
const translations: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  legs: "Piernas",
  shoulders: "Hombros",
  arms: "Brazos",
  core: "Zona media",
  quadriceps: "Cuádriceps",
  hamstrings: "Isquiotibiales",
  glutes: "Glúteos",
  biceps: "Bíceps",
  triceps: "Tríceps",
  calves: "Pantorrillas",
  barbell: "Barra",
  dumbbell: "Mancuerna",
  kettlebell: "Pesa rusa",
  "body weight": "Peso corporal",
  bodyweight: "Peso corporal",
  machine: "Máquina",
  cable: "Polea",
  bench: "Banco",
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  strength: "Fuerza",
  compound: "Compuesto",
  isolation: "Aislado",
  popularity: "Popularidad",
  relevance: "Relevancia",
  name: "Nombre",
  difficulty: "Dificultad",
};

function es(value?: string | null) {
  if (!value) return "Sin especificar";
  return translations[value.toLowerCase()] ?? value;
}

function ExerciseResult({ exercise }: { exercise: GymFitExerciseSummary }) {
  const href = `/ejercicios/gymfit/${encodeURIComponent(exercise.slug || exercise.id)}`;
  return (
    <Link
      href={href}
      className="group min-h-40 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--accent-border)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="flex h-full flex-col">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Dumbbell aria-hidden="true" />
        </span>
        <h3 className="text-base font-semibold leading-snug group-hover:text-[var(--accent)]">
          {exercise.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {es(exercise.bodyPart || exercise.primaryGroups?.[0])}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4 text-xs text-[var(--text-secondary)]">
          {exercise.equipment && (
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">
              {es(exercise.equipment)}
            </span>
          )}
          {exercise.difficulty && (
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">
              {es(exercise.difficulty)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: GymFitFacet[];
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="min-h-11 rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-3 text-sm text-[var(--text-primary)] disabled:opacity-50"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {es(option.value)} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

export function GymFitExerciseLibrary() {
  const [view, setView] = useState<"exercises" | "muscles">("exercises");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    GymFitSuggestionResponse["results"]
  >([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [results, setResults] = useState<GymFitExerciseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [facets, setFacets] = useState<GymFitSearchResponse["facets"]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<GymFitMuscleGroup[]>([]);
  const [muscleGroup, setMuscleGroup] = useState("");
  const [muscleQuery, setMuscleQuery] = useState("");
  const [muscles, setMuscles] = useState<GymFitMuscle[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<GymFitMuscle | null>(
    null,
  );
  const [muscleExercises, setMuscleExercises] = useState<
    GymFitExerciseSummary[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/gymfit/muscle-groups", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data as GymFitMuscleGroup[];
      })
      .then(setMuscleGroups)
      .catch((err: unknown) => {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los grupos musculares.",
          );
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(
        `/api/gymfit/exercises/suggest?q=${encodeURIComponent(normalized)}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return data as GymFitSuggestionResponse;
        })
        .then((data) => {
          setSuggestions(data.results ?? []);
          setSuggestionsOpen(true);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  async function searchExercises(
    term = query,
    nextOffset = 0,
    activeFilters = filters,
  ) {
    setLoading(true);
    setError("");
    setSearched(true);
    setOffset(nextOffset);
    setSuggestionsOpen(false);
    try {
      const params = new URLSearchParams({
        limit: "18",
        offset: String(nextOffset),
        facets: "true",
      });
      if (term.trim()) params.set("query", term.trim());
      for (const [key, value] of Object.entries(activeFilters))
        if (value) params.set(key, value);
      const response = await fetch(`/api/gymfit/exercises?${params}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudo buscar en GymFit API.");
      const payload = data as GymFitSearchResponse;
      setResults(payload.results ?? []);
      setTotal(payload.total ?? 0);
      setFacets(payload.facets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al buscar ejercicios.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchMuscles(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setSelectedMuscle(null);
    setMuscleExercises([]);
    try {
      const params = new URLSearchParams({ limit: "24" });
      if (muscleQuery.trim()) params.set("query", muscleQuery.trim());
      if (muscleGroup) params.set("group", muscleGroup);
      const response = await fetch(`/api/gymfit/muscles?${params}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudieron buscar músculos.");
      setMuscles((data as GymFitMuscleSearchResponse).results ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar músculos.",
      );
      setMuscles([]);
    }
  }

  async function selectMuscle(muscle: GymFitMuscle) {
    setSelectedMuscle(muscle);
    setError("");
    try {
      const [detailResponse, exercisesResponse] = await Promise.all([
        fetch(`/api/gymfit/muscles/${encodeURIComponent(muscle.id)}`),
        fetch(
          `/api/gymfit/muscles/${encodeURIComponent(muscle.id)}/exercises?limit=18`,
        ),
      ]);
      const [detail, exerciseData] = await Promise.all([
        detailResponse.json(),
        exercisesResponse.json(),
      ]);
      if (!detailResponse.ok)
        throw new Error(detail.error || "No se pudo cargar el músculo.");
      if (!exercisesResponse.ok)
        throw new Error(
          exerciseData.error || "No se pudieron cargar los ejercicios.",
        );
      setSelectedMuscle(detail as GymFitMuscle);
      setMuscleExercises((exerciseData as GymFitSearchResponse).results ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al abrir el músculo.",
      );
    }
  }

  const optionFacets = facets ?? {
    equipment: [],
    muscleGroup: [],
    difficulty: [],
    category: [],
    tier: [],
  };
  const totalPages = Math.max(1, Math.ceil(total / 18));

  return (
    <main className="gymfit-page mx-auto min-h-[75vh] w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <div className="mb-9 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/?library=wger"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          <ArrowLeft size={17} />
          Biblioteca wger
        </Link>
        <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
          Fuente: GymFit API
        </span>
      </div>
      <header className="border-b border-[var(--separator)] pb-7">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--accent)]">
          Biblioteca de ejercicios
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          GymFit
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          Buscá ejercicios con sugerencias, filtros detallados y exploración por
          músculos.
        </p>
        <div
          className="gymfit-tabs mt-7 flex w-full max-w-sm items-center gap-1 border-b border-[var(--separator)]"
          role="tablist"
          aria-label="Tipo de exploración"
        >
          <button
            role="tab"
            aria-selected={view === "exercises"}
            onClick={() => setView("exercises")}
            className={`min-h-12 flex-1 border-b-2 px-3 text-center text-sm font-semibold transition ${view === "exercises" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-secondary)]"}`}
          >
            Ejercicios
          </button>
          <button
            role="tab"
            aria-selected={view === "muscles"}
            onClick={() => setView("muscles")}
            className={`min-h-12 flex-1 border-b-2 px-3 text-center text-sm font-semibold transition ${view === "muscles" ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-secondary)]"}`}
          >
            Músculos
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {view === "exercises" ? (
        <section className="mt-7">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void searchExercises();
            }}
            className="gymfit-search relative flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <label className="sr-only" htmlFor="gymfit-search">
                Buscar ejercicios en GymFit
              </label>
              <input
                id="gymfit-search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen && suggestions.length > 0}
                aria-controls="gymfit-suggestions"
                autoComplete="off"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  if (value.trim().length < 2) {
                    setSuggestions([]);
                    setSuggestionsOpen(false);
                  }
                }}
                onFocus={() => suggestions.length && setSuggestionsOpen(true)}
                onBlur={() =>
                  window.setTimeout(() => setSuggestionsOpen(false), 120)
                }
                placeholder="Ej.: press de banca, piernas, mancuerna"
                className="min-h-12 w-full rounded-xl border border-[var(--separator)] bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              {suggestionsOpen && suggestions.length > 0 && (
                <ul
                  id="gymfit-suggestions"
                  role="listbox"
                  className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[var(--separator)] bg-[var(--surface)] p-1 shadow-xl"
                >
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQuery(suggestion.name);
                          setSuggestionsOpen(false);
                          void searchExercises(suggestion.name);
                        }}
                        className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-[var(--surface-2)]"
                      >
                        <span>{suggestion.name}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {es(suggestion.equipment)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-fill)] px-5 font-semibold text-[var(--accent-on-fill)] disabled:opacity-60"
            >
              <Search size={18} />
              {loading ? "Buscando…" : "Buscar"}
            </button>
          </form>
          <details className="mt-5 border-y border-[var(--separator)] py-1">
            <summary className="cursor-pointer py-3 text-sm font-semibold text-[var(--text-primary)]">
              Filtros y orden
            </summary>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <FilterSelect
                label="Equipamiento"
                value={filters.equipment}
                options={optionFacets.equipment}
                disabled={!facets}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, equipment: value }))
                }
              />
              <FilterSelect
                label="Grupo muscular"
                value={filters.muscleGroup}
                options={optionFacets.muscleGroup}
                disabled={!facets}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, muscleGroup: value }))
                }
              />
              <FilterSelect
                label="Dificultad"
                value={filters.difficulty}
                options={optionFacets.difficulty}
                disabled={!facets}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, difficulty: value }))
                }
              />
              <label className="grid gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                Tipo
                <select
                  value={filters.type}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                  className="min-h-11 rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-3 text-sm text-[var(--text-primary)]"
                >
                  <option value="">Todos</option>
                  <option value="compound">Compuesto</option>
                  <option value="isolation">Aislado</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                Ordenar por
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      sort: event.target.value,
                    }))
                  }
                  className="min-h-11 rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-3 text-sm text-[var(--text-primary)]"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="popularity">Popularidad</option>
                  <option value="name">Nombre</option>
                  <option value="difficulty">Dificultad</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilters(emptyFilters);
                void searchExercises(query, 0, emptyFilters);
              }}
              className="mt-4 min-h-10 rounded-lg px-3 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            >
              Limpiar filtros
            </button>
          </details>
          {loading && (
            <p
              role="status"
              className="py-10 text-center text-sm text-[var(--text-secondary)]"
            >
              Buscando ejercicios…
            </p>
          )}
          {!loading && searched && (
            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--text-secondary)]">
                <span>{total} resultados en GymFit</span>
                {totalPages > 1 && (
                  <span>
                    Página {Math.floor(offset / 18) + 1} de {totalPages}
                  </span>
                )}
              </div>
              {results.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((exercise) => (
                    <ExerciseResult key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--separator)] p-10 text-center text-sm text-[var(--text-secondary)]">
                  No encontramos ejercicios para esos criterios.
                </div>
              )}
              <div className="mt-5 flex justify-between">
                <button
                  disabled={offset === 0}
                  onClick={() =>
                    void searchExercises(query, Math.max(0, offset - 18))
                  }
                  className="min-h-11 rounded-xl border border-[var(--separator)] px-4 text-sm disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  disabled={offset + 18 >= total}
                  onClick={() => void searchExercises(query, offset + 18)}
                  className="min-h-11 rounded-xl border border-[var(--separator)] px-4 text-sm disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          <p className="mt-5 text-xs leading-5 text-[var(--text-tertiary)]">
            Las sugerencias empiezan desde dos caracteres. GymFit entrega
            instrucciones en el idioma original; su especificación no incluye
            traducciones.
          </p>
        </section>
      ) : (
        <section className="mt-7">
          <form
            onSubmit={(event) => void searchMuscles(event)}
            className="gymfit-muscle-search grid gap-3 border-y border-[var(--separator)] py-5 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="grid gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              Buscar músculo
              <input
                value={muscleQuery}
                onChange={(event) => setMuscleQuery(event.target.value)}
                placeholder="Ej.: pectorales, cuádriceps"
                className="min-h-11 rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-3 text-sm text-[var(--text-primary)]"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              Grupo muscular
              <select
                value={muscleGroup}
                onChange={(event) => setMuscleGroup(event.target.value)}
                className="min-h-11 rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-3 text-sm text-[var(--text-primary)]"
              >
                <option value="">Todos los grupos</option>
                {muscleGroups.map((group) => (
                  <option key={group.id} value={group.name}>
                    {es(group.name)}
                  </option>
                ))}
              </select>
            </label>
            <button className="min-h-11 self-end rounded-xl bg-[var(--accent-fill)] px-5 text-sm font-semibold text-[var(--accent-on-fill)]">
              Buscar músculos
            </button>
          </form>
          {muscles.length > 0 && !selectedMuscle && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {muscles.map((muscle) => (
                <button
                  key={muscle.id}
                  onClick={() => void selectMuscle(muscle)}
                  className="min-h-20 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-4 text-left hover:border-[var(--accent-border)]"
                >
                  <span className="block font-semibold">
                    {muscle.commonName || es(muscle.name)}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                    {es(muscle.group || muscle.bodyPart)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedMuscle && (
            <div className="mt-5 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-5 sm:p-6">
              <button
                onClick={() => {
                  setSelectedMuscle(null);
                  setMuscleExercises([]);
                }}
                className="min-h-10 text-sm font-medium text-[var(--accent)]"
              >
                ← Volver a músculos
              </button>
              <h2 className="mt-2 text-2xl font-bold">
                {selectedMuscle.commonName || es(selectedMuscle.name)}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {es(selectedMuscle.group || selectedMuscle.bodyPart)}
              </p>
              {selectedMuscle.heads?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedMuscle.heads.map((head) => (
                    <span
                      key={head}
                      className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      {head}
                    </span>
                  ))}
                </div>
              ) : null}
              <h3 className="mt-6 text-lg font-semibold">
                Ejercicios para este músculo
              </h3>
              {muscleExercises.length ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {muscleExercises.map((exercise) => (
                    <ExerciseResult key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  No encontramos ejercicios para este músculo.
                </p>
              )}
            </div>
          )}
          {view === "muscles" && muscles.length === 0 && !selectedMuscle && (
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Buscá un músculo o elegí un grupo para empezar.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
