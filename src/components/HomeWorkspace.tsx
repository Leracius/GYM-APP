"use client";

import Image from "next/image";
import { ArrowRight, CalendarDays, ClipboardList, Dumbbell, Search } from "lucide-react";
import type { WorkoutSession } from "@/lib/workout-log";

type Props = {
  activeSession?: WorkoutSession;
  latestCompleted?: WorkoutSession;
  completedSessionCount: number;
  routineCount: number;
  onStartWorkout: () => void;
  onContinueWorkout: () => void;
  onOpenRoutines: () => void;
  onOpenCalendar: () => void;
  onOpenExercises: () => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
}

export function HomeWorkspace({
  activeSession,
  latestCompleted,
  completedSessionCount,
  routineCount,
  onStartWorkout,
  onContinueWorkout,
  onOpenRoutines,
  onOpenCalendar,
  onOpenExercises,
}: Props) {
  const quickActions = [
    {
      title: "Elegir una rutina",
      description: routineCount ? `${routineCount} ${routineCount === 1 ? "rutina guardada" : "rutinas guardadas"}` : "Creá y guardá tu primera plantilla",
      icon: ClipboardList,
      action: onOpenRoutines,
      label: routineCount ? "Ver rutinas" : "Crear una rutina",
    },
    {
      title: "Revisar calendario",
      description: latestCompleted ? `Última sesión · ${formatDate(latestCompleted.date)}` : "Consultá tus sesiones por día",
      icon: CalendarDays,
      action: onOpenCalendar,
      label: "Abrir calendario",
    },
    {
      title: "Buscar ejercicios",
      description: "Explorá el catálogo de wger",
      icon: Search,
      action: onOpenExercises,
      label: "Explorar ejercicios",
    },
  ];

  return <div className="home-workspace space-y-6 sm:space-y-8">
    <section className="home-hero relative isolate grid min-h-[390px] overflow-hidden rounded-[28px] border border-[var(--separator)] bg-[var(--surface)] shadow-[var(--card-shadow)] sm:min-h-[440px] lg:grid-cols-[1.02fr_.98fr]">
      <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
        <p className="home-eyebrow inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-[var(--accent)]">
          <Dumbbell size={14} aria-hidden="true" /> My Workout App
        </p>
        <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.7rem]">
          {activeSession ? "Tu entrenamiento te espera." : "Entrená a tu manera."}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
          {activeSession
            ? `${activeSession.routineName || "Entrenamiento libre"} · ${activeSession.exercises.length} ${activeSession.exercises.length === 1 ? "ejercicio" : "ejercicios"} en curso.`
            : "Empezá una sesión libre o elegí una rutina. Registrá cada serie y seguí tu progreso desde el calendario."}
        </p>
        <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={activeSession ? onContinueWorkout : onStartWorkout}
            className="home-primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-fill)] px-5 text-sm font-bold text-[var(--accent-on-fill)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {activeSession ? "Continuar entrenamiento" : "Empezar sin rutina"}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onOpenRoutines}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--separator)] bg-[var(--surface-2)] px-5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <ClipboardList size={17} aria-hidden="true" />
            Elegir rutina
          </button>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--text-secondary)]" role="group" aria-label="Resumen de actividad">
          <span><strong className="mr-1 font-semibold text-[var(--text-primary)]">{completedSessionCount}</strong>{completedSessionCount === 1 ? "sesión completada" : "sesiones completadas"}</span>
          <span><strong className="mr-1 font-semibold text-[var(--text-primary)]">{routineCount}</strong>{routineCount === 1 ? "rutina guardada" : "rutinas guardadas"}</span>
        </div>
      </div>

      <div className="home-hero-art pointer-events-none absolute inset-y-0 right-0 z-0 flex w-full items-center justify-center overflow-hidden lg:relative lg:w-auto">
        <div className="home-art-glow absolute right-[4%] top-1/2 aspect-square w-[78%] -translate-y-1/2 rounded-full bg-[var(--accent-soft)] blur-3xl" aria-hidden="true" />
        <Image
          src="/my-workout-dumbbell.png"
          alt="Mancuerna low-poly plateada con el nombre My Workout App"
          width={1438}
          height={1094}
          priority
          sizes="(max-width: 1023px) 82vw, 48vw"
          className="home-dumbbell-motion relative z-10 h-auto w-[92%] max-w-[640px] object-contain opacity-[.23] sm:w-[78%] lg:w-[108%] lg:max-w-none lg:translate-x-[7%] lg:opacity-100"
        />
      </div>
    </section>

    <section aria-labelledby="home-shortcuts-title" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--accent)]">Accesos rápidos</p>
          <h2 id="home-shortcuts-title" className="mt-1 text-xl font-semibold">¿Qué querés hacer?</h2>
        </div>
        {activeSession && <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">Sesión en curso</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map(({ title, description, icon: Icon, action, label }) => (
          <button
            key={title}
            type="button"
            onClick={action}
            className="home-shortcut group flex min-h-[124px] items-start gap-4 rounded-2xl border border-[var(--separator)] bg-[var(--surface)] p-4 text-left shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--accent-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]" aria-hidden="true"><Icon size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-[var(--text-primary)]">{title}</span>
              <span className="mt-1 block text-sm leading-5 text-[var(--text-secondary)]">{description}</span>
              <span className="mt-3 inline-flex min-h-6 items-center gap-1 text-xs font-semibold text-[var(--accent)]">{label}<ArrowRight size={14} aria-hidden="true" /></span>
            </span>
          </button>
        ))}
      </div>
    </section>

    {latestCompleted && <p className="sr-only" aria-live="polite">Último entrenamiento completado: {latestCompleted.routineName || "entrenamiento libre"}, {formatDate(latestCompleted.date)}.</p>}
  </div>;
}
