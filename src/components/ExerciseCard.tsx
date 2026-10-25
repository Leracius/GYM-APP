"use client";

import React, { useState } from "react";
import { WgerExerciseInfo, WgerTranslation } from "@/types/wger";
import { Dumbbell, Eye, Layers, ArrowUpRight } from "lucide-react";

interface ExerciseCardProps {
  exercise: WgerExerciseInfo;
  onSelect: (exercise: WgerExerciseInfo) => void;
}

export function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);

  // Find preferred translation: Spanish (4), then English (2), then first available
  const translation: WgerTranslation | undefined =
    exercise.translations.find((t) => t.language === 4) ||
    exercise.translations.find((t) => t.language === 2) ||
    exercise.translations[0];

  const exerciseName = translation?.name || `Ejercicio #${exercise.id}`;
  const cleanDescription = translation?.description_source || 
    translation?.description?.replace(/<[^>]*>?/gm, "").trim() ||
    "Sin descripción disponible para este ejercicio.";

  const mainImage = exercise.images.find((img) => img.is_main) || exercise.images[0];
  const imageUrl = mainImage?.thumbnails?.medium || mainImage?.image;

  return (
    <div
      onClick={() => onSelect(exercise)}
      className="group bracket cursor-pointer bg-zinc-950/90 border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
      style={{ backdropFilter: "blur(16px)" }}
    >
      <div>
        {/* Visual Frame / Media Area */}
        <div className="img-wrapper relative w-full h-52 bg-[#050505] flex items-center justify-center border-b border-white/[0.06]">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={exerciseName}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-700 gap-2 p-4 text-center">
              <Dumbbell className="w-10 h-10 stroke-[1.2] text-zinc-800 group-hover:text-zinc-500 transition-colors" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                SIN VISTA PREVIA
              </span>
            </div>
          )}

          {/* Top Left: Category Badge */}
          {exercise.category?.name && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/[0.12] px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-200">
                {exercise.category.name}
              </span>
            </div>
          )}

          {/* Top Right: Image Count Badge */}
          {exercise.images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-white/[0.1] text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1">
              <Layers className="w-3 h-3 text-zinc-400" />
              <span>{exercise.images.length} IMÁGENES</span>
            </div>
          )}

          {/* Bottom Right ID Pill */}
          <span className="absolute bottom-2.5 right-3 font-mono text-[9px] text-zinc-500 bg-black/60 px-2 py-0.5 rounded border border-white/[0.05]">
            #{exercise.id}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display font-bold text-base text-zinc-100 group-hover:text-white transition-colors line-clamp-1 tracking-tight">
              {exerciseName}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
          </div>

          <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed font-normal">
            {cleanDescription}
          </p>

          {/* Target Muscles and Equipment Chips */}
          <div className="space-y-2.5 pt-1 border-t border-white/[0.04]">
            {exercise.muscles && exercise.muscles.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                  Objetivo:
                </span>
                {exercise.muscles.slice(0, 2).map((m) => (
                  <span
                    key={m.id}
                    className="font-mono text-[10px] font-medium bg-zinc-900 border border-white/[0.08] text-zinc-300 px-2 py-0.5 rounded-md"
                  >
                    {m.name_en || m.name}
                  </span>
                ))}
                {exercise.muscles.length > 2 && (
                  <span className="font-mono text-[9px] text-zinc-500">
                    +{exercise.muscles.length - 2}
                  </span>
                )}
              </div>
            )}

            {exercise.equipment && exercise.equipment.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                  Equipo:
                </span>
                {exercise.equipment.map((eq) => (
                  <span
                    key={eq.id}
                    className="font-mono text-[10px] text-zinc-400 bg-zinc-900/60 border border-white/[0.05] px-2 py-0.5 rounded-md"
                  >
                    {eq.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Strip */}
      <div className="px-5 pb-4 pt-1">
        <div className="w-full py-2 px-3 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.08] border border-white/[0.06] group-hover:border-white/[0.15] text-zinc-300 group-hover:text-white font-mono text-[11px] font-semibold flex items-center justify-between transition-all">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            Ver detalles y datos crudos
          </span>
          <span className="text-zinc-500 group-hover:text-zinc-300">&rarr;</span>
        </div>
      </div>
    </div>
  );
}
