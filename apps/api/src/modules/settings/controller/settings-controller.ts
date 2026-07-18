import { ZodError } from "zod";
import { fail, ok, toErrorMessage } from "@shared/api-response";
import { settingsUpdateSchema } from "@shared/validation";
import { getSettings, updateSettings } from "@modules/settings/repository/settings-repository";

export async function getSettingsController() {
  try {
    return ok({ settings: await getSettings() });
  } catch (error) {
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}

export async function updateSettingsController(request: Request) {
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
