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
      const firstIssue = error.issues[0];
      const field = firstIssue?.path.join(".");
      const message = firstIssue
        ? `${field ? `${field}: ` : ""}${firstIssue.message}`
        : "Clip settings need a quick correction.";
      return fail("VALIDATION_ERROR", message, 422, error.flatten());
    }
    return fail("EXPORT_FAILED", toErrorMessage(error), 500);
  }
}
