export type WorkoutSet = {
  id: string;
  reps: number | null;
  weight: number | null;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  wgerId?: number;
  name: string;
  sets: WorkoutSet[];
};

export type WorkoutSession = {
  id: string;
  date: string;
  startedAt: string;
  endedAt?: string;
  status: "in_progress" | "completed";
  exercises: WorkoutExercise[];
  notes: string;
  restEndsAt?: number;
};

export type WorkoutLog = {
  version: 1;
  sessions: WorkoutSession[];
};

const STORAGE_KEY = "gym-systems.workout-log.v1";

export function readWorkoutLog(): WorkoutLog {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { version: 1, sessions: [] };
    const parsed = JSON.parse(stored) as WorkoutLog;
    if (parsed.version !== 1 || !Array.isArray(parsed.sessions)) {
      return { version: 1, sessions: [] };
    }
    return parsed;
  } catch {
    return { version: 1, sessions: [] };
  }
}

export function writeWorkoutLog(sessions: WorkoutSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sessions } satisfies WorkoutLog));
  } catch {
    // Keep the live session usable if storage is unavailable or full.
  }
}

export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
