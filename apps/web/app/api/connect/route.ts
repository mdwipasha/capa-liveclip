import { connectController } from "@modules/youtube/controller/connect-controller";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  return connectController(request);
}
