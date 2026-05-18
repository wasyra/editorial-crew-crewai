export const TONES = [
  "profesional",
  "divulgativo",
  "inspirador",
  "directo",
] as const;

export type ToneOption = (typeof TONES)[number];

export interface EditorialResult {
  topic: string;
  tone: string;
  research: string;
  draft: string;
  final: string;
  raw: string;
  elapsed_seconds: number;
  run_dir: string | null;
}
