# LiveClip

LiveClip is a premium MVP web app for generating MP4 clips from YouTube livestreams and livestream archives.

It is not a YouTube downloader clone. The app is focused on one workflow:

1. Paste a YouTube Live URL.
2. Load stream metadata.
3. Select a start and end time.
4. Choose export quality.
5. Generate an MP4 clip.
6. Download the result.

The project is built to run on the Vercel Free Plan, with important limitations documented below.

## Features

- YouTube Live and archived livestream metadata detection
- Timeline range selection with manual time inputs
- Preview image display
- MP4 export through `yt-dlp` and FFmpeg
- Export quality options:
  - Original
  - 4K
  - 2K
  - 1080p
  - 720p
  - 480p
- Local clip history stored in SQLite/Turso
- Settings page for default quality and filename template
- Dark-only premium SaaS interface
- API validation with Zod
- Feature-based architecture prepared for auth, users, teams, cloud storage, and more providers

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- TailwindCSS
- Radix UI / shadcn-style components
- Framer Motion
- Zustand
- TanStack Query
- Zod
- Drizzle ORM
- Turso SQLite / local SQLite
- FFmpeg / FFprobe
- yt-dlp
- Lucide React

## Project Structure

```text
apps/
  web/               Next.js App Router UI, components, hooks, API client
  api/               Standalone API server, controllers, domain modules
  worker/            Worker entrypoint for future queue-based jobs
packages/
  shared/            Types, validation schemas, env parsing, DTOs, utilities
  database/          Drizzle schema, client, bootstrap
  ffmpeg/            FFmpeg/FFprobe binary and process helpers
  youtube/           yt-dlp integration
  ui/                Reserved shared UI package
configs/             ESLint, TypeScript, Drizzle, and future shared config
docker/              Dockerfiles and Docker Compose
docs/                Architecture, deployment, env, and migration notes
scripts/             Install/build helper scripts
```

## Requirements

- Node.js 20+
- npm
- A YouTube account cookies export for production on Vercel, if YouTube blocks datacenter traffic
- Turso account for production persistence

Local development can run without Turso and without manually installing FFmpeg or yt-dlp. The project uses bundled packages:

- `ffmpeg-static`
- `ffprobe-static`
- `yt-dlp-exec`

On Linux production, `postinstall` downloads the official standalone `yt-dlp_linux` binary into `vendor/yt-dlp`.

## Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Default local values:

```env
APP_VERSION=0.1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=
DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
YTDLP_PATH=
YTDLP_COOKIES_BASE64=
YTDLP_CONCURRENT_FRAGMENTS=4
FFMPEG_PATH=
FFPROBE_PATH=
MAX_CLIP_SECONDS=120
EXPORT_TIMEOUT_MS=50000
```

### Variable Reference

| Variable | Required | Description |
| --- | --- | --- |
| `APP_VERSION` | No | Version shown in Settings. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL. Use your Vercel URL in production. |
| `NEXT_PUBLIC_API_BASE_URL` | No | API origin for split deployments. Leave empty for same-origin Next API routes. |
| `API_HOST` | No | Host for the standalone API server. Default is `0.0.0.0`. |
| `API_PORT` | No | Port for the standalone API server. Default is `4000`. |
| `DATABASE_URL` | Yes | Local SQLite or Turso database URL. |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token for hosted database. |
| `YTDLP_PATH` | No | Optional custom yt-dlp binary path. Leave empty on Vercel. |
| `YTDLP_COOKIES_BASE64` | Often needed on Vercel | Base64-encoded YouTube cookies.txt content. |
| `YTDLP_CONCURRENT_FRAGMENTS` | No | Parallel yt-dlp fragment downloads. Default is `4`; increase carefully if your network and YouTube allow it. |
| `FFMPEG_PATH` | No | Optional custom FFmpeg binary path. |
| `FFPROBE_PATH` | No | Optional custom FFprobe binary path. |
| `MAX_CLIP_SECONDS` | No | Maximum clip length. Default is `120`. |
| `EXPORT_TIMEOUT_MS` | No | Per-command timeout. Keep around `50000` on Vercel Free so the API can return JSON before the platform timeout. |
| `STORAGE_PROVIDER` | No | Storage adapter. `local` is implemented; `cloudinary`, `s3`, `r2`, and `supabase` are reserved. |
| `LOCAL_STORAGE_DIR` | No | Local storage directory for future storage adapter usage. |
| `QUEUE_ADAPTER` | No | Queue adapter for workers. Current synchronous export path still uses inline processing. |
| `WORKER_POLL_INTERVAL_MS` | No | Worker polling interval for future queued jobs. |

