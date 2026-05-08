export function createDemoPodcastFile(): File {
  const sampleRate = 48_000;
  const durationSeconds = 3;
  const sampleCount = sampleRate * durationSeconds;
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const voiceLike = Math.sin(2 * Math.PI * 180 * time) * 0.22 + Math.sin(2 * Math.PI * 720 * time) * 0.08;
    const roomTone = (Math.random() * 2 - 1) * 0.018;
    const envelope =
      time < 0.2 ? time / 0.2 : time > durationSeconds - 0.25 ? (durationSeconds - time) / 0.25 : 1;
    samples[index] = (voiceLike + roomTone) * Math.max(0, Math.min(1, envelope));
  }

  const wav = encodeMonoWav(samples, sampleRate);
  return new File([wav], "demo-podcast.wav", { type: "audio/wav" });
}

function encodeMonoWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(44 + index * bytesPerSample, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}
