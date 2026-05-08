import { z } from "zod";
import { defaultProcessingOptions, type ProcessingOptions } from "./types";

const STORAGE_KEY = "podcast-polisher-options-v1";

const ProcessingOptionsSchema = z.object({
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
});

export function loadProcessingOptions(): ProcessingOptions {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return defaultProcessingOptions;
  }

  const parsed = ProcessingOptionsSchema.safeParse(JSON.parse(stored));
  return parsed.success ? parsed.data : defaultProcessingOptions;
}

export function saveProcessingOptions(options: ProcessingOptions): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}
