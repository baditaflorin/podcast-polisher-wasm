import type {
  AudioFacts,
  AudioIssue,
  ConfidenceLabel,
  IssueSeverity,
  PreflightRecommendation,
  SourceShape
} from "./preflightTypes";

export const LARGE_FILE_BYTES = 50 * 1024 * 1024;

export function classifySourceShape(facts: AudioFacts): SourceShape {
  const lowerName = facts.fileName.toLowerCase();
  if (facts.container === "empty") {
    return "broken";
  }
  if (lowerName.includes("partial") || lowerName.includes("truncated")) {
    return "partial";
  }
  if (facts.sizeBytes >= LARGE_FILE_BYTES) {
    return "huge-episode";
  }
  if (facts.hasVideoContainer) {
    return "video-with-audio";
  }
  if (facts.codec === "speex") {
    return "legacy-format";
  }
  if (lowerName.match(/archive|historic|bell|tape|old/)) {
    return "archive";
  }
  if (facts.durationSeconds !== undefined && facts.durationSeconds < 60) {
    return "short-clip";
  }
  if (
    (facts.durationSeconds !== undefined && facts.durationSeconds >= 600) ||
    facts.sizeBytes >= 10 * 1024 * 1024
  ) {
    return "full-episode";
  }
  if (facts.sampleRateHz && facts.sampleRateHz <= 12_000) {
    return "archive";
  }

  return "unknown";
}

export function buildIssues(facts: AudioFacts, sourceShape: SourceShape): AudioIssue[] {
  const issues: AudioIssue[] = [];
  const fatal = fatalIssue(facts);
  if (fatal) {
    return [fatal];
  }

  addPartialAndShortClipIssues(issues, facts, sourceShape);
  addScaleAndFormatIssues(issues, facts, sourceShape);
  addAudioQualityIssues(issues, facts, sourceShape);
  return issues;
}

export function recommendProcessing(
  facts: AudioFacts,
  sourceShape: SourceShape,
  confidence: number
): PreflightRecommendation {
  if (sourceShape === "partial") {
    return {
      preset: "podcast",
      targetLufs: -16,
      confidence,
      reasons: ["Podcast preset kept because the source looks incomplete."]
    };
  }

  if (
    sourceShape === "archive" ||
    sourceShape === "legacy-format" ||
    (facts.sampleRateHz && facts.sampleRateHz <= 16_000)
  ) {
    return {
      preset: "archive",
      targetLufs: -23,
      confidence,
      reasons: ["Archive preset inferred from legacy or low-bandwidth speech."]
    };
  }
  if (facts.channels === 1) {
    return {
      preset: "voiceover",
      targetLufs: -19,
      confidence,
      reasons: ["Mono voice inferred from the channel layout."]
    };
  }

  return {
    preset: "podcast",
    targetLufs: -16,
    confidence,
    reasons: ["Podcast preset inferred as the safest default for this source."]
  };
}

export function issueCodes(issues: AudioIssue[]): string[] {
  return issues.map((issue) => issue.code).sort();
}

export function confidenceLabel(score: number): ConfidenceLabel {
  if (score > 0.8) {
    return "high";
  }
  if (score >= 0.45) {
    return "medium";
  }
  return "low";
}

function fatalIssue(facts: AudioFacts): AudioIssue | undefined {
  if (facts.container === "empty") {
    return issue(
      "empty-file",
      "fatal",
      "This recording is empty.",
      "The file has zero bytes, which usually means a recorder or export failed.",
      "Choose the original recording or export it again.",
      1
    );
  }

  if (facts.container === "unknown" || facts.codec === "unknown") {
    return issue(
      "unknown-format",
      "fatal",
      "This audio format is not recognized.",
      "The header and extension do not match a format this browser pipeline can safely inspect.",
      "Convert it to WAV, MP3, Ogg, Opus, FLAC, or M4A and try again.",
      1
    );
  }

  return undefined;
}

