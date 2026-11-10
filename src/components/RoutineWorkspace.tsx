"use client";

import { FormEvent, useEffect, useState } from "react";
import { Activity, Check, ChevronDown, ChevronUp, Clock3, Dumbbell, Flame, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { WgerExerciseInfo } from "@/types/wger";
import { createId } from "@/lib/workout-log";
import { createRoutine, isRoutinePhase, RoutineDraft, RoutineItem, WorkoutRoutine } from "@/lib/routines";

type Props = {
  routines: WorkoutRoutine[];
  onRoutinesChange: (routines: WorkoutRoutine[]) => void;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  hasActiveSession: boolean;
};

type AddMode = "exercise" | "warmup" | "stretching";

const panel = "app-panel rounded-2xl border border-[var(--separator)] bg-[var(--surface)] shadow-[var(--card-shadow)]";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)]";
const primary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-fill)] px-5 text-sm font-bold text-[var(--accent-on-fill)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
const input = "min-h-12 w-full rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]";

function exerciseLabel(exercise: WgerExerciseInfo) {
  return exercise.translations.find((item) => item.language === 4)?.name
    || exercise.translations.find((item) => item.language === 2)?.name
    || exercise.translations[0]?.name
    || `Ejercicio #${exercise.id}`;
}

function modeLabel(mode: AddMode) {
  return mode === "exercise" ? "Ejercicio" : mode === "warmup" ? "Calentamiento" : "Estiramiento";
}

function EntryModeTabs({ value, onChange }: { value: AddMode; onChange: (value: AddMode) => void }) {
  const modes: { id: AddMode; label: string; Icon: typeof Dumbbell }[] = [
    { id: "exercise", label: "Ejercicio", Icon: Dumbbell },
    { id: "warmup", label: "Calentar", Icon: Flame },
    { id: "stretching", label: "Estirar", Icon: Activity },
  ];

  return <div role="group" aria-label="Tipo de bloque" className="grid grid-cols-3 gap-1 rounded-2xl border border-[var(--separator)] bg-[var(--app-bg)] p-1 sm:inline-grid sm:min-w-[420px]">
    {modes.map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)} className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition-all sm:gap-2 sm:px-4 sm:text-sm ${value === id ? "scale-[1.02] bg-[var(--accent-fill)] text-[var(--accent-on-fill)] shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--surface)]"}`}>
      <Icon size={16} aria-hidden="true" />{label}
    </button>)}
  </div>;
}

export function RoutineWorkspace({ routines, onRoutinesChange, onStartRoutine, hasActiveSession }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WgerExerciseInfo[]>([]);
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [addMode, setAddMode] = useState<AddMode>("exercise");
  const [setCount, setSetCount] = useState(3);
  const [phaseName, setPhaseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (addMode !== "exercise" || query.trim().length < 2) {
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
  }, [addMode, query]);

  useEffect(() => {
    if (editorOpen) document.getElementById("routine-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editorOpen]);

  function resetEditor() {
    setEditingId(null); setName(""); setQuery(""); setSuggestions([]); setItems([]); setError(""); setPhaseName(""); setDurationMinutes(8); setAddMode("exercise"); setEditorOpen(false);
  }

  function editRoutine(routine: WorkoutRoutine) {
    setEditingId(routine.id); setName(routine.name); setItems(routine.exercises.map((item) => ({ ...item })));
    setQuery(""); setSuggestions([]); setError(""); setAddMode("exercise"); setEditorOpen(true);
  }

  function addExercise(exerciseName: string, wgerId?: number) {
    const cleanName = exerciseName.trim();
    if (!cleanName) return;
    setItems((current) => [...current, { id: createId(), name: cleanName, kind: "exercise", ...(wgerId ? { wgerId } : {}), setCount }]);
    setQuery(""); setSuggestions([]); setError("");
  }

  function addPhase() {
    const cleanName = phaseName.trim() || (addMode === "warmup" ? "Calentamiento general" : "Estiramiento general");
    setItems((current) => [...current, { id: createId(), name: cleanName, kind: addMode === "warmup" ? "warmup" : "stretching", durationMinutes }]);
    setPhaseName(""); setError("");
  }

  function saveRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) { setError("Escribí un nombre para la rutina."); return; }
    if (!items.length) { setError("Agregá al menos un elemento a la rutina."); return; }
    const draft: RoutineDraft = { name: name.trim(), exercises: items };
    if (editingId) {
      onRoutinesChange(routines.map((routine) => routine.id === editingId ? { ...routine, ...draft, updatedAt: new Date().toISOString() } : routine));
    } else {
      onRoutinesChange([createRoutine(draft), ...routines]);
    }
    resetEditor();
  }

  const totalRoutineExercises = (routine: WorkoutRoutine) => routine.exercises.filter((item) => !isRoutinePhase(item)).length;
  const totalRoutineSets = (routine: WorkoutRoutine) => routine.exercises.reduce((total, item) => total + (isRoutinePhase(item) ? 0 : item.setCount), 0);
  const totalRoutineMinutes = (routine: WorkoutRoutine) => routine.exercises.reduce((total, item) => total + (isRoutinePhase(item) ? item.durationMinutes : 0), 0);

  return <div className="space-y-5 sm:space-y-6">
    <section className={`${panel} p-5 sm:p-8`}>
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[var(--accent)]">Plantillas de entrenamiento</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold sm:text-4xl">Tus rutinas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Combiná ejercicios de fuerza, movimientos propios y pausas de calentamiento o estiramiento.</p></div>
        {!editorOpen && <button className={`${primary} w-full sm:w-auto`} onClick={() => { resetEditor(); setEditorOpen(true); }}><Plus size={17} />Crear rutina</button>}
      </div>
    </section>

    {editorOpen && <section id="routine-editor" className={`${panel} scroll-mt-24 p-4 sm:p-7`}>
      <div className="mb-5 flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--accent)]">{editingId ? "Editar plantilla" : "Nueva plantilla"}</p><h2 className="mt-1 text-xl font-semibold">{editingId ? "Actualizá tu rutina" : "Armá tu rutina"}</h2></div><button className={`${button} min-h-11 w-11 shrink-0 px-0`} onClick={resetEditor} aria-label="Cerrar editor"><X size={18} /></button></div>
      <form onSubmit={saveRoutine} className="space-y-5">
        <label className="grid gap-2 text-sm font-medium">Nombre de la rutina<input className={input} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej.: Tren superior" maxLength={60} /></label>

        <section aria-labelledby="add-routine-item-heading" className="space-y-4 rounded-2xl border border-[var(--separator)] bg-[var(--surface-2)] p-3 sm:p-5">
          <div><h3 id="add-routine-item-heading" className="text-base font-semibold">¿Qué querés agregar?</h3><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Elegí un tipo y completá sus datos.</p></div>
          <EntryModeTabs value={addMode} onChange={(mode) => { setAddMode(mode); setError(""); }} />

          {addMode === "exercise" ? <div className="space-y-3">
            <label className="grid gap-2 text-sm font-medium">Ejercicio de wger o nombre personalizado
              <span className="relative"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" /><input className={`${input} pl-11`} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (loading) return; const match = suggestions.find((exercise) => exerciseLabel(exercise).toLocaleLowerCase() === query.trim().toLocaleLowerCase()) || suggestions[0]; match ? addExercise(exerciseLabel(match), match.id) : addExercise(query); } }} placeholder="Buscá o escribí el ejercicio…" autoComplete="off" /></span>
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-end">
              <label className="grid gap-2 text-sm font-medium">Series para este ejercicio
                <span className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--separator)] bg-[var(--app-bg)] px-2"><button type="button" onClick={() => setSetCount((count) => Math.max(1, count - 1))} className="grid h-11 w-11 place-items-center rounded-lg hover:bg-[var(--surface-2)]" aria-label="Restar una serie"><ChevronDown size={18} /></button><span className="font-mono text-base tabular-nums">{setCount}</span><button type="button" onClick={() => setSetCount((count) => Math.min(99, count + 1))} className="grid h-11 w-11 place-items-center rounded-lg hover:bg-[var(--surface-2)]" aria-label="Sumar una serie"><ChevronUp size={18} /></button></span>
              </label>
              <button type="button" className={`${button} min-h-12 w-full`} disabled={!query.trim()} onClick={() => addExercise(query)}><Plus size={17} />Agregar manual</button>
            </div>
            {query.trim().length >= 2 && <div aria-label="Sugerencias de ejercicios de wger" className="overflow-hidden rounded-xl border border-[var(--separator)] bg-[var(--app-bg)]">
              {loading && <p role="status" className="p-4 text-sm text-[var(--text-secondary)]">Buscando en wger…</p>}
              {!loading && suggestions.map((exercise) => <button type="button" key={exercise.id} onClick={() => addExercise(exerciseLabel(exercise), exercise.id)} className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-[var(--separator)] px-4 text-left text-sm last:border-0 hover:bg-[var(--accent-soft)]"><span>{exerciseLabel(exercise)}</span><Plus size={17} className="shrink-0 text-[var(--accent)]" /></button>)}
              {!loading && suggestions.length === 0 && <p className="p-4 text-sm text-[var(--text-secondary)]">Sin coincidencias. Podés agregar “{query.trim()}” manualmente.</p>}
            </div>}
          </div> : <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-end">
            <label className="grid gap-2 text-sm font-medium">Nombre del bloque<input className={input} value={phaseName} onChange={(event) => setPhaseName(event.target.value)} placeholder={addMode === "warmup" ? "Ej.: Movilidad articular" : "Ej.: Elongación de piernas"} maxLength={70} /></label>
            <label className="grid gap-2 text-sm font-medium">Duración en minutos<span className="relative"><Clock3 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" /><input className={`${input} pl-11 pr-14`} type="number" min="1" max="180" inputMode="numeric" value={durationMinutes} onChange={(event) => setDurationMinutes(Math.max(1, Math.min(180, Number(event.target.value) || 1)))} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">min</span></span></label>
            <button type="button" className={`${primary} w-full sm:col-span-2`} onClick={addPhase}><Plus size={17} />Agregar {modeLabel(addMode).toLowerCase()}</button>
          </div>}
        </section>

        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-2"><h3 className="text-base font-semibold">Elementos de la rutina</h3><span className="shrink-0 text-xs text-[var(--text-secondary)]">{items.length} bloques</span></div>
          {items.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--separator)] p-7 text-center text-sm text-[var(--text-secondary)]">Todavía no agregaste elementos.</div> : <ol className="space-y-2.5">
            {items.map((item, index) => {
              const isPhase = isRoutinePhase(item);
              const Icon = isPhase ? item.kind === "warmup" ? Flame : Activity : Dumbbell;
              return <li key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[var(--separator)] bg-[var(--surface-2)] p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] font-mono text-sm font-semibold text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0"><div className="flex items-center gap-2"><Icon size={15} className="shrink-0 text-[var(--accent)]" aria-hidden="true" /><p className="truncate text-sm font-semibold">{item.name}</p></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{isPhase ? `${item.kind === "warmup" ? "Calentamiento" : "Estiramiento"} · ${item.durationMinutes} min` : `${item.wgerId ? "wger" : "Manual"} · ${item.setCount} series`}</p></div>
                <button type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} className="grid h-11 w-11 place-items-center rounded-lg text-red-500 hover:bg-red-500/10" aria-label={`Quitar ${item.name}`}><Trash2 size={17} /></button>
              </li>;
            })}
          </ol>}
        </div>
        <div className="grid gap-2 sm:flex sm:justify-end"><button type="button" className={`${button} w-full sm:w-auto`} onClick={resetEditor}>Cancelar</button><button type="submit" className={`${primary} w-full sm:w-auto`} disabled={!name.trim() || !items.length}><Check size={17} />{editingId ? "Guardar cambios" : "Guardar rutina"}</button></div>
      </form>
    </section>}

    <section className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Rutinas guardadas</h2><span className="text-sm text-[var(--text-secondary)]">{routines.length}</span></div>
      {routines.length === 0 ? <div className={`${panel} p-10 text-center`}><Dumbbell className="mx-auto h-8 w-8 text-[var(--accent)]" /><h3 className="mt-3 font-semibold">Todavía no hay rutinas</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Creá una plantilla para cargar ejercicios, calentamientos y estiramientos.</p></div> : <div className="grid gap-3 lg:grid-cols-2">{routines.map((routine) => <article key={routine.id} className={`${panel} p-4 sm:p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--accent)]">{totalRoutineExercises(routine)} ejercicios · {totalRoutineSets(routine)} series{totalRoutineMinutes(routine) ? ` · ${totalRoutineMinutes(routine)} min` : ""}</p><h3 className="mt-1 text-lg font-semibold">{routine.name}</h3></div><div className="grid grid-cols-[1fr_48px] gap-2 sm:flex"><button className={`${button} min-h-11`} onClick={() => editRoutine(routine)}><Pencil size={15} />Editar</button><button className={`${button} min-h-11 w-12 px-0 text-red-500`} onClick={() => { if (window.confirm(`¿Eliminar la rutina “${routine.name}”? Las sesiones ya registradas se conservan.`)) { onRoutinesChange(routines.filter((item) => item.id !== routine.id)); if (editingId === routine.id) resetEditor(); } }} aria-label={`Eliminar rutina ${routine.name}`}><Trash2 size={16} /></button></div></div>
        <ol className="mt-4 space-y-2">{routine.exercises.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 border-t border-[var(--separator)] pt-2 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="truncate">{item.name}</span></span><span className="shrink-0 text-xs text-[var(--text-secondary)]">{isRoutinePhase(item) ? `${item.kind === "warmup" ? "Calentamiento" : "Estiramiento"} · ${item.durationMinutes} min` : `${item.setCount} series`}</span></li>)}</ol>
        <button className={`${primary} mt-5 w-full`} onClick={() => onStartRoutine(routine)}><Dumbbell size={17} />{hasActiveSession ? "Ir al entrenamiento en curso" : "Iniciar rutina"}</button>
      </article>)}</div>}
    </section>
  </div>;
}
