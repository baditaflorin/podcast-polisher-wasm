import { describe, expect, it } from "vitest";
import {
  buildFinalFilter,
  buildMeasurementArgs,
  buildMeasurementFilter,
  buildProcessingArgs,
  parseLoudnormMeasurement
} from "./pipeline";
import { defaultProcessingOptions } from "./types";

describe("audio pipeline", () => {
  it("builds an RNNoise and loudnorm measurement filter", () => {
    const filter = buildMeasurementFilter(defaultProcessingOptions, {
      rnnoiseAvailable: true,
      rnnoiseModelPath: "std.rnnn"
    });

    expect(filter).toContain("arnndn=m=std.rnnn");
    expect(filter).toContain("loudnorm=I=-16");
  });

  it("builds two-pass processing args for MP3 export", () => {
    const filter = buildFinalFilter(
      defaultProcessingOptions,
      {
        rnnoiseAvailable: true,
        rnnoiseModelPath: "std.rnnn"
      },
      {
        inputI: -24.1,
        inputTp: -3.2,
        inputLra: 7.5,
        inputThresh: -34.9,
        targetOffset: -0.2
      }
    );
    const args = buildProcessingArgs("input.wav", "output.mp3", filter, "mp3", 192);

    expect(args).toContain("libmp3lame");
    expect(args.join(" ")).toContain("measured_I=-24.1");
    expect(args.at(-1)).toBe("output.mp3");
  });

  it("parses loudnorm JSON from FFmpeg logs", () => {
    const measurement = parseLoudnormMeasurement(`
      [Parsed_loudnorm_0 @ 0x123] 
      {
        "input_i" : "-20.47",
        "input_tp" : "-2.11",
        "input_lra" : "6.80",
        "input_thresh" : "-31.25",
        "output_i" : "-16.03",
        "target_offset" : "0.03"
      }
    `);

    expect(measurement?.inputI).toBeCloseTo(-20.47);
    expect(measurement?.targetOffset).toBeCloseTo(0.03);
  });

  it("keeps measurement commands shell-free and parseable", () => {
    expect(buildMeasurementArgs("voice.wav", "highpass=f=80")).toEqual([
      "-hide_banner",
      "-nostats",
      "-i",
      "voice.wav",
      "-vn",
      "-af",
      "highpass=f=80",
      "-f",
      "null",
      "-"
    ]);
  });
});
