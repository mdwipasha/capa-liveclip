import { listHistoryController } from "@modules/history/controller/history-controller";

export const runtime = "nodejs";

export async function GET() {
  return listHistoryController();
}
