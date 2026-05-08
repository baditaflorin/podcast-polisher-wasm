import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import * as Comlink from "comlink";
import coreUrl from "@ffmpeg/core?url";
import wasmUrl from "@ffmpeg/core/wasm?url";
import rnnoiseModelUrl from "../src/assets/models/std.rnnn?url";
import {
  buildFinalFilter,
  buildMeasurementArgs,
  buildMeasurementFilter,
  buildProcessingArgs,
  createOutputName,
  mimeTypeForFormat,
  parseLoudnormMeasurement
} from "../src/lib/audio/pipeline";
import type { ProcessingProgress, ProcessingResult, SerializedProcessingError } from "../src/lib/audio/types";
import type { AudioProcessorWorkerApi } from "../src/lib/audio/workerApi";

const RNNOISE_MODEL_PATH = "std.rnnn";

let ffmpeg: FFmpeg | undefined;
let rnnoiseModelLoaded = false;
let logs: string[] = [];

const api: AudioProcessorWorkerApi = {
  async processAudio(file, options, onProgress) {
    try {
      if (!file.size) {
        throw createWorkerError("unsupported_file", "Choose an audio file with content.");
      }

      report(onProgress, "loading", 0.03, "Loading FFmpeg WASM");
      const instance = await ensureFfmpeg();

      report(onProgress, "preparing", 0.1, "Preparing local files");
      await ensureRnnoiseModel(instance);

      const inputName = stableInputName(file.name);
      const outputName = createOutputName(file.name, options.format);
      await instance.writeFile(inputName, await fetchFile(file));

      const capabilities = {
        rnnoiseAvailable: options.noiseReduction === "rnnoise" && rnnoiseModelLoaded,
        rnnoiseModelPath: RNNOISE_MODEL_PATH
      };
      const measurementFilter = buildMeasurementFilter(options, capabilities);
      const measurementCommand = buildMeasurementArgs(inputName, measurementFilter);

      report(onProgress, "measuring", 0.2, "Measuring EBU R128 loudness");
      const measurementLog = await execOrThrow(instance, measurementCommand);
      const measurement = parseLoudnormMeasurement(measurementLog);

      const finalFilter = buildFinalFilter(options, capabilities, measurement);
      const command = buildProcessingArgs(
        inputName,
        outputName,
        finalFilter,
        options.format,
        options.mp3BitrateKbps
      );

      report(onProgress, "processing", 0.45, "Applying cleanup and loudness normalization");
      await execOrThrow(instance, command);

      report(onProgress, "exporting", 0.92, "Preparing download");
      const bytes = await instance.readFile(outputName);

      await cleanupFiles(instance, [inputName, outputName]);
      report(onProgress, "complete", 1, "Export ready");

      if (!(bytes instanceof Uint8Array)) {
        throw createWorkerError("ffmpeg_exec_failed", "FFmpeg returned an unexpected output type.");
      }

      return {
        bytes,
        fileName: outputName,
        mimeType: mimeTypeForFormat(options.format),
        command,
        measurementCommand,
        logs: [...logs].join("\n"),
        summary: {
          inputName: file.name,
          outputName,
          outputBytes: bytes.byteLength,
          measuredInputLufs: measurement?.inputI,
          measuredOutputOffset: measurement?.targetOffset,
          usedRnnoise: capabilities.rnnoiseAvailable,
          filterChain: finalFilter
        }
      } satisfies ProcessingResult;
    } catch (error) {
      throw new ProcessingWorkerError(normalizeError(error));
    }
  },

  dispose() {
    ffmpeg?.terminate();
    ffmpeg = undefined;
    rnnoiseModelLoaded = false;
    logs = [];
    return Promise.resolve();
  }
};

async function ensureFfmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) {
    return ffmpeg;
  }

  logs = [];
  ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
    logs.push(message);
  });

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(coreUrl, "text/javascript"),
      wasmURL: await toBlobURL(wasmUrl, "application/wasm")
    });
  } catch (error) {
    throw createWorkerError(
      "ffmpeg_load_failed",
      "FFmpeg WASM could not be loaded in this browser.",
      stringifyError(error)
    );
  }

  return ffmpeg;
}

async function ensureRnnoiseModel(instance: FFmpeg): Promise<void> {
  if (rnnoiseModelLoaded) {
    return;
  }

  await instance.writeFile(RNNOISE_MODEL_PATH, await fetchFile(rnnoiseModelUrl));
  rnnoiseModelLoaded = true;
}

async function execOrThrow(instance: FFmpeg, command: string[]): Promise<string> {
  const logStart = logs.length;
  const code = await instance.exec(command);
  const commandLog = logs.slice(logStart).join("\n");

  if (code !== 0) {
    throw createWorkerError(
      "ffmpeg_exec_failed",
      "Audio processing failed while FFmpeg was running.",
      commandLog
    );
  }

  return commandLog;
}

async function cleanupFiles(instance: FFmpeg, paths: string[]): Promise<void> {
  await Promise.all(
    paths.map(async (path) => {
      try {
        await instance.deleteFile(path);
      } catch {
        // MEMFS cleanup is best-effort after the export bytes are read.
      }
    })
  );
}

function stableInputName(name: string): string {
  const extension = name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? ".audio";
  return `input${extension.toLowerCase()}`;
}

function report(
  onProgress: (progress: ProcessingProgress) => void,
  stage: ProcessingProgress["stage"],
  ratio: number,
  message: string
): void {
  onProgress({ stage, ratio, message });
}

function createWorkerError(
  code: SerializedProcessingError["code"],
  message: string,
  detail?: string
): ProcessingWorkerError {
  return new ProcessingWorkerError({ code, message, detail });
}

function normalizeError(error: unknown): SerializedProcessingError {
  if (error instanceof ProcessingWorkerError) {
    return error.payload;
  }

  if (isSerializedError(error)) {
    return error;
  }

  return {
    code: "unknown",
    message: "Something went wrong while processing the audio.",
    detail: stringifyError(error)
  };
}

function isSerializedError(error: unknown): error is SerializedProcessingError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    typeof (error as SerializedProcessingError).message === "string"
  );
}

function stringifyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class ProcessingWorkerError extends Error {
  readonly code: SerializedProcessingError["code"];
  readonly detail?: string;
  readonly payload: SerializedProcessingError;

  constructor(payload: SerializedProcessingError) {
    super(payload.message);
    this.name = "ProcessingWorkerError";
    this.code = payload.code;
    this.detail = payload.detail;
    this.payload = payload;
  }
}

Comlink.expose(api);
