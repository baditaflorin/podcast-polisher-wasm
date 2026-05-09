export type ProcessingState =
  | "analyzing"
  | "blocked"
  | "cancelled"
  | "done"
  | "error"
  | "idle"
  | "ready"
  | "running";

export type ActivityEntry = { id: number; label: string; detail: string };

export type Sidecar = { fileName: string; url: string };
