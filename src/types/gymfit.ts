export interface GymFitExerciseSummary {
  id: string;
  name: string;
  slug?: string | null;
  bodyPart?: string | null;
  equipment?: string | null;
  category?: string | null;
  difficulty?: string | null;
  primaryGroups?: string[];
  popularity?: number | null;
}

export interface GymFitExerciseDetail extends GymFitExerciseSummary {
  instructions: Array<{ order: number; description: string }>;
  description?: string | null;
  targetMuscles: Array<{ id: string; name: string; commonName?: string | null; group?: string | null }>;
  secondaryMuscles: Array<{ id: string; name: string; commonName?: string | null; group?: string | null }>;
  tips?: string[];
  mistakes?: string[];
  aliases?: string[];
  secondaryGroups?: string[];
  variations?: GymFitExerciseSummary[];
  alternatives?: GymFitAlternative[];
  easier?: GymFitProgression[];
  harder?: GymFitProgression[];
}

export interface GymFitAlternative extends GymFitExerciseSummary {
  score: number;
  reasons: string[];
}

export interface GymFitProgression extends GymFitExerciseSummary {
  step?: number;
}

export interface GymFitFacet {
  value: string;
  count: number;
}

export interface GymFitFacets {
  category: GymFitFacet[];
  difficulty: GymFitFacet[];
  tier: GymFitFacet[];
  equipment: GymFitFacet[];
  muscleGroup: GymFitFacet[];
}

export interface GymFitSearchResponse {
  total: number;
  count: number;
  results: GymFitExerciseSummary[];
  suggestion?: string;
  facets?: GymFitFacets;
}

export interface GymFitMuscle {
  id: string;
  name: string;
  commonName?: string | null;
  bodyPart?: string | null;
  group?: string | null;
  aliases?: string[];
  heads?: string[];
}

export interface GymFitMuscleGroup {
  id: string;
  name: string;
  aliases: string[];
  muscles: GymFitMuscle[];
}

export interface GymFitMuscleSearchResponse {
  results: GymFitMuscle[];
  total: number;
  count: number;
}

export interface GymFitSuggestionResponse {
  results: Array<Pick<GymFitExerciseSummary, "id" | "slug" | "name" | "equipment" | "category">>;
  count: number;
}
