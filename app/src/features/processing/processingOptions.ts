import type { ProcessingOptions } from "../../lib/audio/types";

export function optionsForPreset(
  current: ProcessingOptions,
  nextPreset: ProcessingOptions["preset"]
): ProcessingOptions {
  if (nextPreset === "voiceover") {
    return {
      ...current,
      preset: nextPreset,
      targetLufs: -19,
      highpassHz: 90,
      lowpassHz: 14500,
      denoiseMix: 0.9,
      removeSilence: true
    };
  }

  if (nextPreset === "archive") {
    return {
      ...current,
      preset: nextPreset,
      targetLufs: -23,
      highpassHz: 55,
      lowpassHz: 18000,
      denoiseMix: 0.55,
      removeSilence: false
    };
  }

  return {
    ...current,
    preset: nextPreset,
    targetLufs: -16,
    highpassHz: 80,
    lowpassHz: 16000,
    denoiseMix: 0.85,
    removeSilence: true
  };
}
