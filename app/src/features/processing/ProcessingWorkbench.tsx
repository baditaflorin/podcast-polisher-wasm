import {
  Activity,
  Download,
  FileAudio,
  Loader2,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Upload,
  Wand2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createDemoPodcastFile } from "../../lib/audio/demoAudio";
import { loadProcessingOptions, saveProcessingOptions } from "../../lib/audio/preferences";
import { createAudioProcessorClient } from "../../lib/audio/workerClient";
import type {
  ProcessingOptions,
  ProcessingProgress,
  ProcessingResult,
  SerializedProcessingError
} from "../../lib/audio/types";

type ProcessingState = "idle" | "running" | "done" | "error";

const targetOptions = [
  { label: "Podcast", value: -16 },
  { label: "Mono voice", value: -19 },
  { label: "Broadcast", value: -23 }
];

const presetOptions: Array<{ label: string; value: ProcessingOptions["preset"] }> = [
  { label: "Podcast", value: "podcast" },
  { label: "Voiceover", value: "voiceover" },
  { label: "Archive", value: "archive" }
];

export function ProcessingWorkbench() {
  const [file, setFile] = useState<File | undefined>();
  const [options, setOptions] = useState<ProcessingOptions>(() => loadProcessingOptions());
  const [progress, setProgress] = useState<ProcessingProgress | undefined>();
  const [state, setState] = useState<ProcessingState>("idle");
  const [result, setResult] = useState<ProcessingResult | undefined>();
  const [error, setError] = useState<SerializedProcessingError | undefined>();
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveProcessingOptions(options);
  }, [options]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const canProcess = Boolean(file) && state !== "running";
  const fileSize = useMemo(() => (file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "No file"), [file]);

  async function runProcessing() {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setState("running");
    setError(undefined);
    setResult(undefined);
    setProgress({ stage: "loading", ratio: 0.02, message: "Starting worker" });

    const client = createAudioProcessorClient();

    try {
      const output = await client.process(file, options, setProgress);
      setResult(output);
      setDownloadUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return URL.createObjectURL(new Blob([toArrayBuffer(output.bytes)], { type: output.mimeType }));
      });
      setState("done");
    } catch (caught) {
      setError(normalizeUiError(caught));
      setState("error");
    } finally {
      await client.dispose();
    }
  }

  function applyPreset(nextPreset: ProcessingOptions["preset"]) {
    setOptions((current) => {
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
    });
  }

  return (
    <section className="workbench" aria-label="Podcast processing workbench">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="drop-zone">
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (nextFile) {
                  setFile(nextFile);
                  setResult(undefined);
                  setDownloadUrl(undefined);
                  setError(undefined);
                  setState("idle");
                }
              }}
            />
            <button className="drop-button" type="button" onClick={() => inputRef.current?.click()}>
              <Upload aria-hidden="true" size={24} />
              <span>
                <strong>{file?.name ?? "Choose podcast audio"}</strong>
                <small>{fileSize}</small>
              </span>
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setFile(createDemoPodcastFile());
                setResult(undefined);
                setDownloadUrl(undefined);
                setError(undefined);
                setState("idle");
              }}
            >
              <Wand2 aria-hidden="true" size={18} />
              Demo audio
            </button>
          </div>

          <div className="waveform large" aria-hidden="true">
            {Array.from({ length: 72 }, (_, index) => (
              <span key={index} style={{ height: `${22 + ((index * 29 + (file?.size ?? 11)) % 76)}%` }} />
            ))}
          </div>

          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              disabled={!canProcess}
              onClick={() => void runProcessing()}
            >
              {state === "running" ? (
                <Loader2 className="animate-spin" aria-hidden="true" size={19} />
              ) : (
                <Play aria-hidden="true" size={19} />
              )}
              Process
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setOptions(loadProcessingOptions());
                setProgress(undefined);
                setError(undefined);
                setResult(undefined);
                setDownloadUrl(undefined);
                setState("idle");
              }}
            >
              <RotateCcw aria-hidden="true" size={18} />
              Reset
            </button>
            {downloadUrl && result ? (
              <a className="download-button" href={downloadUrl} download={result.fileName}>
                <Download aria-hidden="true" size={18} />
                Download {result.fileName}
              </a>
            ) : null}
          </div>

          <StatusPanel progress={progress} state={state} error={error} result={result} />
        </div>

        <form className="options-panel" aria-label="Processing options">
          <div className="panel-title">
            <SlidersHorizontal aria-hidden="true" size={18} />
            <h2>Pipeline</h2>
          </div>

          <SegmentedControl
            label="Preset"
            value={options.preset}
            options={presetOptions}
            onChange={(value) => applyPreset(value)}
          />

          <SegmentedControl
            label="Target loudness"
            value={options.targetLufs}
            options={targetOptions}
            onChange={(value) => setOptions((current) => ({ ...current, targetLufs: value }))}
          />

          <div className="field-grid">
            <label>
              <span>Noise</span>
              <select
                value={options.noiseReduction}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    noiseReduction: event.target.value as ProcessingOptions["noiseReduction"]
                  }))
                }
              >
                <option value="rnnoise">RNNoise</option>
                <option value="spectral">Spectral</option>
                <option value="off">Off</option>
              </select>
            </label>

            <label>
              <span>Export</span>
              <select
                value={options.format}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    format: event.target.value as ProcessingOptions["format"]
                  }))
                }
              >
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
              </select>
            </label>
          </div>

          <RangeField
            label="Denoise mix"
            value={options.denoiseMix}
            min={0}
            max={1}
            step={0.05}
            suffix=""
            onChange={(value) => setOptions((current) => ({ ...current, denoiseMix: value }))}
          />
          <RangeField
            label="High-pass"
            value={options.highpassHz}
            min={40}
            max={140}
            step={5}
            suffix="Hz"
            onChange={(value) => setOptions((current) => ({ ...current, highpassHz: value }))}
          />
          <RangeField
            label="Low-pass"
            value={options.lowpassHz}
            min={9000}
            max={20000}
            step={500}
            suffix="Hz"
            onChange={(value) => setOptions((current) => ({ ...current, lowpassHz: value }))}
          />
          <RangeField
            label="MP3 bitrate"
            value={options.mp3BitrateKbps}
            min={96}
            max={320}
            step={32}
            suffix="kbps"
            disabled={options.format !== "mp3"}
            onChange={(value) => setOptions((current) => ({ ...current, mp3BitrateKbps: value }))}
          />

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={options.removeSilence}
              onChange={(event) =>
                setOptions((current) => ({ ...current, removeSilence: event.target.checked }))
              }
            />
            <span>Trim leading silence</span>
          </label>
        </form>
      </div>
    </section>
  );
}

