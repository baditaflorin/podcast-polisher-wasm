import type { SerializedProcessingError } from "../../lib/audio/types";

export function normalizeUiError(error: unknown): SerializedProcessingError {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    "code" in error &&
    typeof (error as SerializedProcessingError).message === "string"
  ) {
    return enrichError(error as SerializedProcessingError);
  }

  return enrichError({
    code: "unknown",
    message: "The browser could not finish this export.",
    detail: error instanceof Error ? error.message : String(error)
  });
}

function enrichError(error: SerializedProcessingError): SerializedProcessingError {
  if (error.code === "ffmpeg_load_failed") {
    return {
      ...error,
      what: "The audio engine could not start.",
      why: "The browser failed to load FFmpeg WebAssembly.",
      nowWhat: "Reload the page or try a current Chromium, Firefox, or Safari release.",
      recoverable: true
    };
  }
  if (error.code === "ffmpeg_exec_failed") {
    return {
      ...error,
      what: "FFmpeg could not finish this recording.",
      why: "The decoder or filter chain rejected the source during processing.",
      nowWhat: "Try Archive preset, export WAV, or convert the original to WAV before retrying.",
      recoverable: true
    };
  }
  if (error.code === "unsupported_file") {
    return {
      ...error,
      what: "This recording cannot be processed as-is.",
      why: error.detail ?? error.message,
      nowWhat: "Choose the original recording or convert it to MP3/WAV first.",
      recoverable: true
    };
  }

  return {
    ...error,
    what: "The browser could not finish this export.",
    why: error.detail ?? error.message,
    nowWhat: "Retry once, then convert the source to WAV if the same issue repeats.",
    recoverable: true
  };
}
