import { ZodError } from "zod";
import { ok, fail, toErrorMessage } from "@/lib/api-response";
import { exportRequestSchema } from "@/lib/validation";
import { exportClip } from "@/services/export-service";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const input = exportRequestSchema.parse(await request.json());
    const clip = await exportClip(input);
    return ok({ clip });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("VALIDATION_ERROR", "Clip settings need a quick correction.", 422, error.flatten());
    }
    return fail("EXPORT_FAILED", toErrorMessage(error), 500);
  }
}
