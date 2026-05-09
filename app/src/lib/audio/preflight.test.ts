/// <reference types="node" />

import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { analyzeAudioFile, clearPreflightCache, issueCodes } from "./preflight";

type Manifest = {
  fixtures: Array<{ id: string; file: string }>;
};

type Expected = {
  id: string;
  canProcess: boolean;
  container: string;
  codec: string;
  sourceShape: string;
  recommendedPreset: string;
  confidenceLabel: string;
  warningCodes: string[];
  fatalCodes: string[];
};

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const fixtureDir = join(repoRoot, "test/fixtures/realdata");

describe("audio preflight", () => {
  it("matches the real-data fixture contracts", async () => {
    clearPreflightCache();
    const manifest = await readJson<Manifest>("manifest.json");

    for (const fixture of manifest.fixtures) {
      const expected = await readJson<Expected>(
        `${basename(fixture.file, extension(fixture.file))}.expected.json`
      );
      const file = await readFixtureFile(fixture.file);
      const preflight = await analyzeAudioFile(file);

      expect(preflight.canProcess, fixture.id).toBe(expected.canProcess);
      expect(preflight.facts.container, fixture.id).toBe(expected.container);
      expect(preflight.facts.codec, fixture.id).toBe(expected.codec);
      expect(preflight.sourceShape, fixture.id).toBe(expected.sourceShape);
      expect(preflight.recommendation.preset, fixture.id).toBe(expected.recommendedPreset);
      expect(preflight.confidenceLabel, fixture.id).toBe(expected.confidenceLabel);
      expect(issueCodes(preflight.warnings), fixture.id).toEqual([...expected.warningCodes].sort());
      expect(issueCodes(preflight.fatalIssues), fixture.id).toEqual([...expected.fatalCodes].sort());
      expect(preflight.facts.sourceId, fixture.id).toMatch(/^aud-[a-zA-Z0-9_.-]+-[a-f0-9]{8}$/);
    }
  });

  it("is deterministic for identical input", async () => {
    clearPreflightCache();
    const file = await readFixtureFile("partial-mp3.mp3");
    const first = await analyzeAudioFile(file);
    clearPreflightCache();
    const second = await analyzeAudioFile(file);

    expect({ ...first, analysisMs: 0 }).toEqual({ ...second, analysisMs: 0 });
  });

  it("handles synthetic adversarial edge cases without crashing", async () => {
    clearPreflightCache();
    const cases = [
      new File([], "empty.wav"),
      new File([new Uint8Array([0, 1, 2, 3, 4])], "unknown.bin"),
      new File([new Uint8Array([0x49, 0x44, 0x33, 0, 0, 0, 0, 0, 0, 20])], "malformed.mp3"),
      new File([new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0, 0])], "broken.ogg"),
      new File([new Uint8Array([0x66, 0x74, 0x79, 0x70])], "wrong-offset.mp4")
    ];

    for (const file of cases) {
      const preflight = await analyzeAudioFile(file);
      expect(preflight.confidence).toBeGreaterThanOrEqual(0);
      expect(preflight.confidence).toBeLessThanOrEqual(1);
      expect(preflight.issues.length).toBeGreaterThan(0);
    }
  });
});

async function readFixtureFile(fileName: string): Promise<File> {
  const bytes = await readFile(join(fixtureDir, fileName));
  return new File([new Uint8Array(bytes)], fileName, { lastModified: 0 });
}

async function readJson<T>(fileName: string): Promise<T> {
  return JSON.parse(await readFile(join(fixtureDir, fileName), "utf8")) as T;
}

function extension(fileName: string): string {
  return fileName.match(/\.[^.]+$/)?.[0] ?? "";
}
