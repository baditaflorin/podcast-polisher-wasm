import { z } from "zod";
import { defaultProcessingOptions, type ProcessingOptions } from "./types";

const STORAGE_KEY = "podcast-polisher-session-v1";

const SessionStateSchema = z.object({
  options: z.object({
    preset: z.enum(["podcast", "voiceover", "archive"]),
    targetLufs: z.number(),
    truePeakDb: z.number(),
    lra: z.number(),
    highpassHz: z.number(),
    lowpassHz: z.number(),
    noiseReduction: z.enum(["rnnoise", "spectral", "off"]),
    denoiseMix: z.number(),
    removeSilence: z.boolean(),
    format: z.enum(["mp3", "wav"]),
    mp3BitrateKbps: z.number()
  }),
  selectedFileName: z.string().optional(),
  selectedFileSize: z.number().optional(),
  lastState: z.enum(["idle", "analyzing", "blocked", "cancelled", "done", "error", "ready", "running"]),
  updatedAt: z.string()
});

export type PersistedSessionState = z.infer<typeof SessionStateSchema>;

export function loadSessionState(): PersistedSessionState | undefined {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return undefined;
  }

  const parsed = SessionStateSchema.safeParse(JSON.parse(stored));
  return parsed.success ? parsed.data : undefined;
}

export function saveSessionState(state: {
  options: ProcessingOptions;
  selectedFileName?: string;
  selectedFileSize?: number;
  lastState: PersistedSessionState["lastState"];
}): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      updatedAt: new Date().toISOString()
    })
  );
}

export function clearSessionState(): ProcessingOptions {
  window.localStorage.removeItem(STORAGE_KEY);
  return defaultProcessingOptions;
}
