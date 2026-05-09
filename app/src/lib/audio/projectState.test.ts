import { describe, expect, it } from "vitest";
import { createProjectState, parseProjectState, projectStateFileName } from "./projectState";
import { defaultProcessingOptions } from "./types";
import type { AudioPreflight } from "./preflight";

const preflight = {
  facts: {
    sourceId: "aud-demo-1234",
    fileName: "Demo Episode.mp3",
    normalizedBaseName: "Demo-Episode",
    sizeBytes: 123,
    container: "mp3",
    codec: "mp3",
    durationSeconds: 9
  },
  sourceShape: "short-clip",
  confidenceLabel: "high"
} as AudioPreflight;

describe("project state", () => {
  it("round-trips exported settings and source context", () => {
    const state = createProjectState({
      app: { version: "0.3.0", commit: "abc123" },
      options: defaultProcessingOptions,
      preflight,
      savedAt: "2026-05-09T00:00:00.000Z"
    });

    expect(parseProjectState(JSON.stringify(state))).toEqual(state);
    expect(state.note).toContain("does not embed");
  });

  it("uses the normalized source name for state downloads", () => {
    expect(projectStateFileName(preflight)).toBe("Demo-Episode.state.json");
  });
});
