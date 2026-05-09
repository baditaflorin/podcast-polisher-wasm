import { z } from "zod";
import type { AudioPreflight } from "./preflight";
import type { ProcessingOptions, ProcessingResult } from "./types";

export const PROJECT_STATE_SCHEMA_VERSION = "podcast-polisher.state.v1";

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

const SourceSummarySchema = z.object({
  id: z.string(),
  fileName: z.string(),
  sizeBytes: z.number(),
  sourceShape: z.string(),
  confidenceLabel: z.string(),
  container: z.string(),
  codec: z.string(),
  durationSeconds: z.number().optional()
});

const OutputSummarySchema = z.object({
  fileName: z.string(),
  bytes: z.number(),
  mimeType: z.string(),
  measuredInputLufs: z.number().optional()
});

export const ProjectStateSchema = z.object({
  schemaVersion: z.literal(PROJECT_STATE_SCHEMA_VERSION),
  savedAt: z.string(),
  app: z.object({
    version: z.string(),
    commit: z.string()
  }),
  options: ProcessingOptionsSchema,
  source: SourceSummarySchema.optional(),
  output: OutputSummarySchema.optional(),
  note: z.string()
});

export type ProjectState = z.infer<typeof ProjectStateSchema>;

export function createProjectState({
  app,
  options,
  preflight,
  result,
  savedAt = new Date().toISOString()
}: {
  app: { version: string; commit: string };
  options: ProcessingOptions;
  preflight?: AudioPreflight;
  result?: ProcessingResult;
  savedAt?: string;
}): ProjectState {
  return {
    schemaVersion: PROJECT_STATE_SCHEMA_VERSION,
    savedAt,
    app,
    options,
    source: preflight
      ? {
          id: preflight.facts.sourceId,
          fileName: preflight.facts.fileName,
          sizeBytes: preflight.facts.sizeBytes,
          sourceShape: preflight.sourceShape,
          confidenceLabel: preflight.confidenceLabel,
          container: preflight.facts.container,
          codec: preflight.facts.codec,
          durationSeconds: preflight.facts.durationSeconds
        }
      : undefined,
    output: result
      ? {
          fileName: result.fileName,
          bytes: result.summary.outputBytes,
          mimeType: result.mimeType,
          measuredInputLufs: result.summary.measuredInputLufs
        }
      : undefined,
    note: "This state file restores processing settings and audit context. It does not embed the private audio bytes."
  };
}

export function parseProjectState(text: string): ProjectState {
  return ProjectStateSchema.parse(JSON.parse(text));
}

export function projectStateFileName(preflight?: AudioPreflight): string {
  const baseName = preflight?.facts.normalizedBaseName || "podcast-polisher";
  return `${baseName}.state.json`;
}
