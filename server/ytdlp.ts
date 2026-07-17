import ytDlp from "yt-dlp-exec";
import { existsSync } from "node:fs";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
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

let cookiesFilePromise: Promise<string | undefined> | undefined;

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

async function getCookiesFile() {
  if (!env.YTDLP_COOKIES_BASE64) return undefined;
  if (cookiesFilePromise) return cookiesFilePromise;

  cookiesFilePromise = (async () => {
    const cookieText = Buffer.from(env.YTDLP_COOKIES_BASE64 ?? "", "base64").toString("utf8").trim();
    if (!cookieText) return undefined;

    const dir = path.join(os.tmpdir(), "liveclip");
    const filePath = path.join(dir, "youtube-cookies.txt");
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, `${cookieText}\n`, { encoding: "utf8" });
    await chmod(filePath, 0o600);
    return filePath;
  })();

  return cookiesFilePromise;
}

async function withAuthFlags(flags: Record<string, unknown>) {
  const cookies = await getCookiesFile();
  const cacheDir = path.join(os.tmpdir(), "liveclip", "yt-dlp-cache");
  await mkdir(cacheDir, { recursive: true });

  return {
    jsRuntimes: "node",
    remoteComponents: "ejs:github",
    cacheDir,
    ...(cookies ? { cookies } : {}),
    ...flags
  };
}

export function getYtDlpRunner(): YtDlpRunner {
  const factory = ytDlp as YtDlpFactory;
  const binaryPath = env.YTDLP_PATH || bundledBinaryPath();
  return binaryPath ? factory.create(binaryPath) : factory;
}

export async function runYtDlpJson<T>(url: string, flags: Record<string, unknown>) {
  const { stdout } = await getYtDlpRunner().exec(url, await withAuthFlags(flags), { timeout: 60000 });
  return JSON.parse(stdout) as T;
}

export async function runYtDlpText(url: string, flags: Record<string, unknown>) {
  const { stdout } = await getYtDlpRunner().exec(url, await withAuthFlags(flags), { timeout: 60000 });
  return stdout;
}

export function describeYtDlpError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { stderr?: string; stdout?: string; shortMessage?: string; message?: string };
    return maybeError.stderr || maybeError.stdout || maybeError.shortMessage || maybeError.message;
  }
  return undefined;
}
