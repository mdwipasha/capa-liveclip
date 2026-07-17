import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fail } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const filename = new URL(request.url).searchParams.get("file") ?? "liveclip.mp4";
  const filePath = path.join(os.tmpdir(), "liveclip", id, filename);

  try {
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename.replaceAll('"', "")}"`
      }
    });
  } catch {
    return fail(
      "NOT_FOUND",
      "This export is no longer available on the server. Generate the clip again to download it.",
      404
    );
  }
}
