import { chmod, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import https from "node:https";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const vendorDir = path.join(process.cwd(), "vendor", "yt-dlp");

const targets = {
  linux: {
    filename: "yt-dlp",
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
  }
};

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode ?? 0)) {
          response.resume();
          const location = response.headers.location;
          if (!location) {
            reject(new Error("yt-dlp download redirect did not include a location header."));
            return;
          }
          download(location, destination).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`yt-dlp download failed with HTTP ${response.statusCode}.`));
          return;
        }

        pipeline(response, createWriteStream(destination)).then(resolve, reject);
      })
      .on("error", reject);
  });
}

async function main() {
  if (process.env.YTDLP_SKIP_STANDALONE_DOWNLOAD === "1") return;

  const target = targets[process.platform];
  if (!target) return;

  await mkdir(vendorDir, { recursive: true });
  const destination = path.join(vendorDir, target.filename);

  if (!(await exists(destination))) {
    console.log(`Downloading standalone yt-dlp binary for ${process.platform}...`);
    await download(target.url, destination);
  }

  await chmod(destination, 0o755);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
