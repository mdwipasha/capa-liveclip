# Environment Variables

Use separate files per process:

- `apps/web/.env.local`
- `apps/api/.env`
- `apps/worker/.env`

## Web

`NEXT_PUBLIC_APP_URL` is the public web URL. Default: `http://localhost:3000`.

`NEXT_PUBLIC_API_BASE_URL` is the API origin used by the centralized web API client. Leave empty for same-origin Next API compatibility, or set it to a remote API such as `https://api.example.com`.

## API

`API_HOST` and `API_PORT` configure the standalone API server. Defaults: `0.0.0.0` and `4000`.

`DATABASE_URL` and `TURSO_AUTH_TOKEN` configure Drizzle/libSQL. The local default is `file:local.db`.

`YTDLP_PATH`, `YTDLP_COOKIES_BASE64`, `FFMPEG_PATH`, and `FFPROBE_PATH` override binary discovery.

`YTDLP_CONCURRENT_FRAGMENTS` controls parallel fragment downloads for yt-dlp. Default: `4`.

`MAX_CLIP_SECONDS` and `EXPORT_TIMEOUT_MS` control synchronous export limits.

`STORAGE_PROVIDER` selects `local`, `cloudinary`, `s3`, `r2`, or `supabase`. Only `local` is implemented now; the adapter boundary is ready for the others.

`LOCAL_STORAGE_DIR` is the local storage adapter directory. Default: `.storage`.

## Worker

`QUEUE_ADAPTER` selects `inline`, `memory`, or `redis`. The current worker entrypoint is ready for the queue abstraction; existing synchronous exports still run through the API compatibility path.

`WORKER_POLL_INTERVAL_MS` configures worker polling. Default: `5000`.
