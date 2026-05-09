import { Clipboard, Download, FileDown, Loader2, Play, RotateCcw, Square, Upload, Wand2 } from "lucide-react";
import type { ClipboardEvent, DragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createDemoPodcastFile } from "../../lib/audio/demoAudio";
import { createExportMetadata, metadataFileName, stableJson } from "../../lib/audio/exportMetadata";
import { analyzeAudioFile, type AudioPreflight } from "../../lib/audio/preflight";
import { loadProcessingOptions, saveProcessingOptions } from "../../lib/audio/preferences";
import { createProjectState, parseProjectState, projectStateFileName } from "../../lib/audio/projectState";
import { clearSessionState, loadSessionState, saveSessionState } from "../../lib/audio/sessionState";
import { createAudioProcessorClient, type AudioProcessorClient } from "../../lib/audio/workerClient";
import { buildInfo } from "../../lib/metadata/static";
import type {
  ProcessingOptions,
  ProcessingProgress,
  ProcessingResult,
  SerializedProcessingError
} from "../../lib/audio/types";
import { probeBrowserMedia } from "./mediaProbe";
import { OptionsPanel } from "./OptionsPanel";
import { DebugPanel, PreflightPanel, StatusPanel } from "./ProcessingPanels";
import { normalizeUiError } from "./processingErrors";
import { optionsForPreset } from "./processingOptions";
import type { ActivityEntry, ProcessingState, Sidecar } from "./processingTypes";

