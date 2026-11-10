"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, CirclePlay, Clock3, Dumbbell, Pause, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { WgerExerciseInfo } from "@/types/wger";
import { createId, isWorkoutPeriod, localDateKey, WorkoutExercise, WorkoutSession, WorkoutSet, workoutExerciseCount } from "@/lib/workout-log";
import { routineExerciseCount, routineSetCount, isRoutinePhase, WorkoutRoutine } from "@/lib/routines";

type Props = {
  view: "workout" | "calendar";
  sessions: WorkoutSession[];
  onSessionsChange: (sessions: WorkoutSession[]) => void;
  onNavigateToWorkout: () => void;
  onNavigateToRoutines: () => void;
  routines: WorkoutRoutine[];
  onStartRoutine: (routine: WorkoutRoutine) => void;
};

const panel = "app-panel rounded-xl border border-[rgba(92,242,229,.2)] bg-[linear-gradient(145deg,rgba(17,31,38,.97),rgba(8,14,19,.97))] shadow-[0_12px_38px_rgba(0,0,0,.28)]";
const button = "app-button inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(92,242,229,.25)] bg-[rgba(12,25,31,.92)] px-4 text-sm font-semibold text-[#b9d2d0] transition hover:border-[rgba(92,242,229,.55)] hover:text-[#5cf2e5] disabled:cursor-not-allowed disabled:opacity-40";
const input = "app-input w-full rounded-lg border border-[rgba(92,242,229,.22)] bg-[#071014] px-3 py-3 text-sm text-[#e8f4f2] outline-none placeholder:text-[#67817f] focus:border-[#5cf2e5] focus:ring-2 focus:ring-[rgba(92,242,229,.1)]";

function exerciseLabel(exercise: WgerExerciseInfo) {
  const translation = exercise.translations.find((item) => item.language === 4)
    || exercise.translations.find((item) => item.language === 2)
    || exercise.translations[0];
  return translation?.name || `Ejercicio #${exercise.id}`;
}

function makeSet(previous?: WorkoutSet): WorkoutSet {
  return {
    id: createId(),
    reps: previous?.reps ?? 8,
    weight: previous?.weight ?? null,
    completed: false,
  };
}

function displayDate(date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", weekday: "long" }) {
  return new Intl.DateTimeFormat("es-AR", options).format(new Date(`${date}T12:00:00`));
}

function RestTimer({ session, onChange }: { session: WorkoutSession; onChange: (restEndsAt?: number) => void }) {
  const [now, setNow] = useState(0);
  const [duration, setDuration] = useState(90);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = session.restEndsAt && now ? Math.max(0, Math.ceil((session.restEndsAt - now) / 1000)) : 0;
  const active = Boolean(session.restEndsAt);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <section className={`${panel} p-4 sm:p-5`} aria-label="Cronómetro de descanso">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(92,242,229,.25)] bg-[rgba(92,242,229,.08)] text-[#5cf2e5]"><Clock3 className="h-5 w-5" /></div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#83a09e]">Descanso entre series</p>
            <p className={`font-mono text-3xl font-semibold tabular-nums ${active && remaining === 0 ? "text-[#c6ff4d]" : "text-[#e8f4f2]"}`} aria-live="off">{minutes}:{seconds}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!active && <label className="flex items-center gap-2 text-xs text-[#91aaa8]">Duración
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="min-h-10 rounded-md border border-[rgba(92,242,229,.2)] bg-[#071014] px-2 text-sm text-[#e8f4f2]">
              <option value={60}>1:00</option><option value={90}>1:30</option><option value={120}>2:00</option><option value={180}>3:00</option>
            </select>
          </label>}
          {active ? <>
            <button className={button} onClick={() => onChange(Date.now() + (remaining + 15) * 1000)} aria-label="Sumar 15 segundos"><Plus className="h-4 w-4" />15 s</button>
            <button className={button} onClick={() => onChange(undefined)}><Pause className="h-4 w-4" />Detener</button>
          </> : <button className={`${button} border-[#5cf2e5] bg-[#5cf2e5] text-[#061312] hover:bg-[#8afff2] hover:text-[#061312]`} onClick={() => onChange(Date.now() + duration * 1000)}><CirclePlay className="h-4 w-4" />Iniciar descanso</button>}
        </div>
      </div>
      {active && now > 0 && remaining === 0 && <p className="mt-3 font-mono text-[10px] uppercase tracking-[.16em] text-[#c6ff4d]">Descanso finalizado · listo para la próxima serie</p>}
    </section>
  );
}

