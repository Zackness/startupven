"use client";

import { useRef, useCallback, useState } from "react";
import { useZxing } from "react-zxing";

export type QRScannerProps = {
  onResult: (ticketId: string) => void;
  /** Pausar escaneo tras un resultado durante este tiempo (ms) para evitar repeticiones. */
  pauseAfterResultMs?: number;
  /** Clase CSS para el contenedor del video. */
  className?: string;
};

export function QRScanner({
  onResult,
  pauseAfterResultMs = 2500,
  className = "",
}: QRScannerProps) {
  const [paused, setPaused] = useState(false);
  const lastResultRef = useRef<string | null>(null);

  const handleDecode = useCallback(
    (result: { getText(): string }) => {
      const text = result.getText()?.trim();
      if (!text || paused) return;
      if (lastResultRef.current === text) return;
      lastResultRef.current = text;
      onResult(text);
      setPaused(true);
      setTimeout(() => {
        lastResultRef.current = null;
        setPaused(false);
      }, pauseAfterResultMs);
    },
    [onResult, pauseAfterResultMs, paused]
  );

  const { ref: videoRef } = useZxing({
    onDecodeResult: handleDecode,
    timeBetweenDecodingAttempts: 150,
    paused,
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
  });

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
      {/* Marco de escaneo (opcional, ayuda a enfocar) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-56 w-56 rounded-xl border-4 border-white/80 shadow-lg sm:h-72 sm:w-72" />
      </div>
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-black">
            Escaneado. Escaneando de nuevo en un momento…
          </span>
        </div>
      )}
    </div>
  );
}
