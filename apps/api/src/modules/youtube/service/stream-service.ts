import type { ExportQuality, LiveStatus, StreamFormat, StreamMetadata } from "@shared/domain";
import { extractYouTubeId } from "@shared/youtube";
import { describeYtDlpError, runYtDlpJson } from "@youtube/ytdlp";

interface YtDlpFormat {
  height?: number;
  width?: number;
  vcodec?: string;
  acodec?: string;
  resolution?: string;
}

interface YtDlpInfo {
  id: string;
  webpage_url?: string;
  title?: string;
  channel?: string;
  uploader?: string;
  thumbnail?: string;
  is_live?: boolean;
  was_live?: boolean;
  live_status?: LiveStatus | "was_live" | "post_live" | "is_upcoming" | "not_live";
  duration?: number;
  width?: number;
  height?: number;
  vcodec?: string;
  acodec?: string;
  formats?: YtDlpFormat[];
}

function normalizeLiveStatus(info: YtDlpInfo): LiveStatus {
  if (info.is_live || info.live_status === "live") return "live";
  if (info.was_live || info.live_status === "was_live" || info.live_status === "post_live") {
    return "ended";
  }
  if (info.live_status === "is_upcoming") return "upcoming";
  if (info.live_status === "not_live") {
    throw new Error("This YouTube URL is not a livestream or livestream archive.");
  }
  return "unknown";
}

function qualityAvailable(formats: YtDlpFormat[], quality: ExportQuality) {
  if (quality === "original") return true;
  const videoFormats = formats.filter((format) => format.vcodec !== "none" && (format.height ?? 0) > 0);
  if (videoFormats.length === 0) return true;

  const heightMap: Record<Exclude<ExportQuality, "original">, number> = {
    "480p": 480,
    "720p": 720,
    "1080p": 1080,
    "2k": 1440,
    "4k": 2160
  };
  const height = heightMap[quality as Exclude<ExportQuality, "original">];
  return videoFormats.some((format) => (format.height ?? 0) >= height);
}

function buildFormats(formats: YtDlpFormat[]): StreamFormat[] {
  return [
    { quality: "original", label: "Original", available: true },
    { quality: "4k", label: "4K", height: 2160, available: qualityAvailable(formats, "4k") },
    { quality: "2k", label: "2K", height: 1440, available: qualityAvailable(formats, "2k") },
    { quality: "1080p", label: "1080p", height: 1080, available: qualityAvailable(formats, "1080p") },
    { quality: "720p", label: "720p", height: 720, available: qualityAvailable(formats, "720p") },
    { quality: "480p", label: "480p", height: 480, available: qualityAvailable(formats, "480p") }
  ];
}

function inferCodecs(info: YtDlpInfo) {
  const merged = info.formats?.find((format) => format.vcodec !== "none" && format.acodec !== "none");
  const video = info.vcodec || merged?.vcodec || "unknown";
  const audio = info.acodec || merged?.acodec || "unknown";
  return { video, audio };
}

export async function connectStream(url: string): Promise<StreamMetadata> {
  let info: YtDlpInfo;
  try {
    info = await runYtDlpJson<YtDlpInfo>(url, {
      dumpSingleJson: true,
      skipDownload: true,
      ignoreNoFormatsError: true,
      noWarnings: true,
      noPlaylist: true
    });
  } catch (error) {
    throw new Error(describeYtDlpError(error) || "Unable to read YouTube stream metadata.");
  }
  const liveStatus = normalizeLiveStatus(info);

  const id = info.id || extractYouTubeId(url);
  const height = info.height ?? info.formats?.reduce((max, item) => Math.max(max, item.height ?? 0), 0) ?? 0;
  const width = info.width ?? info.formats?.find((item) => item.height === height)?.width;
  const codecs = inferCodecs(info);
  const thumbnailUrl =
    info.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return {
    id,
    url: info.webpage_url ?? url,
    title: info.title ?? "Untitled livestream",
    channelName: info.channel ?? info.uploader ?? "Unknown channel",
    thumbnailUrl,
    liveStatus,
    durationSeconds: Math.floor(info.duration ?? 0),
    resolution: height ? `${width ?? ""}x${height}`.replace(/^x/, "") : "adaptive",
    videoCodec: codecs.video,
    audioCodec: codecs.audio,
    formats: buildFormats(info.formats ?? []),
    previewImageUrl: thumbnailUrl
  };
}
