import { ZodError } from "zod";
import { ok, fail, toErrorMessage } from "@/lib/api-response";
import { connectRequestSchema } from "@/lib/validation";
import { connectStream } from "@/services/stream-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const input = connectRequestSchema.parse(await request.json());
    const stream = await connectStream(input.url);
    return ok(stream);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("INVALID_URL", "Please enter a valid YouTube livestream URL.", 422, error.flatten());
    }
    const message = toErrorMessage(error);
    return fail(
      message.toLowerCase().includes("livestream") ? "NOT_LIVESTREAM" : "STREAM_UNAVAILABLE",
      message,
      400
    );
  }
}
