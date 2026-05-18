"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@vetaui/atoms";
import { Text } from "@vetaui/templates";
import {
  Check,
  Loader2,
  PenLine,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  formatElapsed,
  phaseFromElapsed,
} from "@/lib/use-generation-timer";

const STEPS = [
  {
    icon: Search,
    label: "Investigador",
    tool: "Tavily",
    hints: [
      "Buscando noticias de la última semana…",
      "Comparando fuentes y relevancia…",
      "Armando el dossier con 3 noticias…",
    ],
  },
  {
    icon: PenLine,
    label: "Redactor",
    tool: "Gemini",
    hints: [
      "Redactando el gancho del post…",
      "Estructurando el borrador para LinkedIn…",
      "Ajustando tono y longitud…",
    ],
  },
  {
    icon: Sparkles,
    label: "Editor",
    tool: "Gemini",
    hints: [
      "Revisando datos frente al dossier…",
      "Puliendo claridad y CTA…",
      "Preparando la versión final…",
    ],
  },
] as const;

function progressPercent(elapsed: number, phase: number): number {
  const caps = [38, 72, 92];
  const base = phase > 0 ? caps[phase - 1]! : 0;
  const span = (caps[phase] ?? 92) - base;
  const phaseElapsed =
    phase === 0
      ? Math.min(elapsed, 25)
      : phase === 1
        ? Math.min(Math.max(elapsed - 25, 0), 75)
        : Math.min(Math.max(elapsed - 100, 0), 120);
  const phaseMax = phase === 0 ? 25 : phase === 1 ? 75 : 120;
  const within = phaseMax > 0 ? (phaseElapsed / phaseMax) * span : span;
  return Math.min(Math.round(base + within), 92);
}

type GenerationProgressProps = {
  topic: string;
  tone: string;
  elapsed: number;
  onCancel: () => void;
};

export function GenerationProgress({
  topic,
  tone,
  elapsed,
  onCancel,
}: GenerationProgressProps) {
  const phase = phaseFromElapsed(elapsed);
  const hintIndex = Math.floor(elapsed / 5) % STEPS[phase].hints.length;
  const statusLine = STEPS[phase].hints[hintIndex];
  const percent = progressPercent(elapsed, phase);

  return (
    <motion.section
      className="editorial-generation"
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="editorial-generation-glow"
        aria-hidden
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="editorial-generation-inner">
        <header className="editorial-generation-head">
          <motion.div
            className="editorial-generation-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-6 w-6" strokeWidth={2} aria-hidden />
          </motion.div>
          <motion.div
            className="editorial-generation-head-text"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="editorial-generation-title">Tu equipo está trabajando</p>
            <Text tone="muted" className="editorial-generation-subtitle">
              <span className="editorial-generation-topic" title={topic}>
                {topic}
              </span>
              <span className="editorial-generation-meta"> · tono {tone}</span>
            </Text>
          </motion.div>
          <div className="editorial-generation-timer" aria-label="Tiempo transcurrido">
            <span className="editorial-generation-timer-value">
              {formatElapsed(elapsed)}
            </span>
            <span className="editorial-generation-timer-label">transcurrido</span>
          </div>
        </header>

        <motion.p
          key={statusLine}
          className="editorial-generation-status"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {statusLine}
        </motion.p>

        <motion.div
          className="editorial-generation-bar"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso estimado"
        >
          <motion.div
            className="editorial-generation-bar-fill"
            initial={{ width: "8%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <span className="editorial-generation-bar-shimmer" aria-hidden />
        </motion.div>

        <p className="editorial-generation-hint">
          Suele tardar <strong>2–8 minutos</strong>. No cierres la pestaña ni reinicies
          uvicorn mientras corre.
        </p>

        <ol className="editorial-generation-steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < phase;
            const current = i === phase;
            return (
              <li
                key={step.label}
                className={`editorial-generation-step${done ? " is-done" : ""}${current ? " is-active" : ""}`}
              >
                <span className="editorial-generation-step-icon" aria-hidden>
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : current ? (
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </motion.span>
                  ) : (
                    <Icon className="h-4 w-4 opacity-40" strokeWidth={1.75} />
                  )}
                </span>
                <span className="editorial-generation-step-body">
                  <span className="editorial-generation-step-label">{step.label}</span>
                  <span className="editorial-generation-step-tool">{step.tool}</span>
                </span>
                {current && (
                  <span className="editorial-generation-step-badge">En curso</span>
                )}
              </li>
            );
          })}
        </ol>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="editorial-generation-cancel"
          onClick={onCancel}
          leftIcon={<X className="h-4 w-4 shrink-0" />}
        >
          Cancelar generación
        </Button>
      </div>
    </motion.section>
  );
}
