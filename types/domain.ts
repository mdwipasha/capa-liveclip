export type ExportQuality = "480p" | "720p" | "1080p" | "2k" | "4k" | "original";

export type LiveStatus = "live" | "upcoming" | "ended" | "unknown";

export type ApiErrorCode =
  | "INVALID_URL"
  | "NOT_LIVESTREAM"
  | "STREAM_UNAVAILABLE"
  | "EXPORT_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorPayload };

export interface StreamFormat {
  quality: ExportQuality;
  label: string;
  width?: number;
  height?: number;
  available: boolean;
}

export interface StreamMetadata {
  id: string;
  url: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  liveStatus: LiveStatus;
  durationSeconds: number;
  resolution: string;
  videoCodec: string;
  audioCodec: string;
  formats: StreamFormat[];
  previewImageUrl: string;
}

export interface ClipHistoryItem {
  id: string;
  streamId: string;
  sourceUrl: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  resolution: string;
  quality: ExportQuality;
  outputFilename: string;
  downloadUrl: string;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  defaultQuality: ExportQuality;
  filenameTemplate: string;
  theme: "dark";
  appVersion: string;
  updatedAt: string;
}

export interface ExportResult {
  clip: ClipHistoryItem;
}