Never commit `.env`, `youtube-cookies.txt`, local database files, or Turso auth files.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Database

LiveClip uses Drizzle ORM with SQLite-compatible storage.

For local development:

```env
DATABASE_URL=file:local.db
```

The app has a runtime bootstrap that creates the required tables if they do not exist.

Tables:

- `clips`
- `settings`

## Turso Setup

Turso is the recommended production database because Vercel local filesystem storage is not persistent.

Install Turso CLI:

```bash
npm install -g turso
```

Login:

```bash
turso auth login
```

Create a database:

```bash
turso db create liveclip
```

Get database URL:

```bash
turso db show liveclip
```

Create a token:

```bash
turso db tokens create liveclip
```

Set these in Vercel:

```env
DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your_turso_token
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_VERSION=0.1.0
MAX_CLIP_SECONDS=120
```

Leave these empty unless you know you need custom binaries:

```env
YTDLP_PATH=
FFMPEG_PATH=
FFPROBE_PATH=
```

## YouTube Cookies for Vercel

YouTube may block requests from Vercel/datacenter IPs with this error:

```text
Sign in to confirm you are not a bot
```

If this happens, export YouTube cookies from your browser and provide them to the app as a base64 environment variable.

1. Install a browser extension that exports cookies in Netscape `cookies.txt` format, for example "Get cookies.txt LOCALLY".
2. Export cookies for `youtube.com`.
3. Save as `youtube-cookies.txt`.
4. Convert to base64.

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\youtube-cookies.txt"))
```

macOS/Linux:

```bash
base64 -w 0 youtube-cookies.txt
```

Add the result to Vercel:

```env
YTDLP_COOKIES_BASE64=your_base64_cookies_text
```

Important:

- Do not commit `youtube-cookies.txt`.
- Treat cookies like a password.
- If YouTube invalidates the session, export fresh cookies and update the Vercel env var.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add production environment variables.
4. Deploy.

Recommended Vercel env vars:

```env
DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_VERSION=0.1.0
MAX_CLIP_SECONDS=120
YTDLP_COOKIES_BASE64=your_base64_cookies_text_if_needed
```

If production still uses old binaries or old env values, redeploy with:

```text
Redeploy -> Clear Build Cache
```

## How Export Works

The current export flow is synchronous:

1. API receives stream metadata, range, and quality.
2. `yt-dlp` resolves direct media URLs.
3. `yt-dlp` downloads the selected media range, using parallel fragments when possible.
4. FFmpeg cuts/transcodes the selected segment.
5. The MP4 is written to temporary storage.
6. Clip metadata is stored in the database.
7. Download returns the MP4.

The app uses `/tmp/liveclip/...` for generated MP4 files.

The dashboard shows an estimated export progress bar while the request is running. It is intentionally an estimate because the current HTTP endpoint does not stream backend progress events yet. Actual speed depends on YouTube response speed, clip duration, selected quality, transcoding cost, local CPU, disk speed, and available YouTube formats.

For faster exports:

- Prefer shorter ranges.
- Use `original` when you do not need resizing or re-encoding.
- Use `480p` or `720p` for fast sharing previews.
- Increase `YTDLP_CONCURRENT_FRAGMENTS` carefully for local/VPS deployments.
- Run API/worker on a machine with stronger CPU for 1080p, 2K, or 4K.

For true backend progress and reliable long jobs, move export execution to the worker queue path and report progress through polling, Server-Sent Events, or WebSockets.

## Important Vercel Free Plan Limitations

Vercel serverless filesystem storage is temporary.

This means:

- Generated MP4 files are not permanently stored.
- A file created during `/api/export` may not exist during `/api/download`.
- The download route can regenerate the clip from database metadata if the temporary file is missing.
- Download may take longer if regeneration is needed.
- Synchronous exports must stay short. LiveClip rejects long/high-quality exports earlier on Vercel Free so the platform does not kill the request with a non-JSON error page.

This is intentional for the MVP because the project avoids:

- Long-running workers
- Redis
- BullMQ
- Docker
- Paid APIs
- Persistent local storage

For a production-grade version, add cloud object storage such as:

- Cloudflare R2
- S3
- Vercel Blob

Then store the MP4 once and save the public/private file URL in the database.

## Export Quality Notes

`original` means LiveClip tries to copy the best source video and audio without re-encoding.

Preset qualities such as `1080p`, `720p`, or `4K` use:

- Best available source at or below the target height
- FFmpeg scaling/transcoding
- Quality-specific CRF, bitrate, audio bitrate, and FPS settings

If YouTube only exposes low-quality formats for a specific stream, LiveClip cannot create real high-quality detail that does not exist in the source.

## API Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/connect` | `POST` | Load YouTube livestream metadata. |
| `/api/export` | `POST` | Generate a clip. |
| `/api/download/[id]` | `GET` | Download or regenerate a clip. |
| `/api/history` | `GET` | List clip history. |
| `/api/history/[id]` | `DELETE` | Delete a clip record. |
| `/api/settings` | `GET` | Read settings. |
| `/api/settings` | `PUT` | Update settings. |

