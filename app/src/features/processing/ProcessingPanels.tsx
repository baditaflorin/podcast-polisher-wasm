import { Activity, AlertTriangle, CheckCircle2, FileAudio, Info, Loader2 } from "lucide-react";
import { issueCodes, type AudioPreflight } from "../../lib/audio/preflight";
import type { ProcessingProgress, ProcessingResult, SerializedProcessingError } from "../../lib/audio/types";
import type { ActivityEntry, ProcessingState } from "./processingTypes";

export function PreflightPanel({ preflight, state }: { preflight?: AudioPreflight; state: ProcessingState }) {
  if (state === "analyzing") {
    return (
      <div className="preflight-panel">
        <Loader2 className="animate-spin" aria-hidden="true" size={18} />
        <strong>Inspecting recording</strong>
      </div>
    );
  }

  if (!preflight) {
    return null;
  }

  const statusIcon = preflight.canProcess ? (
    <CheckCircle2 aria-hidden="true" size={18} />
  ) : (
    <AlertTriangle aria-hidden="true" size={18} />
  );
  const issueList = preflight.fatalIssues.length ? preflight.fatalIssues : preflight.warnings;

  return (
    <div className={preflight.canProcess ? "preflight-panel" : "preflight-panel blocked"}>
      <div className="flex items-center gap-2">
        {statusIcon}
        <strong>
          First guess: {preflight.recommendation.preset} ({preflight.confidenceLabel} confidence)
        </strong>
      </div>
      <dl>
        <div>
          <dt>Shape</dt>
          <dd>{preflight.sourceShape}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>
            {preflight.facts.container}/{preflight.facts.codec}
          </dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{formatDuration(preflight.facts.durationSeconds)}</dd>
        </div>
        <div>
          <dt>Source ID</dt>
          <dd>{preflight.facts.sourceId}</dd>
        </div>
      </dl>
      {issueList.length ? (
        <ul className="issue-list">
          {issueList.map((issue) => (
            <li key={issue.code}>
              <strong>{issue.what}</strong>
              <span>{issue.nowWhat}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <details>
        <summary>Why this guess?</summary>
        <ul className="reason-list">
          {preflight.explanations.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function StatusPanel({
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
        <strong>{error.what ?? error.message}</strong>
        <small>{error.why ?? error.detail ?? error.message}</small>
        {error.nowWhat ? <small>{error.nowWhat}</small> : null}
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
        <strong>{progress?.message ?? statusMessage(state)}</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${Math.round((progress?.ratio ?? 0) * 100)}%` }} />
      </div>
      <small>{state === "running" ? progress?.stage : "No upload. No account. Static page."}</small>
    </div>
  );
}

export function DebugPanel({
  activity,
  preflight,
  progress,
  state
}: {
  activity: ActivityEntry[];
  preflight?: AudioPreflight;
  progress?: ProcessingProgress;
  state: ProcessingState;
}) {
  return (
    <div className="debug-panel">
      <div className="flex items-center gap-2">
        <Info aria-hidden="true" size={18} />
        <strong>Debug</strong>
      </div>
      <pre>
        {JSON.stringify(
          { activity, issueCodes: preflight ? issueCodes(preflight.issues) : [], preflight, progress, state },
          null,
          2
        )}
      </pre>
    </div>
  );
}

function statusMessage(state: ProcessingState): string {
  if (state === "blocked") {
    return "Choose another recording";
  }
  if (state === "cancelled") {
    return "Processing cancelled";
  }
  if (state === "ready") {
    return "Ready to process";
  }
  return "Ready for local processing";
}

function formatDuration(value: number | undefined): string {
  if (value === undefined) {
    return "Unknown";
  }
  const totalSeconds = Math.round(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatOptionalNumber(value: number | undefined, suffix: string): string {
  return typeof value === "number" ? `${value.toFixed(1)}${suffix}` : "Measured";
}
