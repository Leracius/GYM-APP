"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Dumbbell, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { WgerExerciseInfo } from "@/types/wger";
import { createId } from "@/lib/workout-log";
import { createRoutine, RoutineDraft, RoutineExercise, WorkoutRoutine } from "@/lib/routines";

type Props = {
  routines: WorkoutRoutine[];
  onRoutinesChange: (routines: WorkoutRoutine[]) => void;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  hasActiveSession: boolean;
};

const panel = "app-panel rounded-xl border border-[var(--separator)] bg-[var(--surface)] shadow-[var(--card-shadow)]";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)]";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent-fill)] px-4 text-sm font-semibold text-[var(--accent-on-fill)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
const input = "min-h-12 w-full rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]";

function label(exercise: WgerExerciseInfo) {
  return exercise.translations.find((item) => item.language === 4)?.name
    || exercise.translations.find((item) => item.language === 2)?.name
    || exercise.translations[0]?.name
    || `Ejercicio #${exercise.id}`;
}

export function RoutineWorkspace({ routines, onRoutinesChange, onStartRoutine, hasActiveSession }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WgerExerciseInfo[]>([]);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [setCount, setSetCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/exercises?search=${encodeURIComponent(query.trim())}&limit=6`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo consultar wger.");
        setSuggestions(data.results ?? []);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "No se pudieron buscar ejercicios.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  useEffect(() => {
    if (searchOpen) document.getElementById("routine-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchOpen]);

  function resetEditor() {
    setEditingId(null); setName(""); setQuery(""); setSuggestions([]); setExercises([]); setError(""); setSearchOpen(false);
  }

  function editRoutine(routine: WorkoutRoutine) {
    setEditingId(routine.id); setName(routine.name); setExercises(routine.exercises.map((item) => ({ ...item })));
    setQuery(""); setSuggestions([]); setError(""); setSearchOpen(true);
  }

  function addExercise(exercise: WgerExerciseInfo) {
    setExercises((current) => [...current, { id: createId(), name: label(exercise), wgerId: exercise.id, setCount }]);
    setQuery(""); setSuggestions([]); setError("");
  }

  function saveRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) { setError("Escribí un nombre para la rutina."); return; }
    if (!exercises.length) { setError("Agregá al menos un ejercicio de wger."); return; }
    const draft: RoutineDraft = { name: name.trim(), exercises };
    if (editingId) {
      onRoutinesChange(routines.map((routine) => routine.id === editingId ? { ...routine, ...draft, updatedAt: new Date().toISOString() } : routine));
    } else {
      onRoutinesChange([createRoutine(draft), ...routines]);
    }
    resetEditor();
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    setExercises((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return <div className="space-y-6">
    <section className={`${panel} p-5 sm:p-8`}>
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[var(--accent)]">Plantillas de entrenamiento</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold sm:text-4xl">Tus rutinas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Guardá ejercicios de wger y cuántas series vas a hacer. Al iniciar, cada sesión será una copia independiente para registrar tus pesos.</p></div>
        {!searchOpen && <button className={primary} onClick={() => { resetEditor(); setSearchOpen(true); }}><Plus size={17} />Crear rutina</button>}
      </div>
    </section>

    {searchOpen && <section id="routine-editor" className={`${panel} scroll-mt-24 p-5 sm:p-7`}>
      <div className="mb-5 flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--accent)]">{editingId ? "Editar plantilla" : "Nueva plantilla"}</p><h2 className="mt-1 text-xl font-semibold">{editingId ? "Actualizá tu rutina" : "Armá una rutina"}</h2></div><button className={`${button} min-h-11 w-11 px-0`} onClick={resetEditor} aria-label="Cerrar editor"><X size={18} /></button></div>
      <form onSubmit={saveRoutine} className="space-y-5">
        <label className="grid gap-2 text-sm font-medium">Nombre de la rutina<input className={input} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej.: Tren superior" maxLength={60} /></label>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-end">
          <label className="grid gap-2 text-sm font-medium">Buscar ejercicio en wger
            <span className="relative"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" /><input className={`${input} pl-11`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Empezá a escribir un nombre…" autoComplete="off" /></span>
          </label>
          <label className="grid gap-2 text-sm font-medium">Series iniciales
            <span className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-2"><button type="button" onClick={() => setSetCount((count) => Math.max(1, count - 1))} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-[var(--surface-2)]" aria-label="Restar una serie"><ChevronDown size={18} /></button><span className="font-mono text-base tabular-nums">{setCount}</span><button type="button" onClick={() => setSetCount((count) => Math.min(99, count + 1))} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-[var(--surface-2)]" aria-label="Sumar una serie"><ChevronUp size={18} /></button></span>
          </label>
        </div>
        {query.trim().length >= 2 && <div aria-label="Sugerencias de ejercicios de wger" className="-mt-3 overflow-hidden rounded-xl border border-[var(--separator)] bg-[var(--surface-2)]">
          {loading && <p role="status" className="p-4 text-sm text-[var(--text-secondary)]">Buscando en wger…</p>}
          {!loading && suggestions.map((exercise) => <button type="button" key={exercise.id} onClick={() => addExercise(exercise)} className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-[var(--separator)] px-4 text-left text-sm last:border-0 hover:bg-[var(--accent-soft)]"><span>{label(exercise)}</span><Plus size={17} className="shrink-0 text-[var(--accent)]" /></button>)}
          {!loading && suggestions.length === 0 && <p className="p-4 text-sm text-[var(--text-secondary)]">No encontramos coincidencias. Las rutinas usan ejercicios del catálogo wger.</p>}
        </div>}
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <div className="space-y-2">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Ejercicios de la rutina</h3><span className="text-xs text-[var(--text-secondary)]">{exercises.length} agregados</span></div>
          {exercises.length === 0 ? <div className="rounded-xl border border-dashed border-[var(--separator)] p-6 text-center text-sm text-[var(--text-secondary)]">Buscá y elegí ejercicios en wger para agregarlos.</div> : exercises.map((exercise, index) => <article key={exercise.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-medium">{exercise.name}</p><p className="text-xs text-[var(--text-secondary)]">wger · {exercise.setCount} series</p></div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">Series<input type="number" min="1" max="99" value={exercise.setCount} onChange={(event) => { const value = Math.max(1, Math.min(99, Number(event.target.value) || 1)); setExercises((current) => current.map((item) => item.id === exercise.id ? { ...item, setCount: value } : item)); }} className="min-h-10 w-16 rounded-lg border border-[var(--separator)] bg-[var(--app-bg)] px-2 text-center text-base text-[var(--text-primary)]" aria-label={`Cantidad de series para ${exercise.name}`} /></label>
            <div className="flex items-center gap-1"><button type="button" disabled={index === 0} onClick={() => moveExercise(index, -1)} className={`${button} min-h-10 w-10 px-0`} aria-label={`Mover ${exercise.name} hacia arriba`}><ChevronUp size={17} /></button><button type="button" disabled={index === exercises.length - 1} onClick={() => moveExercise(index, 1)} className={`${button} min-h-10 w-10 px-0`} aria-label={`Mover ${exercise.name} hacia abajo`}><ChevronDown size={17} /></button><button type="button" onClick={() => setExercises((current) => current.filter((item) => item.id !== exercise.id))} className={`${button} min-h-10 w-10 px-0 text-red-500`} aria-label={`Quitar ${exercise.name}`}><Trash2 size={17} /></button></div>
          </article>)}
        </div>
        <div className="flex flex-wrap justify-end gap-2"><button type="button" className={button} onClick={resetEditor}>Cancelar</button><button type="submit" className={primary} disabled={!name.trim() || !exercises.length}><Check size={17} />{editingId ? "Guardar cambios" : "Guardar rutina"}</button></div>
      </form>
    </section>}

    <section className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Rutinas guardadas</h2><span className="text-sm text-[var(--text-secondary)]">{routines.length}</span></div>
      {routines.length === 0 ? <div className={`${panel} p-10 text-center`}><Dumbbell className="mx-auto h-8 w-8 text-[var(--accent)]" /><h3 className="mt-3 font-semibold">Todavía no hay rutinas</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Creá una plantilla para cargar tus ejercicios y series al empezar.</p></div> : <div className="grid gap-3 lg:grid-cols-2">{routines.map((routine) => <article key={routine.id} className={`${panel} p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--accent)]">{routine.exercises.length} ejercicios · {routine.exercises.reduce((sum, exercise) => sum + exercise.setCount, 0)} series</p><h3 className="mt-1 text-lg font-semibold">{routine.name}</h3></div><div className="flex gap-2"><button className={`${button} min-h-10 px-3`} onClick={() => editRoutine(routine)}><Pencil size={15} />Editar</button><button className={`${button} min-h-10 w-10 px-0 text-red-500`} onClick={() => { if (window.confirm(`¿Eliminar la rutina “${routine.name}”? Las sesiones ya registradas se conservan.`)) { onRoutinesChange(routines.filter((item) => item.id !== routine.id)); if (editingId === routine.id) resetEditor(); } }} aria-label={`Eliminar rutina ${routine.name}`}><Trash2 size={16} /></button></div></div>
        <ol className="mt-4 space-y-2">{routine.exercises.map((exercise) => <li key={exercise.id} className="flex justify-between gap-3 border-t border-[var(--separator)] pt-2 text-sm"><span>{exercise.name}</span><span className="shrink-0 text-[var(--text-secondary)]">{exercise.setCount} series</span></li>)}</ol>
        <button className={`${primary} mt-5 w-full`} onClick={() => onStartRoutine(routine)}><Dumbbell size={17} />{hasActiveSession ? "Ir al entrenamiento en curso" : "Iniciar rutina"}</button>
      </article>)}</div>}
    </section>
  </div>;
}
