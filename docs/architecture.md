# Architecture

LiveClip is organized as a small monorepo:

```text
apps/
  web/
  api/
  worker/
packages/
  shared/
  database/
  ffmpeg/
  youtube/
  ui/
configs/
docker/
scripts/
docs/
```

## Decisions

`apps/web` owns the Next.js App Router, UI, hooks, and centralized API client. It no longer owns FFmpeg, yt-dlp, database, or business services.

`apps/api` owns HTTP controllers, domain modules, business services, repositories, storage selection, and API deployment. The existing Next route handlers call the same controllers as the standalone API server, preserving current behavior while allowing a separate backend.

`apps/worker` is an independent process entrypoint for future queue-driven work. Heavy jobs should move here behind the queue module as the product grows.

`packages/shared` owns DTOs, validation schemas, env parsing, API response contracts, constants, and pure utilities.

`packages/database` owns Drizzle schema, client, and bootstrap logic so the API and worker can share the same database layer.

`packages/ffmpeg` and `packages/youtube` own binary/process integrations. This keeps provider and media tooling reusable by both API and workers.

`packages/ui` is reserved for reusable UI primitives when the web app grows or a second frontend appears.

The architecture starts simple because the current synchronous API routes still work. It scales without rewriting because the same controllers/services can be invoked from a standalone API process, a Docker service, or future queue workers.
