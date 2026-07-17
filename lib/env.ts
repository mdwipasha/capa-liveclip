import { z } from "zod";

const envSchema = z.object({
  APP_VERSION: z.string().default("0.1.0"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("file:local.db"),
  TURSO_AUTH_TOKEN: z.string().optional(),
  YTDLP_PATH: z.string().optional(),
  YTDLP_COOKIES_BASE64: z.string().optional(),
  FFMPEG_PATH: z.string().optional(),
  FFPROBE_PATH: z.string().optional(),
  MAX_CLIP_SECONDS: z.coerce.number().int().positive().default(120),
  EXPORT_TIMEOUT_MS: z.coerce.number().int().positive().default(50000)
});

export const env = envSchema.parse(process.env);
