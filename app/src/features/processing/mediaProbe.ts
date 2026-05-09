import type { AudioPreflight } from "../../lib/audio/preflight";

export async function probeBrowserMedia(
  file: File
): Promise<Partial<Pick<AudioPreflight["facts"], "durationSeconds">>> {
  if (!file.size) {
    return {};
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media: HTMLMediaElement = document.createElement(file.type.startsWith("video") ? "video" : "audio");
    let settled = false;

    const finish = (facts: Partial<Pick<AudioPreflight["facts"], "durationSeconds">>) => {
      if (settled) {
        return;
      }
      settled = true;
      URL.revokeObjectURL(url);
      resolve(facts);
    };

    media.preload = "metadata";
    media.onloadedmetadata = () => {
      finish({ durationSeconds: Number.isFinite(media.duration) ? media.duration : undefined });
    };
    media.onerror = () => finish({});
    media.src = url;
    window.setTimeout(() => finish({}), 1400);
  });
}
