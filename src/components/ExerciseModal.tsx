"use client";

import React, { useState } from "react";
import { WgerExerciseInfo, WgerTranslation } from "@/types/wger";
import { X, Dumbbell, Activity, Info, Code, Image as ImageIcon, Layers, Copy, Check } from "lucide-react";

interface ExerciseModalProps {
  exercise: WgerExerciseInfo | null;
  onClose: () => void;
}

export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "images" | "json">("overview");
  const [copied, setCopied] = useState(false);

  if (!exercise) return null;

  const translation: WgerTranslation | undefined =
    exercise.translations.find((t) => t.language === 4) ||
    exercise.translations.find((t) => t.language === 2) ||
    exercise.translations[0];

  const exerciseName = translation?.name || `Ejercicio #${exercise.id}`;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(exercise, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="exercise-modal-backdrop fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="exercise-modal bracket bg-zinc-950 border border-white/[0.12] w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ backdropFilter: "blur(24px)" }}
      >
        {/* Header HUD */}
        <div className="px-6 py-4 bg-black/70 border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.1] text-zinc-300 uppercase tracking-wider">
                {exercise.category?.name || "General"}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                UUID: {exercise.uuid.slice(0, 8)}...
              </span>
            </div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-tight">
              {exerciseName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-white/[0.08] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/[0.06] bg-black/40 px-6 font-mono text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 tracking-wider ${
              activeTab === "overview"
                ? "border-white text-white bg-white/[0.04]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            01 / DETALLES Y MÚSCULOS
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 tracking-wider ${
              activeTab === "images"
                ? "border-white text-white bg-white/[0.04]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            02 / MULTIMEDIA ({exercise.images.length})
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-2 tracking-wider ${
              activeTab === "json"
                ? "border-white text-white bg-white/[0.04]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            03 / JSON CRUDO
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Description */}
              <div>
                <span className="hud text-zinc-500 block mb-2">Instrucciones y consejos de forma</span>
                {translation?.description ? (
                  <div
                    className="prose prose-invert prose-sm text-zinc-300 max-w-none bg-[#070707] p-5 rounded-xl border border-white/[0.06] leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: translation.description }}
                  />
                ) : (
                  <p className="text-sm text-zinc-500 italic bg-[#070707] p-4 rounded-xl border border-white/[0.06]">
                    No hay descripción registrada en la API para este ejercicio.
                  </p>
                )}
              </div>

              {/* Muscles with anatomical images */}
              <div>
                <span className="hud text-zinc-500 block mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Músculos Principales ({exercise.muscles.length})
                </span>
                {exercise.muscles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exercise.muscles.map((muscle) => (
                      <div
                        key={muscle.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#080808] border border-white/[0.06]"
                      >
                        {muscle.image_url_main ? (
                          <img
                            src={muscle.image_url_main}
                            alt={muscle.name}
                            className="w-12 h-12 object-contain bg-black/60 rounded-lg p-1 border border-white/[0.06]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600">
                            <Activity className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-white font-display">
                            {muscle.name_en || muscle.name}
                          </div>
                          <div className="text-xs text-zinc-500 italic font-mono">{muscle.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 font-mono">Músculo objetivo no especificado</p>
                )}
              </div>

              {/* Secondary Muscles */}
              {exercise.muscles_secondary && exercise.muscles_secondary.length > 0 && (
                <div>
                  <span className="hud text-zinc-500 block mb-2.5">
                    Músculos Secundarios ({exercise.muscles_secondary.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscles_secondary.map((sm) => (
                      <span
                        key={sm.id}
                        className="font-mono text-xs bg-zinc-900 text-zinc-400 px-3 py-1 rounded-lg border border-white/[0.06]"
                      >
                        {sm.name_en || sm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              <div>
                <span className="hud text-zinc-500 block mb-2.5 flex items-center gap-2">
                  <Dumbbell className="w-3.5 h-3.5 text-zinc-400" />
                  Equipamiento Necesario
                </span>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipment.length > 0 ? (
                    exercise.equipment.map((eq) => (
                      <span
                        key={eq.id}
                        className="font-mono text-xs bg-zinc-900 text-zinc-200 px-3 py-1.5 rounded-lg border border-white/[0.1]"
                      >
                        {eq.name}
                      </span>
                    ))
                  ) : (
                    <span className="font-mono text-xs text-zinc-500 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-white/[0.05]">
                      Peso corporal (sin equipamiento)
                    </span>
                  )}
                </div>
              </div>

              {/* Translations Available */}
              <div>
                <span className="hud text-zinc-500 block mb-2.5 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  Traducciones Disponibles ({exercise.translations.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {exercise.translations.map((tr) => (
                    <span
                      key={tr.id}
                      className="font-mono text-[11px] bg-[#070707] border border-white/[0.06] text-zinc-400 px-2.5 py-1 rounded-md"
                    >
                      {tr.name} <span className="text-zinc-600">({tr.language})</span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "images" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exercise.images.length > 0 ? (
                exercise.images.map((img) => (
                  <div
                    key={img.id}
                    className="bg-[#070707] border border-white/[0.08] rounded-xl p-3 flex flex-col items-center group/img"
                  >
                    <div className="w-full h-56 flex items-center justify-center overflow-hidden rounded-lg bg-black/60 p-2">
                      <img
                        src={img.thumbnails?.medium || img.image}
                        alt={exerciseName}
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between w-full font-mono text-[11px] text-zinc-400">
                      <span>Imagen #{img.id}</span>
                      {img.is_main && (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                          VISTA PRINCIPAL
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-16 text-zinc-600 font-mono text-xs">
                  NO HAY IMÁGENES DISPONIBLES PARA ESTE EJERCICIO
                </div>
              )}
            </div>
          )}

          {activeTab === "json" && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={handleCopyJson}
                  className="font-mono text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-white/[0.1] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">COPIADO</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPIAR JSON</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#070707] p-4 rounded-xl border border-white/[0.06] overflow-x-auto">
                <pre className="text-xs font-mono text-zinc-300 whitespace-pre">
                  {JSON.stringify(exercise, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
