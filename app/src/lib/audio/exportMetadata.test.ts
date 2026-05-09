import { describe, expect, it } from "vitest";
import { createExportMetadata, metadataFileName, stableJson } from "./exportMetadata";
import type { AudioPreflight } from "./preflight";
import { defaultProcessingOptions, type ProcessingResult } from "./types";

describe("export metadata", () => {
  it("creates deterministic provenance JSON when generatedAt is fixed", () => {
    const first = stableJson(
      createExportMetadata({
        app: { version: "0.2.0", commit: "abc123", builtAt: "static" },
        generatedAt: "2026-05-09T00:00:00.000Z",
        options: defaultProcessingOptions,
        preflight: preflightFixture,
        result: resultFixture
      })
    );
    const second = stableJson(
      createExportMetadata({
        app: { version: "0.2.0", commit: "abc123", builtAt: "static" },
        generatedAt: "2026-05-09T00:00:00.000Z",
        options: defaultProcessingOptions,
        preflight: preflightFixture,
        result: resultFixture
      })
    );

    expect(second).toBe(first);
    expect(first).toContain('"schemaVersion": "podcast-polisher.provenance.v1"');
    expect(first).toContain('"warningCodes"');
  });

  it("derives a metadata sidecar name from the audio export", () => {
    expect(metadataFileName("episode-polished.mp3")).toBe("episode-polished.metadata.json");
  });
});

const preflightFixture: AudioPreflight = {
  schemaVersion: 1,
  canProcess: true,
  confidence: 0.72,
  confidenceLabel: "medium",
  facts: {
    fileName: "episode.mp3",
    normalizedBaseName: "episode",
    extension: "mp3",
    sizeBytes: 1234,
    sizeMb: 0.01,
    container: "mp3",
    codec: "mp3",
    sourceId: "aud-episode-12345678",
    hasVideoContainer: false
  },
  sourceShape: "short-clip",
  recommendation: {
    preset: "podcast",
    targetLufs: -16,
    confidence: 0.72,
    reasons: ["Podcast preset inferred as the safest default for this source."]
  },
  issues: [
    {
      code: "short-clip-loudness-sample",
      severity: "warning",
      what: "Loudness may not represent a full episode.",
      why: "Short clips do not provide enough program material.",
      nowWhat: "Review the result.",
      confidenceImpact: 0.28
    }
  ],
  warnings: [
    {
      code: "short-clip-loudness-sample",
      severity: "warning",
      what: "Loudness may not represent a full episode.",
      why: "Short clips do not provide enough program material.",
      nowWhat: "Review the result.",
      confidenceImpact: 0.28
    }
  ],
  fatalIssues: [],
  explanations: ["Podcast preset inferred as the safest default for this source."],
  analysisMs: 1
};

const resultFixture: ProcessingResult = {
  bytes: new Uint8Array([1, 2, 3]),
  fileName: "episode-polished.mp3",
  mimeType: "audio/mpeg",
  command: ["-i", "input.mp3", "episode-polished.mp3"],
  measurementCommand: ["-i", "input.mp3", "-f", "null", "-"],
  logs: "",
  summary: {
    inputName: "episode.mp3",
    outputName: "episode-polished.mp3",
    outputBytes: 3,
    measuredInputLufs: -18.2,
    usedRnnoise: true,
    filterChain: "loudnorm"
  }
};
