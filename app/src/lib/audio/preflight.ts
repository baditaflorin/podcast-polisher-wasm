import { detectAudioSignature, estimateDurationSeconds } from "./signatures";
import { buildIssues, classifySourceShape, confidenceLabel, recommendProcessing } from "./sourceInference";
import type { AudioFacts, AudioPreflight } from "./preflightTypes";
export type {
  AudioFacts,
  AudioIssue,
  AudioPreflight,
  ConfidenceLabel,
  IssueSeverity,
  PreflightRecommendation,
  SourceShape
} from "./preflightTypes";
export { confidenceLabel, issueCodes } from "./sourceInference";

type AnalyzeOptions = {
  mediaProbe?: (
    file: File
  ) => Promise<Partial<Pick<AudioFacts, "channels" | "durationSeconds" | "sampleRateHz">>>;
};

const SAMPLE_BYTES = 512 * 1024;
const LAST_SAMPLE_BYTES = 64 * 1024;

const preflightCache = new Map<string, AudioPreflight>();

export async function analyzeAudioFile(file: File, options: AnalyzeOptions = {}): Promise<AudioPreflight> {
  const started = performance.now();
  const cacheKey = `${file.name}:${file.size}:${file.lastModified}`;
  const cached = preflightCache.get(cacheKey);
  if (cached) {
    return { ...cached, analysisMs: 0 };
  }

  const extension = extensionOf(file.name);
  const head = new Uint8Array(await file.slice(0, SAMPLE_BYTES).arrayBuffer());
  const tail =
    file.size > SAMPLE_BYTES
      ? new Uint8Array(await file.slice(Math.max(0, file.size - LAST_SAMPLE_BYTES)).arrayBuffer())
      : new Uint8Array();
  const signature = detectAudioSignature(head, extension, file.size);
  const probed = await probeSafely(file, options.mediaProbe);
  const normalizedBaseName = normalizeBaseName(file.name);
  const facts: AudioFacts = {
    fileName: file.name,
    normalizedBaseName,
    extension,
    sizeBytes: file.size,
    sizeMb: round(file.size / 1024 / 1024, 2),
    container: signature.container,
    codec: signature.codec,
    channels: probed.channels ?? signature.channels,
    sampleRateHz: probed.sampleRateHz ?? signature.sampleRateHz,
    bitrateKbps: signature.bitrateKbps,
    durationSeconds: probed.durationSeconds ?? estimateDurationSeconds(signature, file.size),
    sourceId: sourceId(file.name, file.size, head, tail),
    hasVideoContainer: signature.container === "mp4"
  };
  const sourceShape = classifySourceShape(facts);
  const issues = buildIssues(facts, sourceShape);
  const fatalIssues = issues.filter((issue) => issue.severity === "fatal");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const confidence = fatalIssues.length
    ? 0
    : clamp(1 - warnings.reduce((sum, issue) => sum + issue.confidenceImpact, 0), 0, 1);
  const recommendation = recommendProcessing(facts, sourceShape, confidence);
  const preflight: AudioPreflight = {
    schemaVersion: 1,
    canProcess: fatalIssues.length === 0,
    confidence,
    confidenceLabel: confidenceLabel(confidence),
    facts,
    sourceShape,
    recommendation,
    issues,
    warnings,
    fatalIssues,
    explanations: [...recommendation.reasons, ...issues.map((issue) => issue.why)],
    analysisMs: Math.round(performance.now() - started)
  };

  preflightCache.set(cacheKey, preflight);
  return preflight;
}

export function clearPreflightCache(): void {
  preflightCache.clear();
}

async function probeSafely(
  file: File,
  mediaProbe?: AnalyzeOptions["mediaProbe"]
): Promise<Partial<Pick<AudioFacts, "channels" | "durationSeconds" | "sampleRateHz">>> {
  if (!mediaProbe) {
    return {};
  }

  try {
    return await mediaProbe(file);
  } catch {
    return {};
  }
}

function sourceId(fileName: string, sizeBytes: number, head: Uint8Array, tail: Uint8Array): string {
  const seed = `${normalizeBaseName(fileName)}:${sizeBytes}`;
  return `aud-${normalizeBaseName(fileName).slice(0, 24)}-${fnv1a(seed, head, tail)}`;
}

function fnv1a(seed: string, ...chunks: Uint8Array[]): string {
  let hash = 0x811c9dc5;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  for (const chunk of chunks) {
    for (const byte of chunk) {
      hash ^= byte;
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return hash.toString(16).padStart(8, "0");
}

function normalizeBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return (
    withoutExtension
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "podcast"
  );
}

function extensionOf(fileName: string): string {
  return fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? "";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, places: number): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}
