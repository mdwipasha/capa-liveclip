import { ZodError } from "zod";
import { fail, ok, toErrorMessage } from "@/lib/api-response";
import { getSettings, updateSettings } from "@/server/repositories/settings-repository";
import { settingsUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    return ok({ settings: await getSettings() });
  } catch (error) {
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}

export async function PUT(request: Request) {
  try {
    const input = settingsUpdateSchema.parse(await request.json());
    return ok({ settings: await updateSettings(input) });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("VALIDATION_ERROR", "Settings are not valid.", 422, error.flatten());
    }
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}
