"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vetaui/atoms";
import { useHydrated } from "@/lib/use-hydrated";
import { TONES, type ToneOption } from "@/lib/types";

type ToneSelectProps = {
  value: ToneOption;
  onChange: (value: ToneOption) => void;
  disabled?: boolean;
};

function formatTone(t: ToneOption): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function ToneSelect({ value, onChange, disabled }: ToneSelectProps) {
  const hydrated = useHydrated();
  const label = formatTone(value);

  if (!hydrated) {
    return (
      <div
        className="editorial-select-trigger flex h-[2.75rem] w-full max-w-full items-center justify-between gap-2 px-4 text-sm"
        aria-hidden
      >
        <span>{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-4 shrink-0 opacity-50"
          aria-hidden
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ToneOption)}
      disabled={disabled}
    >
      <SelectTrigger
        id="tone"
        size="md"
        appearance="filled"
        className="editorial-select-trigger w-full max-w-full"
      >
        <SelectValue placeholder="Elige un tono" />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={6}
        className="editorial-select-content max-h-[min(16rem,50vh)]"
      >
        {TONES.map((t) => (
          <SelectItem key={t} value={t}>
            {formatTone(t)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
