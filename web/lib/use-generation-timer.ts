import * as React from "react";

/** Fases estimadas (la API no hace streaming; son guías visuales). */
export function phaseFromElapsed(seconds: number): number {
  if (seconds < 25) return 0;
  if (seconds < 100) return 1;
  return 2;
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useGenerationTimer(active: boolean) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const tick = () =>
      setElapsed(Math.floor((Date.now() - started) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  const phase = phaseFromElapsed(elapsed);
  return { elapsed, phase };
}
