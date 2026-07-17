import { mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fail } from "@/lib/api-response";
import { getClipById } from "@/services/history-service";
import { generateClipFile } from "@/services/export-service";
import { toErrorMessage } from "@/lib/api-response";

export const runtime = "nodejs";
export const maxDuration = 120;

async function readClipFile(filePath: string) {
  return readFile(filePath);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const filename = new URL(request.url).searchParams.get("file") ?? "liveclip.mp4";
  const filePath = path.join(os.tmpdir(), "liveclip", id, filename);

  try {
    let buffer: Buffer;
    try {
      buffer = await readClipFile(filePath);
    } catch {
      const clip = await getClipById(id);
      if (!clip) {
        return fail("NOT_FOUND", "Clip history record was not found.", 404);
      }

      await mkdir(path.dirname(filePath), { recursive: true });
      await generateClipFile({
        sourceUrl: clip.sourceUrl,
        startSeconds: clip.startSeconds,
        durationSeconds: clip.durationSeconds,
        quality: clip.quality,
        outputPath: filePath
      });
      buffer = await readClipFile(filePath);
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename.replaceAll('"', "")}"`
      }
    });
  } catch (error) {
    return fail("EXPORT_FAILED", toErrorMessage(error), 500);
  }
}