export function ProcessingWorkbench() {
  const [initialSession] = useState(() => loadSessionState());
  const [file, setFile] = useState<File | undefined>();
  const [preflight, setPreflight] = useState<AudioPreflight | undefined>();
  const [options, setOptions] = useState<ProcessingOptions>(
    () => initialSession?.options ?? loadProcessingOptions()
  );
  const [progress, setProgress] = useState<ProcessingProgress | undefined>();
  const [state, setState] = useState<ProcessingState>("idle");
  const [result, setResult] = useState<ProcessingResult | undefined>();
  const [error, setError] = useState<SerializedProcessingError | undefined>();
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [metadataSidecar, setMetadataSidecar] = useState<Sidecar>();
  const [stateSidecar, setStateSidecar] = useState<Sidecar>();
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [activity, setActivity] = useState<ActivityEntry[]>(() =>
    initialSession?.selectedFileName
      ? [
          {
            id: 0,
            label: "Session restored",
            detail: `${initialSession.selectedFileName} was active last time. Choose it again to process private audio bytes.`
          }
        ]
      : []
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const stateInputRef = useRef<HTMLInputElement>(null);
  const analysisIdRef = useRef(0);
  const processingIdRef = useRef(0);
  const cancelledProcessingIdRef = useRef<number | undefined>(undefined);
  const activeClientRef = useRef<AudioProcessorClient | undefined>(undefined);
  const activityIdRef = useRef(0);
  const debugEnabled = useMemo(() => new URLSearchParams(window.location.search).get("debug") === "1", []);

  useEffect(() => {
    saveProcessingOptions(options);
  }, [options]);

  useEffect(() => {
    return () => {
      revokeUrl(downloadUrl);
      revokeUrl(metadataSidecar?.url);
      revokeUrl(stateSidecar?.url);
      activeClientRef.current?.cancel();
    };
  }, [downloadUrl, metadataSidecar?.url, stateSidecar?.url]);

  useEffect(() => {
    saveSessionState({
      options,
      selectedFileName: file?.name,
      selectedFileSize: file?.size,
      lastState: state
    });
  }, [file?.name, file?.size, options, state]);

  const canProcess = Boolean(file && preflight?.canProcess && state !== "analyzing" && state !== "running");
  const fileSize = useMemo(() => (file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "No file"), [file]);

  async function selectFiles(nextFiles: File[], label = "Files selected") {
    const mediaFiles = nextFiles.filter(isSupportedMediaFile);
    if (!mediaFiles.length) {
      setNotice("No supported audio or video file was found in that input.");
      addActivity("Input ignored", "The app accepts audio files and common video files with audio tracks.");
      return;
    }

    const firstFile = mediaFiles[0];
    if (!firstFile) {
      return;
    }

    setQueuedFiles(mediaFiles);
    setNotice(
      mediaFiles.length > 1
        ? `${mediaFiles.length} files ready. Processing uses the selected file.`
        : undefined
    );
    addActivity(label, `${mediaFiles.length} usable file${mediaFiles.length === 1 ? "" : "s"}`);
    await selectFile(firstFile);
  }

  async function selectFile(nextFile: File) {
    const analysisId = analysisIdRef.current + 1;
    analysisIdRef.current = analysisId;
    activeClientRef.current?.cancel();
    revokeUrl(downloadUrl);
    revokeUrl(metadataSidecar?.url);
    revokeUrl(stateSidecar?.url);
    setFile(nextFile);
    setPreflight(undefined);
    setResult(undefined);
    setDownloadUrl(undefined);
    setMetadataSidecar(undefined);
    setStateSidecar(undefined);
    setError(undefined);
    setState("analyzing");
    setProgress({ stage: "preparing", ratio: 0.08, message: "Checking recording before processing" });
    addActivity("File selected", `${nextFile.name} (${(nextFile.size / 1024 / 1024).toFixed(2)} MB)`);

    try {
      const nextPreflight = await analyzeAudioFile(nextFile, { mediaProbe: probeBrowserMedia });
      if (analysisId !== analysisIdRef.current) {
        return;
      }

      setPreflight(nextPreflight);
      setState(nextPreflight.canProcess ? "ready" : "blocked");
      setProgress(undefined);
      if (nextPreflight.canProcess) {
        setOptions((current) => optionsForPreset(current, nextPreflight.recommendation.preset));
      }
      addActivity(
        nextPreflight.canProcess ? "First guess ready" : "File blocked",
        `${nextPreflight.sourceShape}, ${nextPreflight.confidenceLabel} confidence`
      );
    } catch (caught) {
      if (analysisId !== analysisIdRef.current) {
        return;
      }
      setState("error");
      setError({
        code: "unknown",
        message: "The recording could not be inspected.",
        what: "Preflight could not read the file.",
        why: caught instanceof Error ? caught.message : "The browser did not return usable media metadata.",
        nowWhat: "Choose the original recording again or convert it to MP3/WAV first.",
        recoverable: true
      });
    }
  }

  async function runProcessing() {
    if (!file) {
      inputRef.current?.click();
      return;
    }
    if (!preflight?.canProcess) {
      setState("blocked");
      return;
    }

    const processingId = processingIdRef.current + 1;
    processingIdRef.current = processingId;
    cancelledProcessingIdRef.current = undefined;
    setState("running");
    setError(undefined);
    setResult(undefined);
    revokeUrl(downloadUrl);
    revokeUrl(metadataSidecar?.url);
    revokeUrl(stateSidecar?.url);
    setDownloadUrl(undefined);
    setMetadataSidecar(undefined);
    setStateSidecar(undefined);
    setProgress({ stage: "loading", ratio: 0.02, message: "Starting worker" });
    addActivity("Processing started", `${preflight.facts.sourceId} with ${options.preset} preset`);

    const client = createAudioProcessorClient();
    activeClientRef.current = client;

    try {
      const output = await client.process(file, options, setProgress);
      if (processingId !== processingIdRef.current || cancelledProcessingIdRef.current === processingId) {
        return;
      }

      const metadata = createExportMetadata({ app: buildInfo, options, preflight, result: output });
      setResult(output);
      setDownloadUrl(URL.createObjectURL(new Blob([toArrayBuffer(output.bytes)], { type: output.mimeType })));
      setMetadataSidecar({
        fileName: metadataFileName(output.fileName),
        url: URL.createObjectURL(new Blob([stableJson(metadata)], { type: "application/json" }))
      });
      const projectState = createProjectState({ app: buildInfo, options, preflight, result: output });
      setStateSidecar({
        fileName: projectStateFileName(preflight),
        url: URL.createObjectURL(new Blob([stableJson(projectState)], { type: "application/json" }))
      });
      setState("done");
      addActivity("Export ready", `${output.fileName}, ${preflight.confidenceLabel} inference confidence`);
    } catch (caught) {
      if (cancelledProcessingIdRef.current === processingId) {
        return;
      }
      setError(normalizeUiError(caught));
      setState("error");
      addActivity("Processing failed", normalizeUiError(caught).message);
    } finally {
      if (activeClientRef.current === client) {
        activeClientRef.current = undefined;
      }
      await client.dispose();
    }
  }

  function cancelProcessing() {
    cancelledProcessingIdRef.current = processingIdRef.current;
    activeClientRef.current?.cancel();
    activeClientRef.current = undefined;
    setState("cancelled");
    setProgress({ stage: "cancelled", ratio: 0, message: "Processing cancelled" });
    addActivity("Processing cancelled", "The active worker was terminated.");
  }

  function resetWorkbench() {
    analysisIdRef.current += 1;
    processingIdRef.current += 1;
    activeClientRef.current?.cancel();
    revokeUrl(downloadUrl);
    revokeUrl(metadataSidecar?.url);
    revokeUrl(stateSidecar?.url);
    setFile(undefined);
    setPreflight(undefined);
    setProgress(undefined);
    setError(undefined);
    setResult(undefined);
    setDownloadUrl(undefined);
    setMetadataSidecar(undefined);
    setStateSidecar(undefined);
    setQueuedFiles([]);
    setNotice(undefined);
    setState("idle");
    setOptions(clearSessionState());
    addActivity("Reset", "Workbench returned to idle.");
  }

  function applyPreset(nextPreset: ProcessingOptions["preset"]) {
    setOptions((current) => optionsForPreset(current, nextPreset));
    addActivity("Preset changed", nextPreset);
  }

  function addActivity(label: string, detail: string) {
    activityIdRef.current += 1;
    const entry = { id: activityIdRef.current, label, detail };
    setActivity((current) => [entry, ...current].slice(0, 8));
  }

  async function copyMetadata() {
    if (!preflight) {
      return;
    }
    const projectState = createProjectState({ app: buildInfo, options, preflight, result });
    await navigator.clipboard.writeText(stableJson(projectState));
    setNotice("State copied to clipboard.");
    addActivity("Copied state", projectState.schemaVersion);
  }

  async function importProjectState(file: File) {
    try {
      const projectState = parseProjectState(await file.text());
      setOptions(projectState.options);
      setNotice(
        projectState.source
          ? `State restored for ${projectState.source.fileName}. Choose that recording again to process.`
          : "State restored. Choose a recording to process."
      );
      addActivity("State imported", projectState.schemaVersion);
    } catch (caught) {
      setError({
        code: "unsupported_file",
        message: "The state file could not be imported.",
        what: "State import failed.",
        why:
          caught instanceof Error
            ? caught.message
            : "The selected file was not a Podcast Polisher state file.",
        nowWhat: "Choose a .state.json file exported by this app.",
        recoverable: true
      });
      setState("error");
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    void selectFiles(Array.from(event.dataTransfer.files), "Files dropped");
  }

  function handlePaste(event: ClipboardEvent<HTMLElement>) {
    const pastedFile = Array.from(event.clipboardData.files).find(isSupportedMediaFile);
    if (!pastedFile) {
      return;
    }
    event.preventDefault();
    void selectFiles([pastedFile], "Clipboard file pasted");
  }

  return (
    <section className="workbench" aria-label="Podcast processing workbench" onPaste={handlePaste}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <div
            className={isDragging ? "drop-zone dragging" : "drop-zone"}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              multiple
              accept="audio/*,video/mp4,video/webm,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus,.spx,.mp4,.m4v,.mov,.webm"
              onChange={(event) => {
                const nextFiles = Array.from(event.target.files ?? []);
                if (nextFiles.length) {
                  void selectFiles(nextFiles, "Files chosen");
                }
              }}
            />
            <input
              ref={stateInputRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (nextFile) {
                  void importProjectState(nextFile);
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
              onClick={() => void selectFile(createDemoPodcastFile())}
            >
              <Wand2 aria-hidden="true" size={18} />
              Demo audio
            </button>
          </div>
          {notice ? <p className="notice">{notice}</p> : null}
          {queuedFiles.length > 1 ? (
            <div className="queue-panel" aria-label="Selected files">
              {queuedFiles.map((queuedFile) => (
                <button
                  key={`${queuedFile.name}-${queuedFile.size}-${queuedFile.lastModified}`}
                  type="button"
                  aria-pressed={queuedFile === file}
                  onClick={() => void selectFile(queuedFile)}
                >
                  <span>{queuedFile.name}</span>
                  <small>{(queuedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </button>
              ))}
            </div>
          ) : null}

          <div className="waveform large" aria-hidden="true">
            {Array.from({ length: 72 }, (_, index) => (
              <span key={index} style={{ height: `${22 + ((index * 29 + (file?.size ?? 11)) % 76)}%` }} />
            ))}
          </div>

          <PreflightPanel preflight={preflight} state={state} />

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
            {state === "running" ? (
              <button className="secondary-button" type="button" onClick={cancelProcessing}>
                <Square aria-hidden="true" size={17} />
                Cancel
              </button>
            ) : null}
            <button className="secondary-button" type="button" onClick={resetWorkbench}>
              <RotateCcw aria-hidden="true" size={18} />
              Reset
            </button>
            <button className="secondary-button" type="button" onClick={() => stateInputRef.current?.click()}>
              <Upload aria-hidden="true" size={18} />
              Import state
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={!preflight}
              onClick={() => void copyMetadata()}
            >
              <Clipboard aria-hidden="true" size={18} />
              Copy state
            </button>
            {downloadUrl && result ? (
              <a className="download-button" href={downloadUrl} download={result.fileName}>
                <Download aria-hidden="true" size={18} />
                Download {result.fileName}
              </a>
            ) : null}
            {metadataSidecar ? (
              <a className="secondary-button" href={metadataSidecar.url} download={metadataSidecar.fileName}>
                <Download aria-hidden="true" size={18} />
                Metadata
              </a>
            ) : null}
            {stateSidecar ? (
              <a className="secondary-button" href={stateSidecar.url} download={stateSidecar.fileName}>
                <FileDown aria-hidden="true" size={18} />
                State
              </a>
            ) : null}
          </div>

          <StatusPanel progress={progress} state={state} error={error} result={result} />
          {debugEnabled ? (
            <DebugPanel activity={activity} preflight={preflight} state={state} progress={progress} />
          ) : null}
        </div>

        <OptionsPanel options={options} setOptions={setOptions} onPresetChange={applyPreset} />
      </div>
    </section>
  );
}

function revokeUrl(url: string | undefined): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function isSupportedMediaFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("audio/") ||
    file.type.startsWith("video/") ||
    /\.(aac|flac|m4a|m4v|mov|mp3|mp4|ogg|opus|spx|wav|webm)$/.test(name)
  );
}
