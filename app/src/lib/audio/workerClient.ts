import { proxy, wrap } from "comlink";
import type { AudioProcessorWorkerApi } from "./workerApi";
import type { ProcessingOptions, ProcessingProgress, ProcessingResult } from "./types";

export type AudioProcessorClient = {
  process(
    file: File,
    options: ProcessingOptions,
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ProcessingResult>;
  dispose(): Promise<void>;
};

export function createAudioProcessorClient(): AudioProcessorClient {
  const worker = new Worker(new URL("../../../workers/audioProcessor.worker.ts", import.meta.url), {
    type: "module"
  });
  const api = wrap<AudioProcessorWorkerApi>(worker);

  return {
    process(file, options, onProgress) {
      return api.processAudio(file, options, proxy(onProgress));
    },
    async dispose() {
      await api.dispose();
      worker.terminate();
    }
  };
}
