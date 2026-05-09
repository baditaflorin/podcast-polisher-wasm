export type AudioContainer = "empty" | "flac" | "mp3" | "mp4" | "ogg" | "unknown" | "wav";
export type AudioCodec = "aac" | "flac" | "mp3" | "none" | "opus" | "speex" | "unknown" | "vorbis" | "wav";

export type AudioSignature = {
  container: AudioContainer;
  codec: AudioCodec;
  channels?: number;
  sampleRateHz?: number;
  bitrateKbps?: number;
};

const textDecoder = new TextDecoder("latin1");

export function detectAudioSignature(
  bytes: Uint8Array,
  extension: string,
  sizeBytes: number
): AudioSignature {
  if (sizeBytes === 0) {
    return { container: "empty", codec: "none" };
  }

  if (hasAscii(bytes, 0, "fLaC")) {
    return { container: "flac", codec: "flac" };
  }

  if (hasAscii(bytes, 0, "RIFF") && hasAscii(bytes, 8, "WAVE")) {
    return parseWav(bytes);
  }

  if (hasAscii(bytes, 0, "OggS")) {
    return parseOgg(bytes);
  }

  if (hasAscii(bytes, 4, "ftyp")) {
    return { container: "mp4", codec: "aac" };
  }

  const mp3 = parseMp3(bytes);
  if (mp3) {
    return mp3;
  }

  return fallbackByExtension(extension);
}

export function estimateDurationSeconds(signature: AudioSignature, sizeBytes: number): number | undefined {
  if (signature.codec === "mp3" && signature.bitrateKbps && signature.bitrateKbps > 0) {
    return (sizeBytes * 8) / (signature.bitrateKbps * 1000);
  }

  return undefined;
}

function parseWav(bytes: Uint8Array): AudioSignature {
  return {
    container: "wav",
    codec: "wav",
    channels: readUint16Le(bytes, 22),
    sampleRateHz: readUint32Le(bytes, 24)
  };
}

function parseOgg(bytes: Uint8Array): AudioSignature {
  const text = textDecoder.decode(bytes);

  const opusIndex = text.indexOf("OpusHead");
  if (opusIndex >= 0) {
    return {
      container: "ogg",
      codec: "opus",
      channels: bytes[opusIndex + 9],
      sampleRateHz: readUint32Le(bytes, opusIndex + 12)
    };
  }

  const vorbisIndex = text.indexOf("vorbis");
  if (vorbisIndex >= 0) {
    return {
      container: "ogg",
      codec: "vorbis",
      channels: bytes[vorbisIndex + 10],
      sampleRateHz: readUint32Le(bytes, vorbisIndex + 11)
    };
  }

  const speexIndex = text.indexOf("Speex   ");
  if (speexIndex >= 0) {
    return {
      container: "ogg",
      codec: "speex",
      channels: readUint32Le(bytes, speexIndex + 48),
      sampleRateHz: readUint32Le(bytes, speexIndex + 36)
    };
  }

  return { container: "ogg", codec: "unknown" };
}

function parseMp3(bytes: Uint8Array): AudioSignature | undefined {
  let offset = 0;
  if (hasAscii(bytes, 0, "ID3") && bytes.length >= 10) {
    offset = 10 + synchsafeInt(bytes.subarray(6, 10));
  }

  for (let index = offset; index < Math.min(bytes.length - 4, offset + 8192); index += 1) {
    const first = bytes[index];
    const second = bytes[index + 1];
    if (first !== 0xff || second === undefined || (second & 0xe0) !== 0xe0) {
      continue;
    }

    const third = bytes[index + 2] ?? 0;
    const fourth = bytes[index + 3] ?? 0;
    const versionBits = (second >> 3) & 0x03;
    const layerBits = (second >> 1) & 0x03;
    const bitrateIndex = (third >> 4) & 0x0f;
    const sampleRateIndex = (third >> 2) & 0x03;
    const channelMode = (fourth >> 6) & 0x03;
    const sampleRateHz = mp3SampleRate(versionBits, sampleRateIndex);
    const bitrateKbps = mp3Bitrate(versionBits, layerBits, bitrateIndex);

    if (sampleRateHz && bitrateKbps) {
      return {
        container: "mp3",
        codec: "mp3",
        channels: channelMode === 3 ? 1 : 2,
        sampleRateHz,
        bitrateKbps
      };
    }
  }

  return undefined;
}

function fallbackByExtension(extension: string): AudioSignature {
  if (extension === "mp3") {
    return { container: "mp3", codec: "mp3" };
  }
  if (extension === "ogg") {
    return { container: "ogg", codec: "unknown" };
  }
  if (extension === "opus") {
    return { container: "ogg", codec: "opus" };
  }
  if (extension === "spx") {
    return { container: "ogg", codec: "speex" };
  }
  if (extension === "mp4" || extension === "m4a") {
    return { container: "mp4", codec: "aac" };
  }
  if (extension === "wav") {
    return { container: "wav", codec: "wav" };
  }
  if (extension === "flac") {
    return { container: "flac", codec: "flac" };
  }

  return { container: "unknown", codec: "unknown" };
}

function mp3SampleRate(versionBits: number, sampleRateIndex: number): number | undefined {
  if (sampleRateIndex === 3) {
    return undefined;
  }

  const base = [44100, 48000, 32000][sampleRateIndex];
  if (!base) {
    return undefined;
  }

  if (versionBits === 3) {
    return base;
  }
  if (versionBits === 2) {
    return base / 2;
  }
  if (versionBits === 0) {
    return base / 4;
  }

  return undefined;
}

function mp3Bitrate(versionBits: number, layerBits: number, bitrateIndex: number): number | undefined {
  if (bitrateIndex === 0 || bitrateIndex === 15 || layerBits !== 1) {
    return undefined;
  }

  const mpeg1Layer3 = [undefined, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const mpeg2Layer3 = [undefined, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

  return (versionBits === 3 ? mpeg1Layer3 : mpeg2Layer3)[bitrateIndex];
}

function synchsafeInt(bytes: Uint8Array): number {
  return ((bytes[0] ?? 0) << 21) | ((bytes[1] ?? 0) << 14) | ((bytes[2] ?? 0) << 7) | (bytes[3] ?? 0);
}

function hasAscii(bytes: Uint8Array, offset: number, value: string): boolean {
  if (offset + value.length > bytes.length) {
    return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    if (bytes[offset + index] !== value.charCodeAt(index)) {
      return false;
    }
  }

  return true;
}

function readUint16Le(bytes: Uint8Array, offset: number): number | undefined {
  if (offset + 2 > bytes.length) {
    return undefined;
  }

  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readUint32Le(bytes: Uint8Array, offset: number): number | undefined {
  if (offset + 4 > bytes.length) {
    return undefined;
  }

  return (
    ((bytes[offset] ?? 0) |
      ((bytes[offset + 1] ?? 0) << 8) |
      ((bytes[offset + 2] ?? 0) << 16) |
      ((bytes[offset + 3] ?? 0) << 24)) >>>
    0
  );
}
