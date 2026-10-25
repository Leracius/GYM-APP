export interface WgerCategory {
  id: number;
  name: string;
}

export interface WgerMuscle {
  id: number;
  name: string;
  name_en?: string;
  is_front?: boolean;
  image_url_main?: string;
  image_url_secondary?: string;
}

export interface WgerEquipment {
  id: number;
  name: string;
}

export interface WgerImageThumbnail {
  small?: string;
  medium?: string;
}

export interface WgerImage {
  id: number;
  uuid: string;
  image: string;
  thumbnails?: WgerImageThumbnail;
  is_main: boolean;
  style?: string;
}

export interface WgerTranslation {
  id: number;
  uuid: string;
  name: string;
  exercise: number;
  description: string;
  description_source?: string;
  language: number; // 2 = English, 4 = Spanish, etc.
  notes?: Array<{ id: number; comment: string }>;
  aliases?: Array<{ id: number; alias: string }>;
}

export interface WgerExerciseInfo {
  id: number;
  uuid: string;
  category: WgerCategory;
  muscles: WgerMuscle[];
  muscles_secondary: WgerMuscle[];
  equipment: WgerEquipment[];
  translations: WgerTranslation[];
  images: WgerImage[];
  variation_group?: string;
}

export interface WgerApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
