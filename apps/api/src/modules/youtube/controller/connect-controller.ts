import { ZodError } from "zod";
import { fail, ok, toErrorMessage } from "@shared/api-response";
import { connectRequestSchema } from "@shared/validation";
import { connectStream } from "@modules/youtube/service/stream-service";

export async function connectController(request: Request) {
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
