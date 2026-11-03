import { createId } from "@/lib/workout-log";

export type RoutineExercise = {
  id: string;
  name: string;
  wgerId: number;
  setCount: number;
};

export type WorkoutRoutine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
};

export type RoutineDraft = Pick<WorkoutRoutine, "name" | "exercises">;

const STORAGE_KEY = "gym-systems.routines.v1";

export function readRoutines(): WorkoutRoutine[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WorkoutRoutine =>
      Boolean(item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.exercises)),
    );
  } catch {
    return [];
  }
}

export function writeRoutines(routines: WorkoutRoutine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  } catch {
    // Keep routine editing usable for the current page if storage is unavailable.
  }
}

export function createRoutine(draft: RoutineDraft): WorkoutRoutine {
  const now = new Date().toISOString();
  return { id: createId(), name: draft.name.trim(), exercises: draft.exercises, createdAt: now, updatedAt: now };
}

