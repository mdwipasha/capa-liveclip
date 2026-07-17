import ytDlp from "yt-dlp-exec";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

type YtDlpRunner = typeof ytDlp & {
  exec: (
    url: string,
    flags?: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => Promise<{ stdout: string; stderr?: string }>;
};
type YtDlpFactory = YtDlpRunner & {
  create: (binaryPath: string) => YtDlpRunner;
};

function bundledBinaryPath() {
  const vendorCandidate = path.join(
    process.cwd(),
    "vendor",
    "yt-dlp",
    process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
  );
  if (existsSync(vendorCandidate)) return vendorCandidate;

  const filename = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const candidate = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", filename);
  return existsSync(candidate) ? candidate : undefined;
}

export function getYtDlpRunner(): YtDlpRunner {
  const factory = ytDlp as YtDlpFactory;
  const binaryPath = env.YTDLP_PATH || bundledBinaryPath();
  return binaryPath ? factory.create(binaryPath) : factory;
}

export async function runYtDlpJson<T>(url: string, flags: Record<string, unknown>) {
  const { stdout } = await getYtDlpRunner().exec(url, flags, { timeout: 60000 });
  return JSON.parse(stdout) as T;
}

export async function runYtDlpText(url: string, flags: Record<string, unknown>) {
  const { stdout } = await getYtDlpRunner().exec(url, flags, { timeout: 60000 });
  return stdout;
}

export function describeYtDlpError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { stderr?: string; stdout?: string; shortMessage?: string; message?: string };
    return maybeError.stderr || maybeError.stdout || maybeError.shortMessage || maybeError.message;
  }
  return undefined;
}