function RoutinePhaseCard({ item, onToggle, onRemove }: { item: WorkoutExercise; onToggle: () => void; onRemove: () => void }) {
  const isWarmup = item.kind === "warmup";
  return <article className={`${panel} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}>
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[rgba(92,242,229,.18)] bg-[rgba(92,242,229,.08)] text-[#5cf2e5]"><Clock3 className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#83a09e]">{isWarmup ? "Calentamiento" : "Estiramiento"} · {item.durationMinutes ?? 8} min</p><h2 className="mt-1 truncate text-base font-semibold">{item.name}</h2></div>
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-2 sm:flex">
      <button type="button" onClick={onToggle} aria-pressed={Boolean(item.completed)} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold transition ${item.completed ? "border-[#c6ff4d]/40 bg-[#c6ff4d]/10 text-[#c6ff4d]" : "border-[rgba(92,242,229,.25)] text-[#b9d2d0] hover:border-[#5cf2e5]"}`}><Check className="mr-2 inline h-4 w-4" aria-hidden="true" />{item.completed ? "Completado" : "Marcar realizado"}</button>
      <button type="button" onClick={onRemove} className="grid h-11 w-11 place-items-center rounded-xl text-[#83a09e] hover:bg-[rgba(255,92,170,.1)] hover:text-[#ff5caa]" aria-label={`Quitar ${item.name}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  </article>;
}

function LiveWorkout({ sessions, onSessionsChange, routines, onStartRoutine, onNavigateToRoutines }: Pick<Props, "sessions" | "onSessionsChange" | "routines" | "onStartRoutine" | "onNavigateToRoutines">) {
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [results, setResults] = useState<WgerExerciseInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [routinePickerOpen, setRoutinePickerOpen] = useState(false);
  const activeSession = sessions.find((session) => session.status === "in_progress");

  function replaceSession(updated: WorkoutSession) {
    onSessionsChange(sessions.map((session) => session.id === updated.id ? updated : session));
  }

  function startWorkout() {
    const date = localDateKey(new Date());
    onSessionsChange([{ id: createId(), date, startedAt: new Date().toISOString(), status: "in_progress", exercises: [], notes: "" }, ...sessions]);
  }

  async function searchExercises(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exerciseQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const response = await fetch(`/api/exercises?search=${encodeURIComponent(exerciseQuery.trim())}&limit=6`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo buscar en el catálogo.");
      setResults(data.results || []);
      if (!data.results?.length) setSearchError("No encontramos coincidencias. Podés agregarlo como ejercicio personalizado.");
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Error al buscar ejercicios.");
    } finally {
      setSearching(false);
    }
  }

  function addExercise(name: string, wgerId?: number) {
    if (!activeSession) return;
    const exercise: WorkoutExercise = { id: createId(), name, ...(wgerId ? { wgerId } : {}), sets: [makeSet()] };
    replaceSession({ ...activeSession, exercises: [...activeSession.exercises, exercise] });
    setExerciseQuery(""); setResults([]); setSearchError("");
  }

  function updateExercise(exerciseId: string, update: (exercise: WorkoutExercise) => WorkoutExercise) {
    if (!activeSession) return;
    replaceSession({ ...activeSession, exercises: activeSession.exercises.map((exercise) => exercise.id === exerciseId ? update(exercise) : exercise) });
  }

  function completeWorkout() {
    if (!activeSession) return;
    if (activeSession.exercises.length === 0) {
      onSessionsChange(sessions.filter((session) => session.id !== activeSession.id));
      return;
    }
    const endedAt = new Date();
    replaceSession({ ...activeSession, date: activeSession.routineId ? localDateKey(endedAt) : activeSession.date, status: "completed", endedAt: endedAt.toISOString(), restEndsAt: undefined });
  }

  function cancelRoutineWorkout() {
    if (!activeSession?.routineId) return;
    const confirmed = window.confirm(`¿Cancelar “${activeSession.routineName || "esta rutina"}”? Se descartarán todos los datos de esta sesión.`);
    if (confirmed) onSessionsChange(sessions.filter((session) => session.id !== activeSession.id));
  }

  if (!activeSession) {
    const latest = sessions.find((session) => session.status === "completed");
    return <div className="space-y-6">
      <section className={`${panel} overflow-hidden p-6 sm:p-9`}>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[.24em] text-[#c6ff4d]">Entrenamiento en vivo / listo para iniciar</p>
        <h1 className="max-w-2xl text-4xl font-bold uppercase leading-[.98] text-[#e8f4f2] sm:text-6xl">Registrá cada serie sobre la marcha.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#91aaa8]">Elegí una rutina guardada o empezá en blanco. El registro se guarda automáticamente en este dispositivo.</p>
        <div className="mt-7 flex flex-wrap gap-3"><button onClick={startWorkout} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#c6ff4d] px-5 font-bold uppercase tracking-wide text-[#10170a] shadow-[0_0_24px_rgba(198,255,77,.14)] transition hover:bg-[#d8ff83]"><CirclePlay className="h-5 w-5" />Iniciar sin rutina</button>
          {routines.length > 0 ? <button onClick={() => setRoutinePickerOpen((open) => !open)} className={`${button} min-h-12`}><Dumbbell className="h-4 w-4" />Iniciar con rutina</button> : <button onClick={onNavigateToRoutines} className={`${button} min-h-12`}><Plus className="h-4 w-4" />Crear una rutina</button>}</div>
      </section>
      {routinePickerOpen && <section className={`${panel} p-4 sm:p-5`}><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Elegí una rutina</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Se copiarán ejercicios, series y bloques de movilidad.</p></div><button className={`${button} min-h-10 w-10 px-0`} onClick={() => setRoutinePickerOpen(false)} aria-label="Cerrar selección"><X className="h-4 w-4" /></button></div><div className="grid gap-2 sm:grid-cols-2">{routines.map((routine) => <button key={routine.id} onClick={() => onStartRoutine(routine)} className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] p-4 text-left transition hover:border-[var(--accent-border)]"><span><span className="block font-semibold">{routine.name}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{routineExerciseCount(routine.exercises)} ejercicios · {routineSetCount(routine.exercises)} series{routine.exercises.some(isRoutinePhase) ? ` · ${routine.exercises.filter(isRoutinePhase).reduce((total, item) => total + item.durationMinutes, 0)} min movilidad` : ""}</span></span><CirclePlay className="h-5 w-5 shrink-0 text-[var(--accent)]" /></button>)}</div><button className="mt-3 text-sm font-medium text-[var(--accent)]" onClick={onNavigateToRoutines}>Administrar rutinas</button></section>}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${panel} p-4`}><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#83a09e]">Sesiones registradas</p><p className="mt-2 text-3xl font-semibold tabular-nums">{sessions.filter((session) => session.status === "completed").length}</p></div>
        <div className={`${panel} p-4 sm:col-span-2`}><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#83a09e]">Último entrenamiento</p><p className="mt-2 text-lg font-semibold capitalize">{latest ? displayDate(latest.date) : "Todavía no hay sesiones"}</p></div>
      </div>
    </div>;
  }

  const completedSets = activeSession.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);
  const totalSets = activeSession.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const sessionPeriods = activeSession.exercises.filter(isWorkoutPeriod);

  return <div className="space-y-5">
    <section className={`${panel} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}>
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#c6ff4d]">Sesión en curso · {displayDate(activeSession.date)}</p><h1 className="mt-1 text-2xl font-bold uppercase sm:text-3xl">{activeSession.routineName || "Entrenamiento libre"}</h1><p className="mt-1 text-xs text-[#83a09e]">{workoutExerciseCount(activeSession.exercises)} ejercicios · {completedSets}/{totalSets} series completadas{sessionPeriods.length ? ` · ${sessionPeriods.filter((item) => item.completed).length}/${sessionPeriods.length} bloques` : ""}</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={completeWorkout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(198,255,77,.4)] bg-[rgba(198,255,77,.1)] px-4 text-sm font-semibold text-[#c6ff4d] transition hover:bg-[rgba(198,255,77,.18)]"><Check className="h-4 w-4" />Finalizar sesión</button>{activeSession.routineId && <button onClick={cancelRoutineWorkout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"><Trash2 className="h-4 w-4" />Cancelar rutina</button>}</div>
    </section>

    <RestTimer session={activeSession} onChange={(restEndsAt) => replaceSession({ ...activeSession, restEndsAt })} />

    <section className={`${panel} p-4 sm:p-5`}>
      <div className="mb-3 flex items-center gap-2"><Search className="h-4 w-4 text-[#5cf2e5]" /><h2 className="font-mono text-[11px] uppercase tracking-[.18em] text-[#5cf2e5]">Agregar ejercicio</h2></div>
      <form onSubmit={searchExercises} className="flex flex-col gap-2 sm:flex-row">
        <input value={exerciseQuery} onChange={(event) => setExerciseQuery(event.target.value)} className={input} placeholder="Buscá en wger o escribí uno propio…" aria-label="Buscar ejercicio" />
        <button className={button} type="submit" disabled={searching || !exerciseQuery.trim()}>{searching ? "Buscando…" : "Buscar"}</button>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#5cf2e5] px-4 text-sm font-bold text-[#061312] transition hover:bg-[#8afff2] disabled:opacity-40" type="button" disabled={!exerciseQuery.trim()} onClick={() => addExercise(exerciseQuery.trim())}><Plus className="h-4 w-4" />Agregar manual</button>
      </form>
      {searchError && <p className="mt-3 text-xs text-[#ff9bc8]">{searchError}</p>}
      {results.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{results.map((exercise) => <button key={exercise.id} onClick={() => addExercise(exerciseLabel(exercise), exercise.id)} className="flex min-h-12 items-center justify-between rounded-lg border border-[rgba(92,242,229,.15)] bg-[#081216] px-3 text-left text-sm transition hover:border-[#5cf2e5]"><span>{exerciseLabel(exercise)}</span><Plus className="h-4 w-4 shrink-0 text-[#5cf2e5]" /></button>)}</div>}
    </section>

    {activeSession.exercises.length === 0 ? <div className={`${panel} border-dashed p-10 text-center`}><Dumbbell className="mx-auto h-8 w-8 text-[#5cf2e5]" /><p className="mt-3 font-semibold">Agregá el primer ejercicio</p><p className="mt-1 text-sm text-[#83a09e]">Podés buscarlo en wger o anotarlo con un nombre libre.</p></div> : <div className="space-y-3">
      {activeSession.exercises.map((exercise, exerciseIndex) => isWorkoutPeriod(exercise)
        ? <RoutinePhaseCard key={exercise.id} item={exercise} onToggle={() => updateExercise(exercise.id, (item) => ({ ...item, completed: !item.completed }))} onRemove={() => replaceSession({ ...activeSession, exercises: activeSession.exercises.filter((item) => item.id !== exercise.id) })} />
        : <article key={exercise.id} className={`${panel} p-4 sm:p-5`}>
        <div className="mb-4 flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#83a09e]">Ejercicio {String(workoutExerciseCount(activeSession.exercises.slice(0, exerciseIndex + 1))).padStart(2, "0")}{exercise.wgerId ? ` · WGER #${exercise.wgerId}` : " · MANUAL"}</p><h2 className="mt-1 text-xl font-bold uppercase">{exercise.name}</h2></div><button className="rounded-md p-2 text-[#83a09e] transition hover:bg-[rgba(255,92,170,.1)] hover:text-[#ff5caa]" onClick={() => replaceSession({ ...activeSession, exercises: activeSession.exercises.filter((item) => item.id !== exercise.id) })} aria-label={`Eliminar ${exercise.name}`}><Trash2 className="h-4 w-4" /></button></div>
        <div className={`grid ${activeSession.routineId ? "grid-cols-[42px_1fr_48px] sm:grid-cols-[52px_1fr_56px]" : "grid-cols-[42px_1fr_1fr_48px] sm:grid-cols-[52px_1fr_1fr_56px]"} items-center gap-2 border-b border-[rgba(92,242,229,.13)] pb-2 font-mono text-[9px] uppercase tracking-[.13em] text-[#83a09e]`}><span>Serie</span>{!activeSession.routineId && <span>Reps</span>}<span>Peso (kg)</span><span className="text-center">OK</span></div>
        <div className="space-y-2 pt-2">{exercise.sets.map((set, setIndex) => <div key={set.id} className={`grid ${activeSession.routineId ? "grid-cols-[42px_1fr_48px] sm:grid-cols-[52px_1fr_56px]" : "grid-cols-[42px_1fr_1fr_48px] sm:grid-cols-[52px_1fr_1fr_56px]"} items-center gap-2 rounded-lg p-1.5 ${set.completed ? "bg-[rgba(198,255,77,.06)]" : ""}`}>
          <span className="font-mono text-sm text-[#5cf2e5]">{String(setIndex + 1).padStart(2, "0")}</span>
          {!activeSession.routineId && <input className={input} type="number" min="0" inputMode="numeric" value={set.reps ?? ""} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, reps: event.target.value === "" ? null : Number(event.target.value) } : row) }))} aria-label={`Repeticiones de serie ${setIndex + 1}`} placeholder="8" />}
          <input className={input} type="number" min="0" step="0.5" inputMode="decimal" value={set.weight ?? ""} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, weight: event.target.value === "" ? null : Number(event.target.value) } : row) }))} aria-label={`Peso en kilos de serie ${setIndex + 1}`} placeholder="—" />
          <button onClick={() => { const completed = !set.completed; updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, completed } : row) })); if (completed) replaceSession({ ...activeSession, restEndsAt: Date.now() + 90_000, exercises: activeSession.exercises.map((item) => item.id === exercise.id ? { ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, completed } : row) } : item) }); }} className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${set.completed ? "border-[#c6ff4d] bg-[#c6ff4d] text-[#10170a]" : "border-[rgba(92,242,229,.25)] text-[#83a09e] hover:border-[#5cf2e5] hover:text-[#5cf2e5]"}`} aria-label={set.completed ? "Marcar serie como pendiente" : "Completar serie e iniciar descanso"}><Check className="h-4 w-4" /></button>
        </div>)}</div>
        {!activeSession.routineId && <div className="mt-3 flex justify-end"><button onClick={() => updateExercise(exercise.id, (item) => ({ ...item, sets: [...item.sets, makeSet(item.sets[item.sets.length - 1])] }))} className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-[#5cf2e5] transition hover:bg-[rgba(92,242,229,.08)]"><Plus className="h-4 w-4" />Agregar serie</button></div>}
      </article>)}
    </div>}

    <label className={`${panel} block p-4`}><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#83a09e]">Notas de la sesión</span><textarea className={`${input} mt-2 min-h-24 resize-y`} value={activeSession.notes} onChange={(event) => replaceSession({ ...activeSession, notes: event.target.value })} placeholder="¿Cómo te sentiste? Anotá lo que quieras recordar…" /></label>
  </div>;
}

function CompletedSessionEditor({ session, onCancel, onSave }: { session: WorkoutSession; onCancel: () => void; onSave: (session: WorkoutSession) => void }) {
  const [draft, setDraft] = useState<WorkoutSession>(() => ({
    ...session,
    exercises: session.exercises.map((exercise) => ({ ...exercise, sets: exercise.sets.map((set) => ({ ...set })) })),
  }));
  const [newExerciseName, setNewExerciseName] = useState("");
  const [error, setError] = useState("");
  const editInput = "min-h-11 w-full rounded-lg border border-[var(--separator)] bg-[var(--app-bg)] px-3 text-base text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]";

  function updateExercise(exerciseId: string, update: (exercise: WorkoutExercise) => WorkoutExercise) {
    setDraft((current) => ({ ...current, exercises: current.exercises.map((exercise) => exercise.id === exerciseId ? update(exercise) : exercise) }));
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.date) { setError("Elegí una fecha para el entrenamiento."); return; }
    if (draft.exercises.length === 0) { setError("El entrenamiento debe tener al menos un ejercicio."); return; }
    onSave(draft);
  }

  return <form onSubmit={save} className="mt-4 space-y-4 rounded-xl border border-[var(--accent-border)] bg-[var(--surface-2)] p-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">Fecha del entrenamiento<input className={editInput} type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} /></label>
      {draft.routineId && <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">Nombre de la rutina en este registro<input className={editInput} value={draft.routineName || ""} onChange={(event) => setDraft((current) => ({ ...current, routineName: event.target.value }))} /></label>}
    </div>
    <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">Notas<textarea className={`${editInput} min-h-20 py-3`} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Notas del entrenamiento" /></label>

    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-[var(--text-primary)]">Ejercicios y bloques</h3><span className="text-xs text-[var(--text-secondary)]">{workoutExerciseCount(draft.exercises)} ejercicios · {draft.exercises.filter(isWorkoutPeriod).length} bloques</span></div>
      {draft.exercises.map((exercise, exerciseIndex) => isWorkoutPeriod(exercise)
        ? <article key={exercise.id} className="rounded-xl border border-[var(--separator)] bg-[var(--surface)] p-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_auto_auto] sm:items-end">
            <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">{exercise.kind === "warmup" ? "Calentamiento" : "Estiramiento"}<input className={editInput} value={exercise.name} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, name: event.target.value }))} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">Duración (min)<input className={editInput} type="number" min="1" max="180" inputMode="numeric" value={exercise.durationMinutes ?? 8} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, durationMinutes: Math.max(1, Math.min(180, Number(event.target.value) || 1)) }))} /></label>
            <button type="button" onClick={() => updateExercise(exercise.id, (item) => ({ ...item, completed: !item.completed }))} aria-pressed={Boolean(exercise.completed)} className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${exercise.completed ? "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]" : "border-[var(--separator)] text-[var(--text-secondary)]"}`}><Check size={16} className="mr-1 inline" />{exercise.completed ? "Realizado" : "Pendiente"}</button>
            <button type="button" onClick={() => setDraft((current) => ({ ...current, exercises: current.exercises.filter((item) => item.id !== exercise.id) }))} className="grid h-11 w-11 place-items-center rounded-lg text-red-500 hover:bg-red-500/10" aria-label={`Eliminar ${exercise.name}`}><Trash2 size={17} /></button>
          </div>
        </article>
        : <article key={exercise.id} className="rounded-xl border border-[var(--separator)] bg-[var(--surface)] p-3">
        <div className="flex items-center gap-2"><span className="font-mono text-xs text-[var(--accent)]">{String(workoutExerciseCount(draft.exercises.slice(0, exerciseIndex + 1))).padStart(2, "0")}</span><input className={`${editInput} flex-1 font-medium`} value={exercise.name} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, name: event.target.value }))} aria-label={`Nombre del ejercicio ${workoutExerciseCount(draft.exercises.slice(0, exerciseIndex + 1))}`} /><button type="button" onClick={() => setDraft((current) => ({ ...current, exercises: current.exercises.filter((item) => item.id !== exercise.id) }))} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-red-500 hover:bg-red-500/10" aria-label={`Eliminar ${exercise.name}`}><Trash2 size={17} /></button></div>
        <div className="mt-3 space-y-2">{exercise.sets.map((set, setIndex) => <div key={set.id} className={`grid ${draft.routineId ? "grid-cols-[36px_minmax(0,1fr)_48px]" : "grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_48px]"} items-center gap-2`}>
          <span className="font-mono text-xs text-[var(--text-secondary)]">{setIndex + 1}</span>
          {!draft.routineId && <input className={editInput} type="number" min="0" inputMode="numeric" value={set.reps ?? ""} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, reps: event.target.value === "" ? null : Number(event.target.value) } : row) }))} aria-label={`Repeticiones, ${exercise.name}, serie ${setIndex + 1}`} placeholder="Reps" />}
          <input className={editInput} type="number" min="0" step="0.5" inputMode="decimal" value={set.weight ?? ""} onChange={(event) => updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, weight: event.target.value === "" ? null : Number(event.target.value) } : row) }))} aria-label={`Peso, ${exercise.name}, serie ${setIndex + 1}`} placeholder="Peso kg" />
          <button type="button" onClick={() => updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.map((row) => row.id === set.id ? { ...row, completed: !row.completed } : row) }))} aria-pressed={set.completed} aria-label={set.completed ? `Marcar serie ${setIndex + 1} de ${exercise.name} como pendiente` : `Marcar serie ${setIndex + 1} de ${exercise.name} como completada`} className={`grid h-11 w-11 place-items-center rounded-lg border ${set.completed ? "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]" : "border-[var(--separator)] text-[var(--text-secondary)]"}`}><Check size={17} /></button>
          {exercise.sets.length > 1 && <button type="button" onClick={() => updateExercise(exercise.id, (item) => ({ ...item, sets: item.sets.filter((row) => row.id !== set.id) }))} className="col-start-2 inline-flex min-h-10 justify-self-start px-2 text-xs text-red-500 underline" aria-label={`Quitar serie ${setIndex + 1} de ${exercise.name}`}>Quitar serie</button>}
        </div>)}</div>
        <button type="button" onClick={() => updateExercise(exercise.id, (item) => ({ ...item, sets: [...item.sets, { id: createId(), reps: null, weight: null, completed: false }] }))} className="mt-2 inline-flex min-h-10 items-center gap-1.5 px-2 text-xs font-semibold text-[var(--accent)]"><Plus size={15} />Agregar serie</button>
      </article>)}
    </div>

    <div className="flex flex-col gap-2 sm:flex-row"><input className={editInput} value={newExerciseName} onChange={(event) => setNewExerciseName(event.target.value)} placeholder="Nombre del ejercicio a agregar" aria-label="Nuevo ejercicio" /><button type="button" disabled={!newExerciseName.trim()} onClick={() => { const name = newExerciseName.trim(); setDraft((current) => ({ ...current, exercises: [...current.exercises, { id: createId(), name, sets: [{ id: createId(), reps: null, weight: null, completed: false }] }] })); setNewExerciseName(""); }} className={button}><Plus size={16} />Agregar ejercicio</button></div>
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    <div className="flex flex-wrap justify-end gap-2"><button type="button" className={button} onClick={onCancel}>Cancelar edición</button><button type="submit" className={`${button} border-[var(--accent-fill)] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]`}><Check size={16} />Guardar cambios</button></div>
  </form>;
}

