# Migration Report

## Completed

- Moved the Next.js frontend into `apps/web`.
- Moved domain types, validation, environment parsing, API response helpers, and utilities into `packages/shared`.
- Moved Drizzle schema/client/bootstrap into `packages/database`.
- Moved FFmpeg process and binary helpers into `packages/ffmpeg`.
- Moved yt-dlp helper code into `packages/youtube`.
- Moved backend business logic into domain modules under `apps/api/src/modules`.
- Added controller functions so Next API compatibility routes and the standalone API share the same code path.
- Added a standalone API HTTP server at `apps/api/src/server.ts`.
- Added a worker entrypoint at `apps/worker/src/index.ts`.
- Added storage adapter interfaces plus a local storage adapter.
- Added TypeScript aliases for `@web/*`, `@api/*`, `@modules/*`, `@shared/*`, `@database/*`, `@ffmpeg/*`, `@youtube/*`, and `@ui/*`.
- Added Docker, PM2, Nginx, deployment, and environment documentation.

## Compatibility

Existing UI, routes, database schema, settings, history, stream connection, export, and download behavior are preserved. The Next API routes remain available for local development and same-origin deployment, while `NEXT_PUBLIC_API_BASE_URL` can point the web app at a separate API server.

## Verification

`npm run typecheck` passed.

`npm run lint` passed.

`npm run build` passed, including `next build apps/web`.

`npm run dev:worker` starts successfully.

The standalone API entrypoint starts successfully with `npx tsx apps/api/src/server.ts`.
