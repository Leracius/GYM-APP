"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface ApiResponseViewerProps {
  data: unknown;
  count?: number;
  targetUrl?: string;
  query?: string;
}

export function ApiResponseViewer({
  data,
  count,
  targetUrl,
  query,
}: ApiResponseViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="bracket bg-zinc-950 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl relative z-10"
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Top Header / Console HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-black/60 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              Explorador API REST
            </span>
            <span className="font-mono text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              200 OK
            </span>
            {typeof count === "number" && (
              <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-white/[0.08] px-2 py-0.5 rounded">
                {count.toLocaleString()} objetos
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Enlace Directo</span>
            </a>
          )}

          <button
            onClick={handleCopy}
            className="font-mono text-[11px] text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/[0.08] flex items-center gap-1.5 transition-colors font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIADO</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>COPIAR JSON</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-mono text-[11px] text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 rounded-lg border border-white/[0.1] flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>CONTRAER</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>EXPANDIR</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target URL banner */}
      {targetUrl && (
        <div className="px-5 py-2 bg-black/40 border-b border-white/[0.04] flex items-center gap-2 font-mono text-[11px] text-zinc-400 overflow-x-auto">
          <span className="text-emerald-400 font-bold">GET</span>
          <span className="text-zinc-500">→</span>
          <span className="text-zinc-300 select-all">{targetUrl}</span>
          {query && (
            <span className="ml-auto text-zinc-500 text-[10px]">
              filtro: <span className="text-zinc-300 font-semibold">&quot;{query}&quot;</span>
            </span>
          )}
        </div>
      )}

      {/* Code Container */}
      <div
        className={`relative overflow-auto p-5 bg-[#070707] font-mono text-xs transition-all duration-300 ${
          isExpanded ? "max-h-[750px]" : "max-h-80"
        }`}
      >
        <pre className="text-zinc-300 leading-relaxed whitespace-pre font-mono selection:bg-white/20">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
