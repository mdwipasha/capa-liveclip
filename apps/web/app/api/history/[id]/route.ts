import { deleteHistoryController } from "@modules/history/controller/history-controller";

export const runtime = "nodejs";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return deleteHistoryController(id);
}
