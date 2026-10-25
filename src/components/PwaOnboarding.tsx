"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, ChevronLeft, Download, MoreHorizontal, PlusSquare, Share, X } from "lucide-react";

type InstallChoice = "install" | "bookmark" | null;
type Platform = "ios" | "android" | "desktop";

interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "my-workout-app.install-invite-dismissed";

function runningAsInstalledApp() {
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

export function PwaOnboarding() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<InstallChoice>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installAvailable, setInstallAvailable] = useState(false);
  const deferredPrompt = useRef<DeferredInstallPrompt | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
    }

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const nextPlatform: Platform = isIOS ? "ios" : /Android/i.test(navigator.userAgent) ? "android" : "desktop";
    const timer = window.setTimeout(() => {
      setPlatform(nextPlatform);
      if (!runningAsInstalledApp() && window.localStorage.getItem(DISMISSED_KEY) !== "true") setOpen(true);
    }, 650);

    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as DeferredInstallPrompt;
      setInstallAvailable(true);
    };
    const installed = () => {
      deferredPrompt.current = null;
      window.localStorage.setItem(DISMISSED_KEY, "true");
      setInstallAvailable(false);
      setOpen(false);
      setChoice(null);
    };
    const openPrompt = () => {
      if (!runningAsInstalledApp()) {
        setChoice(null);
        setOpen(true);
      }
    };

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("my-workout-app:show-install", openPrompt);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("my-workout-app:show-install", openPrompt);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();
    }, 0);
    const keepFocusInDialog = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", keepFocusInDialog);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", keepFocusInDialog);
      previouslyFocused?.focus();
    };
  }, [open]);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setOpen(false);
    setChoice(null);
  }

  async function installApp() {
    const prompt = deferredPrompt.current;
    if (!prompt) {
      setChoice("install");
      return;
    }
    await prompt.prompt();
    const result = await prompt.userChoice;
    deferredPrompt.current = null;
    setInstallAvailable(false);
    if (result.outcome === "accepted") dismiss();
    else setChoice("install");
  }

  if (!open) return null;
  const ChoiceIcon = choice === "install" ? Download : Bookmark;

  return (
    <div className="pwa-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
      <section ref={dialogRef} className="pwa-dialog" role="dialog" aria-modal="true" aria-labelledby="pwa-title" tabIndex={-1}>
        <button className="pwa-close" onClick={dismiss} aria-label="Cerrar invitación"><X className="h-5 w-5" /></button>
        {choice ? <>
          <button className="pwa-back" onClick={() => setChoice(null)}><ChevronLeft className="h-4 w-4" />Volver</button>
          <div className="pwa-icon"><ChoiceIcon className="h-6 w-6" /></div>
          <p className="pwa-eyebrow">My Workout App</p>
          <h2 id="pwa-title">{choice === "install" ? "Instalala en tu dispositivo" : "Guardala en favoritos"}</h2>
          {choice === "install" && installAvailable ? <p className="pwa-description">Tu navegador puede instalar la app directamente. La instalación abre My Workout App en una ventana propia.</p> : <ol className="pwa-steps">
            {choice === "install" ? platform === "ios" ? <>
              <li><span>1</span><span>Tocá <strong>Compartir</strong> en la barra de Safari.</span><Share className="h-4 w-4" /></li>
              <li><span>2</span><span>Elegí <strong>Agregar a pantalla de inicio</strong>.</span><PlusSquare className="h-4 w-4" /></li>
              <li><span>3</span><span>Confirmá con <strong>Agregar</strong>.</span><Check className="h-4 w-4" /></li>
            </> : platform === "android" ? <>
              <li><span>1</span><span>Abrí el menú del navegador.</span><MoreHorizontal className="h-4 w-4" /></li>
              <li><span>2</span><span>Tocá <strong>Instalar app</strong> o <strong>Agregar a pantalla principal</strong>.</span><Download className="h-4 w-4" /></li>
              <li><span>3</span><span>Confirmá la instalación.</span><Check className="h-4 w-4" /></li>
            </> : <>
              <li><span>1</span><span>Buscá el botón de instalación en la barra de direcciones o en el menú del navegador.</span><Download className="h-4 w-4" /></li>
              <li><span>2</span><span>Elegí <strong>Instalar My Workout App</strong> y confirmá.</span><Check className="h-4 w-4" /></li>
            </> : platform === "ios" ? <>
              <li><span>1</span><span>En Safari, tocá <strong>Compartir</strong>.</span><Share className="h-4 w-4" /></li>
              <li><span>2</span><span>Elegí <strong>Agregar marcador</strong> y guardalo.</span><Bookmark className="h-4 w-4" /></li>
            </> : platform === "android" ? <>
              <li><span>1</span><span>Abrí el menú del navegador.</span><MoreHorizontal className="h-4 w-4" /></li>
              <li><span>2</span><span>Tocá la estrella o <strong>Agregar a favoritos</strong>.</span><Bookmark className="h-4 w-4" /></li>
            </> : <>
              <li><span>1</span><span>Usá <strong>{/Mac/i.test(navigator.platform) ? "⌘ + D" : "Ctrl + D"}</strong> para guardar esta página.</span><Bookmark className="h-4 w-4" /></li>
              <li><span>2</span><span>Elegí la carpeta de favoritos y confirmá.</span><Check className="h-4 w-4" /></li>
            </>}</ol>}
          <button className="pwa-primary" onClick={choice === "install" && installAvailable ? installApp : dismiss}>{choice === "install" && installAvailable ? "Instalar app" : "Listo"}</button>
        </> : <>
          <div className="pwa-icon"><Download className="h-6 w-6" /></div>
          <p className="pwa-eyebrow">Llevala con vos</p>
          <h2 id="pwa-title">Tu entrenamiento, a un toque.</h2>
          <p className="pwa-description">Agregá My Workout App a tu dispositivo o guardala en favoritos para volver rápido cuando estés en el gimnasio.</p>
          <div className="pwa-actions">
            <button className="pwa-primary" onClick={installApp}><Download className="h-4 w-4" />Instalar como app</button>
            <button className="pwa-secondary" onClick={() => setChoice("bookmark")}><Bookmark className="h-4 w-4" />Guardar en favoritos</button>
          </div>
          <button className="pwa-later" onClick={dismiss}>Ahora no</button>
        </>}
      </section>
    </div>
  );
}
