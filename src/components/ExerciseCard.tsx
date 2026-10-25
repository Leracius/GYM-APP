"use client";

import React, { useState } from "react";
import { WgerExerciseInfo, WgerTranslation } from "@/types/wger";
import { Dumbbell, ChevronRight, Layers } from "lucide-react";

interface ExerciseCardProps {
  exercise: WgerExerciseInfo;
  onSelect: (exercise: WgerExerciseInfo) => void;
}

export function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);

  const translation: WgerTranslation | undefined =
    exercise.translations.find((t) => t.language === 4) ||
    exercise.translations.find((t) => t.language === 2) ||
    exercise.translations[0];

  const exerciseName = translation?.name || `Ejercicio #${exercise.id}`;
  const cleanDescription =
    translation?.description_source ||
    translation?.description?.replace(/<[^>]*>?/gm, "").trim() ||
    "Sin descripción disponible.";

  const mainImage = exercise.images.find((img) => img.is_main) || exercise.images[0];
  const imageUrl = mainImage?.thumbnails?.medium || mainImage?.image;

  return (
    <button
      onClick={() => onSelect(exercise)}
      className="group w-full text-left rounded-xl overflow-hidden transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.99] animate-slide-up"
      style={{
        background: "rgba(28, 28, 30, 0.72)",
        backdropFilter: "saturate(180%) blur(40px)",
        WebkitBackdropFilter: "saturate(180%) blur(40px)",
        border: "0.5px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 8px 30px -12px rgba(0, 0, 0, 0.8)",
      }}
    >
      <div className="flex flex-col">
        {/* Image Area */}
        <div className="relative w-full h-36 bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-center overflow-hidden">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={exerciseName}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Dumbbell className="w-9 h-9 text-[rgba(235,235,245,0.3)]" strokeWidth={1.5} />
            </div>
          )}

          {exercise.category?.name && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{
                background: "rgba(28, 28, 30, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "0.5px solid rgba(255, 255, 255, 0.18)",
                color: "rgba(235, 235, 245, 0.9)",
              }}
            >
              {exercise.category.name}
            </div>
          )}

          {exercise.images.length > 1 && (
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1 text-[10px]"
              style={{
                background: "rgba(28, 28, 30, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "0.5px solid rgba(255, 255, 255, 0.18)",
                color: "rgba(235, 235, 245, 0.6)",
              }}
            >
              <Layers className="w-3 h-3" />
              <span>{exercise.images.length}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-semibold text-[14px] leading-tight tracking-tight line-clamp-1 flex-1">
              {exerciseName}
            </h3>
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "rgba(235, 235, 245, 0.3)" }} />
          </div>

          <p className="text-[12px] leading-relaxed line-clamp-1" style={{ color: "rgba(235, 235, 245, 0.5)" }}>
            {cleanDescription}
          </p>

          {(exercise.muscles?.length > 0 || exercise.equipment?.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {exercise.muscles?.slice(0, 1).map((m) => (
                <span
                  key={m.id}
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: "rgba(10, 132, 255, 0.18)",
                    color: "#0a84ff",
                    border: "0.5px solid rgba(10, 132, 255, 0.3)",
                  }}
                >
                  {m.name_en || m.name}
                </span>
              ))}
              {exercise.equipment?.slice(0, 1).map((eq) => (
                <span
                  key={eq.id}
                  className="px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "rgba(235, 235, 245, 0.6)",
                    border: "0.5px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  {eq.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
