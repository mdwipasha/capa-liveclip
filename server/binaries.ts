import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

function resolveNodeModuleBinary(packageName: string, relativePath: string) {
  const candidate = path.join(process.cwd(), "node_modules", packageName, relativePath);
  return existsSync(candidate) ? candidate : undefined;
}

function resolveFfmpegPath() {
  const filename = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  return env.FFMPEG_PATH || resolveNodeModuleBinary("ffmpeg-static", filename) || ffmpegStatic || "ffmpeg";
}

function resolveFfprobePath() {
  const filename = process.platform === "win32" ? "ffprobe.exe" : "ffprobe";
  const platform = process.platform === "win32" ? "win32" : process.platform;
  const arch = process.arch;
  return (
    env.FFPROBE_PATH ||
    resolveNodeModuleBinary("ffprobe-static", path.join("bin", platform, arch, filename)) ||
    ffprobeStatic.path ||
    "ffprobe"
  );
}

export const binaries = {
  ffmpeg: resolveFfmpegPath(),
  ffprobe: resolveFfprobePath()
};
