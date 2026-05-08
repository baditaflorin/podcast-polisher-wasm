import type { ProcessingOptions, ProcessingProgress, ProcessingResult } from "./types";

export type AudioProcessorWorkerApi = {
  processAudio(
    file: File,
    options: ProcessingOptions,
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ProcessingResult>;
  dispose(): Promise<void>;
};
