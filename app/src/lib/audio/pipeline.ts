import { z } from "zod";
import type { ExportFormat, NoiseReductionMode, ProcessingOptions } from "./types";

export type LoudnormMeasurement = {
  inputI: number;
  inputTp: number;
  inputLra: number;
  inputThresh: number;
  targetOffset: number;
};

type PipelineCapabilities = {
  rnnoiseModelPath: string;
  rnnoiseAvailable: boolean;
};

const LoudnormJsonSchema = z.object({
  input_i: z.coerce.number(),
  input_tp: z.coerce.number(),
  input_lra: z.coerce.number(),
  input_thresh: z.coerce.number(),
  target_offset: z.coerce.number()
});

export function buildMeasurementFilter(
  options: ProcessingOptions,
  capabilities: PipelineCapabilities
): string {
  return [...buildCleanupFilters(options, capabilities), buildLoudnormFilter(options)].join(",");
}

export function buildFinalFilter(
  options: ProcessingOptions,
  capabilities: PipelineCapabilities,
  measurement?: LoudnormMeasurement
): string {
  return [
    ...buildCleanupFilters(options, capabilities),
    buildLoudnormFilter(options, measurement),
    buildLimiterFilter(options.truePeakDb),
    "aresample=48000"
  ].join(",");
}

export function buildMeasurementArgs(inputName: string, filterChain: string): string[] {
  return ["-hide_banner", "-nostats", "-i", inputName, "-vn", "-af", filterChain, "-f", "null", "-"];
}

export function buildProcessingArgs(
  inputName: string,
  outputName: string,
  filterChain: string,
  format: ExportFormat,
  mp3BitrateKbps: number
): string[] {
  const codecArgs =
    format === "mp3"
      ? ["-codec:a", "libmp3lame", "-b:a", `${mp3BitrateKbps}k`, "-ar", "48000"]
      : ["-codec:a", "pcm_s16le", "-ar", "48000"];

  return ["-hide_banner", "-nostats", "-i", inputName, "-vn", "-af", filterChain, ...codecArgs, outputName];
}

export function parseLoudnormMeasurement(logText: string): LoudnormMeasurement | undefined {
  const blocks = logText.match(/\{\s*"input_i"[\s\S]*?\}/g);
  const lastBlock = blocks?.at(-1);

  if (!lastBlock) {
    return undefined;
  }

  const parsed = LoudnormJsonSchema.safeParse(JSON.parse(lastBlock));

  if (!parsed.success) {
    return undefined;
  }

  return {
    inputI: parsed.data.input_i,
    inputTp: parsed.data.input_tp,
    inputLra: parsed.data.input_lra,
    inputThresh: parsed.data.input_thresh,
    targetOffset: parsed.data.target_offset
  };
}

export function createOutputName(inputName: string, format: ExportFormat): string {
  const baseName = inputName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-");
  return `${baseName || "podcast"}-polished.${format}`;
}

export function mimeTypeForFormat(format: ExportFormat): string {
  return format === "mp3" ? "audio/mpeg" : "audio/wav";
}

export function shouldUseRnnoise(mode: NoiseReductionMode, rnnoiseAvailable: boolean): boolean {
  return mode === "rnnoise" && rnnoiseAvailable;
}

function buildCleanupFilters(options: ProcessingOptions, capabilities: PipelineCapabilities): string[] {
  const filters: string[] = [];

  if (options.highpassHz > 0) {
    filters.push(`highpass=f=${Math.round(options.highpassHz)}`);
  }

  if (options.lowpassHz > 0) {
    filters.push(`lowpass=f=${Math.round(options.lowpassHz)}`);
  }

  if (options.removeSilence) {
    filters.push("silenceremove=start_periods=1:start_duration=0.25:start_threshold=-48dB");
  }

  if (shouldUseRnnoise(options.noiseReduction, capabilities.rnnoiseAvailable)) {
    filters.push(
      `arnndn=m=${capabilities.rnnoiseModelPath}:mix=${clamp(options.denoiseMix, 0, 1).toFixed(2)}`
    );
  } else if (options.noiseReduction === "spectral") {
    filters.push("afftdn=nr=12:nf=-28");
  }

  filters.push("acompressor=threshold=-20dB:ratio=2.4:attack=12:release=180:makeup=2");

  return filters;
}

function buildLoudnormFilter(options: ProcessingOptions, measurement?: LoudnormMeasurement): string {
  const base = [`I=${options.targetLufs}`, `TP=${options.truePeakDb}`, `LRA=${options.lra}`];

  if (!measurement) {
    return `loudnorm=${[...base, "print_format=json"].join(":")}`;
  }

  return `loudnorm=${[
    ...base,
    `measured_I=${measurement.inputI}`,
    `measured_TP=${measurement.inputTp}`,
    `measured_LRA=${measurement.inputLra}`,
    `measured_thresh=${measurement.inputThresh}`,
    `offset=${measurement.targetOffset}`,
    "linear=true",
    "print_format=summary"
  ].join(":")}`;
}

function buildLimiterFilter(truePeakDb: number): string {
  const linearLimit = Math.pow(10, truePeakDb / 20);
  return `alimiter=limit=${clamp(linearLimit, 0.01, 1).toFixed(3)}:level=disabled`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
