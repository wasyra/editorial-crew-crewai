import type { EditorialResult } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8001";

/** 3 agentes + Tavily + Gemini pueden superar 10 min en la primera ejecución. */
const GENERATE_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_GENERATE_TIMEOUT_MS ?? 1_500_000,
); // 25 min
const GENERATE_TIMEOUT_MIN = Math.round(GENERATE_TIMEOUT_MS / 60_000);

function mergeAbortSignals(...signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail =
      typeof body?.detail === "string"
        ? body.detail
        : `Error ${res.status}`;
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function generatePost(
  topic: string,
  tone: string,
  signal?: AbortSignal,
): Promise<EditorialResult> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(
    () => timeoutController.abort(),
    GENERATE_TIMEOUT_MS,
  );

  const onAbort = () => clearTimeout(timeout);
  signal?.addEventListener("abort", onAbort, { once: true });

  const linked = signal
    ? mergeAbortSignals(signal, timeoutController.signal)
    : timeoutController.signal;

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, tone }),
      signal: linked,
    });
    return parseJson<EditorialResult>(res);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      if (signal?.aborted && !timeoutController.signal.aborted) {
        throw new Error("Generación cancelada.");
      }
      throw new Error(
        `La generación superó ${GENERATE_TIMEOUT_MIN} minutos. ` +
          "Mira la terminal de uvicorn: si ves «Generando post», sigue en curso — " +
          "arranca la API sin --reload (scripts/run-api.ps1) y vuelve a intentar con un tema corto.",
      );
    }
    if (e instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con la API (puerto 8000). Si uvicorn se reinició, recarga esta página (F5) e inténtalo de nuevo.",
      );
    }
    throw e;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
