import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { env } from "@/lib/env";
import { binaries } from "@/server/binaries";
import { getSettings } from "@/server/repositories/settings-repository";
import { createClip } from "@/server/repositories/history-repository";
import { runCommand } from "@/server/process";
import type { ClipHistoryItem, ExportQuality, StreamMetadata } from "@/types/domain";
import { renderFilenameTemplate } from "@/utils/filename";
import { describeYtDlpError, runYtDlpText } from "@/server/ytdlp";

function qualityArgs(quality: ExportQuality) {
  if (quality === "original") return ["-c", "copy"];
  const height = Number.parseInt(quality, 10);
  return [
    "-vf",
    `scale=-2:min(${height}\\,ih)`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "22",
    "-c:a",
    "aac",
    "-b:a",
    "160k"
  ];
}

function formatSelectors(quality: ExportQuality) {
  if (quality === "original") return ["best", "bestvideo*+bestaudio/best"];

  const height = Number.parseInt(quality, 10);
  return [
    `best[height<=${height}]/best`,
    `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`,
    "best"
  ];
}

async function resolveMediaUrls(url: string, quality: ExportQuality) {
  let lastError: unknown;

  for (const selector of formatSelectors(quality)) {
    try {
      const stdout = await runYtDlpText(url, {
        f: selector,
        g: true,
        noPlaylist: true
      });
      const mediaUrls = stdout.split(/\r?\n/).filter(Boolean);
      if (mediaUrls.length > 0) return mediaUrls;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(describeYtDlpError(lastError) || "Unable to resolve a playable stream format.");
}

export async function exportClip(input: {
  stream: StreamMetadata;
  startSeconds: number;
  endSeconds: number;
  quality: ExportQuality;
}): Promise<ClipHistoryItem> {
  const duration = input.endSeconds - input.startSeconds;
  if (duration > env.MAX_CLIP_SECONDS) {
    throw new Error(`Clip duration cannot exceed ${env.MAX_CLIP_SECONDS} seconds.`);
  }

  const settings = await getSettings();
  const createdAt = new Date();
  const id = randomUUID();
  const outputFilename = renderFilenameTemplate(settings.filenameTemplate, input.stream, createdAt);
  const tempDir = path.join(os.tmpdir(), "liveclip", id);
  const outputPath = path.join(tempDir, outputFilename);

  await mkdir(tempDir, { recursive: true });

  let mediaUrls: string[];
  try {
    mediaUrls = await resolveMediaUrls(input.stream.url, input.quality);
  } catch (error) {
    throw new Error(describeYtDlpError(error) || "Unable to resolve livestream media URLs.");
  }

  const sourceArgs =
    mediaUrls.length > 1
      ? ["-ss", String(input.startSeconds), "-i", mediaUrls[0], "-ss", String(input.startSeconds), "-i", mediaUrls[1]]
      : ["-ss", String(input.startSeconds), "-i", mediaUrls[0] ?? input.stream.url];

  await runCommand(
    binaries.ffmpeg,
    [
      "-y",
      ...sourceArgs,
      "-t",
      String(duration),
      ...(mediaUrls.length > 1 ? ["-map", "0:v:0", "-map", "1:a:0"] : []),
      ...qualityArgs(input.quality),
      "-movflags",
      "+faststart",
      outputPath
    ],
    90000
  );

  const clip: ClipHistoryItem = {
    id,
    streamId: input.stream.id,
    sourceUrl: input.stream.url,
    title: input.stream.title,
    channelName: input.stream.channelName,
    thumbnailUrl: input.stream.thumbnailUrl,
    startSeconds: input.startSeconds,
    endSeconds: input.endSeconds,
    durationSeconds: duration,
    resolution: input.quality === "original" ? input.stream.resolution : input.quality,
    quality: input.quality,
    outputFilename,
    downloadUrl: `/api/download/${id}?file=${encodeURIComponent(outputFilename)}`,
    createdAt: createdAt.toISOString()
  };

  await createClip(clip);
  return clip;
}
