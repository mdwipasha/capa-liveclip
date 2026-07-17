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
import { secondsToTimestamp } from "@/utils/time";
import { describeYtDlpError, runYtDlpCommand } from "@/server/ytdlp";

/**
 * Preset per kualitas.
 * - crf makin kecil = makin bagus (bitrate lebih gede), disesuaikan per resolusi
 *   biar 4K ga "hemat" & 480p ga "boros" filesize-nya.
 * - videoBitrate dipakai buat -maxrate/-bufsize, nge-cap bitrate biar hasil encode
 *   stabil (ga ada spike bitrate yg bikin buffer/playback aneh).
 * - fps dipaksa via -r + -fps_mode cfr. CATATAN: kalau source aslinya cuma 30fps,
 *   maka frame bakal di-duplicate buat capai 60fps (bukan interpolasi asli),
 *   makanya format selector di bawah prioritasin cari source yg emang udah >=60fps.
 */

type QualityPreset = {
  height: number;
  fps: number;
  crf: number;
  preset: string;
  videoBitrate: string;
  audioBitrate: string;
  audioSampleRate: number;
};

const QUALITY_PRESETS: Record<Exclude<ExportQuality, "original">, QualityPreset> = {
  "480p": { height: 480, fps: 30, crf: 23, preset: "veryfast", videoBitrate: "1500k", audioBitrate: "128k", audioSampleRate: 44100 },
  "720p": { height: 720, fps: 60, crf: 21, preset: "veryfast", videoBitrate: "4500k", audioBitrate: "160k", audioSampleRate: 48000 },
  "1080p": { height: 1080, fps: 60, crf: 19, preset: "fast", videoBitrate: "8000k", audioBitrate: "192k", audioSampleRate: 48000 },
  "2k": { height: 1440, fps: 60, crf: 18, preset: "medium", videoBitrate: "16000k", audioBitrate: "224k", audioSampleRate: 48000 },
  "4k": { height: 2160, fps: 60, crf: 17, preset: "slow", videoBitrate: "35000k", audioBitrate: "256k", audioSampleRate: 48000 }
};

function qualityArgs(quality: ExportQuality) {
  // Original = full stream copy, ga di-reencode → kualitas source dipertahankan 1:1
  if (quality === "original") return ["-c", "copy"];

  const q = QUALITY_PRESETS[quality];
  const maxrateNum = Number.parseInt(q.videoBitrate, 10);

  return [
    // scale ke height target beneran (bukan cuma "min" cap), lanczos biar upscale/downscale tetap tajam
    "-vf",
    `scale=-2:${q.height}:flags=lanczos`,
    // paksa output frame rate konstan → hilangin variable frame rate yg suka bikin kesan "delay"/stutter
    "-r",
    String(q.fps),
    "-fps_mode",
    "cfr",
    "-c:v",
    "libx264",
    "-preset",
    q.preset,
    "-crf",
    String(q.crf),
    "-maxrate",
    q.videoBitrate,
    "-bufsize",
    `${maxrateNum * 2}k`,
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    q.audioBitrate,
    "-ar",
    String(q.audioSampleRate),
    "-ac",
    "2"
  ];
}

function formatSelectors(quality: ExportQuality) {
  if (quality === "original") {
    return ["bestvideo*+bestaudio/bestvideo+bestaudio/best", "bv*+ba/b", "best"];
  }

  const { height, fps } = QUALITY_PRESETS[quality];

  return [
    // prioritas: cari source yg fps-nya udah >= target, biar 60fps beneran bukan hasil duplicate frame
    `bestvideo*[height<=${height}][fps>=${fps}]+bestaudio/bestvideo[height<=${height}][fps>=${fps}]+bestaudio`,
    `bestvideo*[height<=${height}]+bestaudio/bestvideo[height<=${height}]+bestaudio`,
    `bv*[height<=${height}]+ba/b[height<=${height}]`,
    `best[height<=${height}]`,
    "best"
  ];
}

async function downloadClipSection(input: {
  sourceUrl: string;
  startSeconds: number;
  durationSeconds: number;
  quality: ExportQuality;
  outputPath: string;
}) {
  let lastError: unknown;
  const start = secondsToTimestamp(input.startSeconds);
  const end = secondsToTimestamp(input.startSeconds + input.durationSeconds);

  for (const selector of formatSelectors(input.quality)) {
    try {
      await runYtDlpCommand(
        input.sourceUrl,
        {
          f: selector,
          o: input.outputPath,
          downloadSections: `*${start}-${end}`,
          forceKeyframesAtCuts: true,
          mergeOutputFormat: "mp4",
          recodeVideo: "mp4",
          ffmpegLocation: binaries.ffmpeg,
          noPlaylist: true,
          noPart: true,
          noMtime: true,
          retries: 3,
          fragmentRetries: 3
        },
        commandTimeoutMs(input.quality, input.durationSeconds)
      );
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(describeYtDlpError(lastError) || "Unable to download a playable stream segment.");
}

// timeout dinamis: preset lambat (2K/4K) + clip panjang butuh alokasi waktu lebih
function commandTimeoutMs(quality: ExportQuality, durationSeconds: number) {
  const perSecondMs: Record<ExportQuality, number> = {
    "480p": 1500,
    "720p": 2000,
    "1080p": 3000,
    "2k": 5000,
    "4k": 9000,
    original: 1200
  };
  const baseMs = 45000; // overhead resolve stream + seek
  return baseMs + durationSeconds * (perSecondMs[quality] ?? 3000);
}

export async function generateClipFile(input: {
  sourceUrl: string;
  startSeconds: number;
  durationSeconds: number;
  quality: ExportQuality;
  outputPath: string;
}) {
  const tempDir = path.dirname(input.outputPath);
  await mkdir(tempDir, { recursive: true });

  if (input.quality === "original") {
    await downloadClipSection(input);
    return;
  }

  const sourcePath = path.join(tempDir, "source.mp4");
  await downloadClipSection({ ...input, outputPath: sourcePath });

  await runCommand(
    binaries.ffmpeg,
    [
      "-y",
      // genpts: regenerasi timestamp yg ilang/rusak dari stream live, sering jadi sumber desync
      "-fflags",
      "+genpts",
      "-i",
      sourcePath,
      "-t",
      String(input.durationSeconds),
      // normalisasi timestamp negatif & buffer muxing besar → nyegah audio "ketinggalan"/delay pas mux
      "-avoid_negative_ts",
      "make_zero",
      "-max_muxing_queue_size",
      "9999",
      ...qualityArgs(input.quality),
      "-movflags",
      "+faststart",
      input.outputPath
    ],
    commandTimeoutMs(input.quality, input.durationSeconds)
  );
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

  try {
    await generateClipFile({
      sourceUrl: input.stream.url,
      startSeconds: input.startSeconds,
      durationSeconds: duration,
      quality: input.quality,
      outputPath
    });
  } catch (error) {
    throw new Error(describeYtDlpError(error) || "Unable to resolve livestream media URLs.");
  }

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