function WorkoutCalendar({ sessions, onSessionsChange, onNavigateToWorkout }: Pick<Props, "sessions" | "onSessionsChange" | "onNavigateToWorkout">) {
  const [month, setMonth] = useState(() => { const today = new Date(); return new Date(today.getFullYear(), today.getMonth(), 1); });
  const [selectedDay, setSelectedDay] = useState(localDateKey(new Date()));
  const monthName = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(month);
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const offset = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = useMemo(() => [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)], [daysInMonth, offset]);
  const sessionsByDate = useMemo(() => sessions.reduce<Record<string, WorkoutSession[]>>((grouped, session) => { grouped[session.date] = [...(grouped[session.date] || []), session]; return grouped; }, {}), [sessions]);
  const selectedSessions = sessionsByDate[selectedDay] || [];
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  function saveEditedSession(updated: WorkoutSession) {
    onSessionsChange(sessions.map((session) => session.id === updated.id ? updated : session));
    setEditingSessionId(null);
    if (updated.date !== selectedDay) {
      const [year, month] = updated.date.split("-").map(Number);
      setMonth(new Date(year, month - 1, 1));
      setSelectedDay(updated.date);
    }
  }

  function shiftMonth(amount: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + amount, 1);
    setMonth(next);
    setSelectedDay(localDateKey(new Date(next.getFullYear(), next.getMonth(), 1)));
  }

  return <div className="grid gap-5 lg:grid-cols-[1.45fr_.8fr]">
    <section className={`${panel} p-4 sm:p-6`}>
      <div className="calendar-heading mb-5 flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#5cf2e5]">Archivo de sesiones</p><h1 className="mt-1 text-2xl font-bold uppercase">Calendario</h1></div><div className="calendar-month-controls flex items-center gap-2"><button className={`${button} min-h-10 px-2`} onClick={() => shiftMonth(-1)} aria-label="Mes anterior"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-32 text-center text-sm font-semibold capitalize">{monthName}</span><button className={`${button} min-h-10 px-2`} onClick={() => shiftMonth(1)} aria-label="Mes siguiente"><ChevronRight className="h-4 w-4" /></button></div></div>
      <div className="grid grid-cols-7 gap-1 text-center">{["L", "M", "X", "J", "V", "S", "D"].map((day, index) => <div key={`${day}-${index}`} className="pb-2 font-mono text-[10px] text-[#83a09e]">{day}</div>)}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), day));
          const daySessions = sessionsByDate[date] || [];
          const selected = date === selectedDay;
          const isToday = date === localDateKey(new Date());
          return <button key={date} onClick={() => setSelectedDay(date)} aria-label={`${displayDate(date, { day: "numeric", month: "long" })}${daySessions.length ? `, ${daySessions.length} sesiones` : ""}`} aria-pressed={selected} className={`relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-lg border text-sm transition ${selected ? "border-[#c6ff4d] bg-[rgba(198,255,77,.12)] text-[#c6ff4d]" : "border-transparent text-[#c6d5d3] hover:border-[rgba(92,242,229,.3)] hover:bg-[rgba(92,242,229,.05)]"} ${isToday && !selected ? "ring-1 ring-inset ring-[rgba(92,242,229,.45)]" : ""}`}>
            {day}<span className="mt-1 flex h-1.5 items-center gap-0.5">{daySessions.slice(0, 3).map((session) => <i key={session.id} className={`h-1.5 w-1.5 rounded-full ${session.status === "completed" ? "bg-[#c6ff4d]" : "bg-[#5cf2e5]"}`} />)}</span>
          </button>;
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 border-t border-[rgba(92,242,229,.14)] pt-4 text-[10px] text-[#83a09e]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#c6ff4d]" />Completado</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#5cf2e5]" />En curso</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full ring-1 ring-[#5cf2e5]" />Hoy</span></div>
    </section>
    <aside className={`${panel} p-4 sm:p-6`}><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#5cf2e5]">Detalle del día</p><h2 className="mt-2 text-xl font-bold capitalize">{displayDate(selectedDay)}</h2>
      <button className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#c6ff4d] px-4 text-sm font-bold uppercase tracking-wide text-[#10170a] transition hover:bg-[#d8ff83]" onClick={() => {
        const active = sessions.find((session) => session.status === "in_progress");
        if (!active) {
          onSessionsChange([{ id: createId(), date: selectedDay, startedAt: new Date().toISOString(), status: "in_progress", exercises: [], notes: "" }, ...sessions]);
        }
        onNavigateToWorkout();
      }}><CirclePlay className="h-4 w-4" />{sessions.some((session) => session.status === "in_progress") ? "Continuar sesión" : "Registrar este día"}</button>
      {selectedSessions.length ? <div className="mt-5 space-y-3">{selectedSessions.map((session) => <article key={session.id} className="rounded-lg border border-[rgba(92,242,229,.15)] bg-[#081216] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`rounded px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${session.status === "completed" ? "bg-[rgba(198,255,77,.1)] text-[#c6ff4d]" : "bg-[rgba(92,242,229,.1)] text-[#5cf2e5]"}`}>{session.status === "completed" ? "Completado" : "En curso"}</span><span className="text-xs text-[#83a09e]">{session.routineName || `${workoutExerciseCount(session.exercises)} ejercicios`}</span></div>{session.status === "completed" && <button className={`${button} min-h-10 px-3`} onClick={() => setEditingSessionId((current) => current === session.id ? null : session.id)} aria-expanded={editingSessionId === session.id}><Pencil size={14} />{editingSessionId === session.id ? "Cerrar editor" : "Editar"}</button>}</div>
        <ul className="mt-3 space-y-1.5">{session.exercises.map((exercise) => <li key={exercise.id} className="flex justify-between gap-2 text-sm"><span>{exercise.name}</span><span className="shrink-0 text-xs text-[#83a09e]">{isWorkoutPeriod(exercise) ? `${exercise.completed ? "Realizado" : "Pendiente"} · ${exercise.durationMinutes ?? 8} min` : `${exercise.sets.filter((set) => set.completed).length}/${exercise.sets.length} series`}</span></li>)}</ul>
        {session.notes && <p className="mt-3 border-t border-[rgba(92,242,229,.12)] pt-3 text-xs leading-5 text-[#91aaa8]">{session.notes}</p>}{editingSessionId === session.id && <CompletedSessionEditor key={session.id} session={session} onCancel={() => setEditingSessionId(null)} onSave={saveEditedSession} />}
      </article>)}</div> : <div className="mt-5 rounded-lg border border-dashed border-[rgba(92,242,229,.18)] px-4 py-8 text-center"><CalendarDays className="mx-auto h-6 w-6 text-[#83a09e]" /><p className="mt-2 text-sm text-[#91aaa8]">No hay entrenamientos registrados este día.</p></div>}
    </aside>
  </div>;
}

export function WorkoutWorkspace(props: Props) {
  return props.view === "workout"
    ? <LiveWorkout sessions={props.sessions} onSessionsChange={props.onSessionsChange} routines={props.routines} onStartRoutine={props.onStartRoutine} onNavigateToRoutines={props.onNavigateToRoutines} />
    : <WorkoutCalendar sessions={props.sessions} onSessionsChange={props.onSessionsChange} onNavigateToWorkout={props.onNavigateToWorkout} />;
}