function StatusPanel({
  progress,
  state,
  error,
  result
}: {
  progress?: ProcessingProgress;
  state: ProcessingState;
  error?: SerializedProcessingError;
  result?: ProcessingResult;
}) {
  if (error) {
    return (
      <div className="status-panel error" role="alert">
        <strong>{error.message}</strong>
        {error.detail ? <small>{error.detail.slice(0, 320)}</small> : null}
      </div>
    );
  }

  if (result) {
    return (
      <div className="status-panel success">
        <div className="flex items-center gap-2">
          <Activity aria-hidden="true" size={18} />
          <strong>Export ready</strong>
        </div>
        <dl>
          <div>
            <dt>Input loudness</dt>
            <dd>{formatOptionalNumber(result.summary.measuredInputLufs, " LUFS")}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{(result.summary.outputBytes / 1024 / 1024).toFixed(2)} MB</dd>
          </div>
          <div>
            <dt>Denoise</dt>
            <dd>{result.summary.usedRnnoise ? "RNNoise" : "Spectral/off"}</dd>
          </div>
        </dl>
        <details>
          <summary>FFmpeg command</summary>
          <code>{result.command.join(" ")}</code>
        </details>
      </div>
    );
  }

  return (
    <div className="status-panel">
      <div className="flex items-center gap-2">
        <FileAudio aria-hidden="true" size={18} />
        <strong>{progress?.message ?? "Ready for local processing"}</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${Math.round((progress?.ratio ?? 0) * 100)}%` }} />
      </div>
      <small>{state === "running" ? progress?.stage : "No upload. No account. Static page."}</small>
    </div>
  );
}

function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  disabled,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-field">
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function normalizeUiError(error: unknown): SerializedProcessingError {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    "code" in error &&
    typeof (error as SerializedProcessingError).message === "string"
  ) {
    return error as SerializedProcessingError;
  }

  return {
    code: "unknown",
    message: "The browser could not finish this export.",
    detail: error instanceof Error ? error.message : String(error)
  };
}

function formatOptionalNumber(value: number | undefined, suffix: string): string {
  return typeof value === "number" ? `${value.toFixed(1)}${suffix}` : "Measured";
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