## Common Errors

### `Sign in to confirm you are not a bot`

YouTube blocked the Vercel/datacenter request. Add `YTDLP_COOKIES_BASE64`.

### `Unsupported version of Python`

Vercel has Python 3.9, while newer yt-dlp Python zipapps need Python 3.10+. This app downloads the standalone `yt-dlp_linux` binary during `postinstall`. Redeploy with cleared build cache.

### `Requested format is not available`

The selected source format is not exposed for that stream. LiveClip has fallback selectors, but some YouTube videos expose limited formats depending on cookies, region, age restrictions, or signature-solving.

### `This export is no longer available`

Old behavior when `/tmp` file disappeared. Current download route regenerates the file from history metadata. Make sure the latest code is deployed.

### Export takes too long

Local exports still depend on CPU, disk, and YouTube network speed. Higher quality exports take longer because FFmpeg must decode, scale, and encode the clip.

Try shorter clip ranges, lower quality presets, `original` quality when acceptable, increasing `YTDLP_CONCURRENT_FRAGMENTS`, or running API/worker on a stronger VPS.

Vercel Free has strict execution limits. Lower `MAX_CLIP_SECONDS`, choose lower quality, or move export jobs to a worker/storage architecture for long clips.

## Scripts

```bash
npm run dev          # Start development server
npm run dev:api      # Start standalone API server
npm run dev:worker   # Start worker entrypoint
npm run build        # Production build
npm run start        # Start production server
npm run start:api    # Start standalone API server
npm run start:worker # Start worker entrypoint
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
npm run db:studio    # Open Drizzle Studio
```

## Future Roadmap

The architecture is prepared for:

- Authentication
- Multiple users
- Team workspaces
- Cloud storage
- Multiple livestream providers
- Rolling livestream buffer
- Instant replay
- AI highlight detection
- Auto clip generation
- Persistent export jobs

## Security Notes

- Do not commit `.env`.
- Do not commit `youtube-cookies.txt`.
- Rotate YouTube cookies if exposed.
- Do not expose Turso auth tokens publicly.
- Treat generated clips as temporary unless cloud storage is added.

## License

This project is currently private/internal. Add a license before distributing publicly.
