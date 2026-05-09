import type { AudioPreflight } from "./preflight";
import type { ProcessingOptions, ProcessingResult } from "./types";

export type BuildInfo = {
  version: string;
  commit: string;
  builtAt: string;
};

export type ExportMetadata = {
  schemaVersion: "podcast-polisher.provenance.v1";
  generatedAt: string;
  app: BuildInfo;
  source: {
    id: string;
    fileName: string;
    normalizedBaseName: string;
    sizeBytes: number;
    container: string;
    codec: string;
    channels?: number;
    sampleRateHz?: number;
    durationSeconds?: number;
  };
  inference: {
    sourceShape: string;
    confidence: number;
    confidenceLabel: string;
    recommendedPreset: string;
    warningCodes: string[];
    fatalCodes: string[];
    explanations: string[];
  };
  options: ProcessingOptions;
  output: {
    fileName: string;
    bytes: number;
    mimeType: string;
    measuredInputLufs?: number;
    measuredOutputOffset?: number;
  };
  commands: {
    measurement: string[];
    processing: string[];
  };
};

export function createExportMetadata({
  app,
  generatedAt = new Date().toISOString(),
  options,
  preflight,
  result
}: {
  app: BuildInfo;
  generatedAt?: string;
  options: ProcessingOptions;
  preflight: AudioPreflight;
  result: ProcessingResult;
}): ExportMetadata {
  return {
    schemaVersion: "podcast-polisher.provenance.v1",
    generatedAt,
    app,
    source: {
      id: preflight.facts.sourceId,
      fileName: preflight.facts.fileName,
      normalizedBaseName: preflight.facts.normalizedBaseName,
      sizeBytes: preflight.facts.sizeBytes,
      container: preflight.facts.container,
      codec: preflight.facts.codec,
      channels: preflight.facts.channels,
      sampleRateHz: preflight.facts.sampleRateHz,
      durationSeconds: preflight.facts.durationSeconds
    },
    inference: {
      sourceShape: preflight.sourceShape,
      confidence: Number(preflight.confidence.toFixed(2)),
      confidenceLabel: preflight.confidenceLabel,
      recommendedPreset: preflight.recommendation.preset,
      warningCodes: preflight.warnings.map((issue) => issue.code).sort(),
      fatalCodes: preflight.fatalIssues.map((issue) => issue.code).sort(),
      explanations: [...preflight.explanations].sort()
    },
    options,
    output: {
      fileName: result.fileName,
      bytes: result.summary.outputBytes,
      mimeType: result.mimeType,
      measuredInputLufs: result.summary.measuredInputLufs,
      measuredOutputOffset: result.summary.measuredOutputOffset
    },
    commands: {
      measurement: result.measurementCommand,
      processing: result.command
    }
  };
}

export function metadataFileName(audioFileName: string): string {
  return audioFileName.replace(/\.[^.]+$/, ".metadata.json");
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(sortForJson(value), null, 2)}\n`;
}

function sortForJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortForJson);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, sortForJson(entryValue)])
    );
  }

  return value;
}
