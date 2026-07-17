import { fail, ok, toErrorMessage } from "@/lib/api-response";
import { removeClip } from "@/services/history-service";

export const runtime = "nodejs";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await removeClip(id);
    return ok({ id });
  } catch (error) {
    return fail("UNKNOWN_ERROR", toErrorMessage(error), 500);
  }
}