function addPartialAndShortClipIssues(
  issues: AudioIssue[],
  facts: AudioFacts,
  sourceShape: SourceShape
): void {
  if (sourceShape === "partial" || (facts.durationSeconds !== undefined && facts.durationSeconds < 15)) {
    issues.push(
      issue(
        "possible-partial-file",
        "warning",
        "This looks like a partial recording.",
        "The file name or duration suggests only part of the episode is present.",
        "Confirm this is the complete source before exporting.",
        0.45
      )
    );
  }

  if (facts.sizeBytes > 0 && facts.sizeBytes < 16 * 1024) {
    issues.push(
      issue(
        "possible-partial-file",
        "warning",
        "This file is too small to trust.",
        "Tiny media files are often failed, partial, or placeholder exports.",
        "Find the original recording before processing.",
        0.45
      )
    );
  }

  if (sourceShape === "short-clip" || sourceShape === "partial") {
    issues.push(
      issue(
        "short-clip-loudness-sample",
        "warning",
        "Loudness may not represent a full episode.",
        "Short clips do not provide enough program material for a reliable podcast-wide loudness profile.",
        "Use the full recording when possible, or review the result before publishing.",
        0.28
      )
    );
  }
}

function addScaleAndFormatIssues(issues: AudioIssue[], facts: AudioFacts, sourceShape: SourceShape): void {
  if (sourceShape === "huge-episode") {
    issues.push(
      issue(
        "large-file-memory-risk",
        "warning",
        "This is a large in-browser job.",
        "The file is big enough to put pressure on WebAssembly memory.",
        "Keep the tab open, or split the source before processing if the browser struggles.",
        0.35
      )
    );
  }

  if (
    (facts.durationSeconds !== undefined && facts.durationSeconds > 900) ||
    (facts.sizeBytes >= 10 * 1024 * 1024 && !facts.hasVideoContainer)
  ) {
    issues.push(
      issue(
        "long-job",
        "warning",
        "This will take a while.",
        "Full episodes require a loudness measurement pass before export.",
        "Use Cancel if the estimate no longer makes sense.",
        0.1
      )
    );
  }

  if (facts.hasVideoContainer) {
    issues.push(
      issue(
        "video-audio-extract",
        "warning",
        "Audio will be extracted from a video container.",
        "The pipeline ignores video frames and polishes only the audio track.",
        "Continue if this is the track you want to publish.",
        0.25
      )
    );
  }
}

function addAudioQualityIssues(issues: AudioIssue[], facts: AudioFacts, sourceShape: SourceShape): void {
  if (facts.codec === "opus") {
    issues.push(
      issue(
        "alternate-codec-review",
        "warning",
        "This is an alternate podcast codec.",
        "Opus is supported through FFmpeg, but decode cost can differ from MP3.",
        "Review the export before replacing the original.",
        0.15
      )
    );
  }
  if (facts.codec === "speex") {
    issues.push(
      issue(
        "legacy-codec-review",
        "warning",
        "This is a legacy Speex/Ogg recording.",
        "Speex is common in older podcast archives and can need archive-friendly settings.",
        "Use the archive preset unless you know this is a modern recording.",
        0.45
      )
    );
  }
  if (facts.codec === "speex" && facts.durationSeconds === undefined) {
    issues.push(
      issue(
        "duration-unavailable",
        "warning",
        "Duration is not available before FFmpeg runs.",
        "Browsers often cannot preview legacy Speex metadata.",
        "Expect a less precise time estimate.",
        0.15
      )
    );
  }
  if (facts.sampleRateHz !== undefined && facts.sampleRateHz <= 16_000) {
    issues.push(
      issue(
        "low-sample-rate-review",
        "warning",
        "This is low-bandwidth speech.",
        "The sample rate is far below modern podcast masters.",
        "Archive settings usually preserve it better than aggressive cleanup.",
        0.2
      )
    );
  }
  if (hasNonAscii(facts.fileName)) {
    issues.push(
      issue(
        "unicode-filename-normalized",
        "warning",
        "The export name will be normalized.",
        "Some players and podcast hosts still behave better with plain ASCII filenames.",
        "The original title is preserved in metadata.",
        0
      )
    );
  }
  if (sourceShape === "archive" && !issues.some((item) => item.code === "low-sample-rate-review")) {
    issues.push(
      issue(
        "archival-audio-review-denoise",
        "warning",
        "This sounds like archival material.",
        "Historic or degraded recordings can be harmed by aggressive denoise.",
        "Review the denoise amount before publishing.",
        0.25
      )
    );
  }
}

function hasNonAscii(value: string): boolean {
  return Array.from(value).some((char) => char.charCodeAt(0) > 127);
}

function issue(
  code: string,
  severity: IssueSeverity,
  what: string,
  why: string,
  nowWhat: string,
  confidenceImpact: number
): AudioIssue {
  return { code, severity, what, why, nowWhat, confidenceImpact };
}
