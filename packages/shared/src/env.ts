import { z } from "zod";

const envSchema = z.object({
  APP_VERSION: z.string().default("0.1.0"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.string().default(""),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("file:local.db"),
  TURSO_AUTH_TOKEN: z.string().optional(),
  YTDLP_PATH: z.string().optional(),
  YTDLP_COOKIES_BASE64: z.string().optional(),
  YTDLP_CONCURRENT_FRAGMENTS: z.coerce.number().int().positive().default(4),
  FFMPEG_PATH: z.string().optional(),
  FFPROBE_PATH: z.string().optional(),
  QUEUE_ADAPTER: z.enum(["inline", "memory", "redis"]).default("inline"),
  STORAGE_PROVIDER: z.enum(["local", "cloudinary", "s3", "r2", "supabase"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().default(".storage"),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  MAX_CLIP_SECONDS: z.coerce.number().int().positive().default(120),
  EXPORT_TIMEOUT_MS: z.coerce.number().int().positive().default(50000)
});

export const env = envSchema.parse(process.env);
