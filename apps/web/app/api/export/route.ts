import { exportController } from "@modules/clip/controller/export-controller";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  return exportController(request);
}
