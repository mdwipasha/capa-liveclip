import { ZodError } from "zod";
import { fail, ok, toErrorMessage } from "@shared/api-response";
import { exportRequestSchema } from "@shared/validation";
import { exportClip } from "@modules/clip/service/export-service";

export async function exportController(request: Request) {
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
