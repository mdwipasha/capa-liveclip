import { ok, fail, toErrorMessage } from "@/lib/api-response";
import { getClipHistory } from "@/services/history-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const clips = await getClipHistory();
    return ok({ clips });
  } catch (error) {
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}
