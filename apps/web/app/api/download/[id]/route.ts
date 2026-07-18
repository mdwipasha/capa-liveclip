import { downloadClipController } from "@modules/history/controller/history-controller";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return downloadClipController(request, id);
}
