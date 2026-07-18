import { mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fail, ok, toErrorMessage } from "@shared/api-response";
import { generateClipFile } from "@modules/clip/service/export-service";
import { getClipById, getClipHistory, removeClip } from "@modules/history/service/history-service";

async function readClipFile(filePath: string) {
  return readFile(filePath);
}

export async function listHistoryController() {
  try {
    const clips = await getClipHistory();
    return ok({ clips });
  } catch (error) {
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}

export async function deleteHistoryController(id: string) {
  try {
    await removeClip(id);
    return ok({ id });
  } catch (error) {
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}

export async function downloadClipController(request: Request, id: string) {
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
