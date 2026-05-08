export type ExportFormat = "mp3" | "wav";
export type NoiseReductionMode = "rnnoise" | "spectral" | "off";
export type ProcessingStage = "loading" | "preparing" | "measuring" | "processing" | "exporting" | "complete";

export type ProcessingOptions = {
  preset: "podcast" | "voiceover" | "archive";
  targetLufs: number;
  truePeakDb: number;
  lra: number;
  highpassHz: number;
  lowpassHz: number;
  noiseReduction: NoiseReductionMode;
  denoiseMix: number;
  removeSilence: boolean;
  format: ExportFormat;
  mp3BitrateKbps: number;
};

export type ProcessingProgress = {
  stage: ProcessingStage;
  ratio: number;
  message: string;
};

export type ProcessingSummary = {
  inputName: string;
  outputName: string;
  outputBytes: number;
  durationSeconds?: number;
  measuredInputLufs?: number;
  measuredOutputOffset?: number;
  usedRnnoise: boolean;
  filterChain: string;
};

export type ProcessingResult = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  command: string[];
  measurementCommand: string[];
  logs: string;
  summary: ProcessingSummary;
};

export type SerializedProcessingError = {
  code: "ffmpeg_load_failed" | "ffmpeg_exec_failed" | "unsupported_file" | "unknown";
  message: string;
  detail?: string;
};

export const defaultProcessingOptions: ProcessingOptions = {
  preset: "podcast",
  targetLufs: -16,
  truePeakDb: -1.5,
  lra: 11,
  highpassHz: 80,
  lowpassHz: 16000,
  noiseReduction: "rnnoise",
  denoiseMix: 0.85,
  removeSilence: true,
  format: "mp3",
  mp3BitrateKbps: 192
};
