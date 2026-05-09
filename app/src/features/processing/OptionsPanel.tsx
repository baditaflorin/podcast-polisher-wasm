import { SlidersHorizontal } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ProcessingOptions } from "../../lib/audio/types";
import { RangeField, SegmentedControl } from "./ProcessingControls";

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

export function OptionsPanel({
  onPresetChange,
  options,
  setOptions
}: {
  onPresetChange: (preset: ProcessingOptions["preset"]) => void;
  options: ProcessingOptions;
  setOptions: Dispatch<SetStateAction<ProcessingOptions>>;
}) {
  return (
    <form className="options-panel" aria-label="Processing options">
      <div className="panel-title">
        <SlidersHorizontal aria-hidden="true" size={18} />
        <h2>Pipeline</h2>
      </div>

      <SegmentedControl
        label="Preset"
        value={options.preset}
        options={presetOptions}
        onChange={onPresetChange}
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
          onChange={(event) => setOptions((current) => ({ ...current, removeSilence: event.target.checked }))}
        />
        <span>Trim leading silence</span>
      </label>
    </form>
  );
}
