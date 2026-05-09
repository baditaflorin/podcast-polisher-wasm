import type { AudioCodec, AudioContainer } from "./signatures";
import type { ProcessingOptions } from "./types";

export type SourceShape =
  | "archive"
  | "broken"
  | "full-episode"
  | "huge-episode"
  | "legacy-format"
  | "partial"
  | "short-clip"
  | "unknown"
  | "video-with-audio";

export type ConfidenceLabel = "high" | "low" | "medium";
export type IssueSeverity = "fatal" | "info" | "warning";

export type AudioIssue = {
  code: string;
  severity: IssueSeverity;
  what: string;
  why: string;
  nowWhat: string;
  confidenceImpact: number;
};

export type PreflightRecommendation = {
  preset: ProcessingOptions["preset"];
  targetLufs: number;
  confidence: number;
  reasons: string[];
};

export type AudioFacts = {
  fileName: string;
  normalizedBaseName: string;
  extension: string;
  sizeBytes: number;
  sizeMb: number;
  container: AudioContainer;
  codec: AudioCodec;
  channels?: number;
  sampleRateHz?: number;
  bitrateKbps?: number;
  durationSeconds?: number;
  sourceId: string;
  hasVideoContainer: boolean;
};

export type AudioPreflight = {
  schemaVersion: 1;
  canProcess: boolean;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  facts: AudioFacts;
  sourceShape: SourceShape;
  recommendation: PreflightRecommendation;
  issues: AudioIssue[];
  warnings: AudioIssue[];
  fatalIssues: AudioIssue[];
  explanations: string[];
  analysisMs: number;
};
