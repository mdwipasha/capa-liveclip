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
app/                 Next.js pages and API routes
components/          Shared UI and layout components
db/                  Drizzle schema, database client, bootstrap
features/            Feature modules for clips, history, settings
hooks/               Client data hooks
lib/                 Validation, env, API helpers, utilities
server/              Server-only helpers and repositories
services/            Business logic for streams, export, history
types/               Shared domain types
utils/               Time, filename, YouTube helpers
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
DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
YTDLP_PATH=
YTDLP_COOKIES_BASE64=
FFMPEG_PATH=
FFPROBE_PATH=
MAX_CLIP_SECONDS=120
```

### Variable Reference

| Variable | Required | Description |
| --- | --- | --- |
| `APP_VERSION` | No | Version shown in Settings. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL. Use your Vercel URL in production. |
| `DATABASE_URL` | Yes | Local SQLite or Turso database URL. |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token for hosted database. |
| `YTDLP_PATH` | No | Optional custom yt-dlp binary path. Leave empty on Vercel. |
| `YTDLP_COOKIES_BASE64` | Often needed on Vercel | Base64-encoded YouTube cookies.txt content. |
| `FFMPEG_PATH` | No | Optional custom FFmpeg binary path. |
| `FFPROBE_PATH` | No | Optional custom FFprobe binary path. |
| `MAX_CLIP_SECONDS` | No | Maximum clip length. Default is `120`. |
| `EXPORT_TIMEOUT_MS` | No | Per-command timeout. Keep around `50000` on Vercel Free so the API can return JSON before the platform timeout. |

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

The export flow is synchronous and Vercel-friendly:

1. API receives stream metadata, range, and quality.
2. `yt-dlp` resolves direct media URLs.
3. FFmpeg cuts/transcodes the selected segment.
4. The MP4 is written to temporary storage.
5. Clip metadata is stored in the database.
6. Download returns the MP4.

The app uses `/tmp/liveclip/...` for generated MP4 files.

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

Vercel Free has strict execution limits. Lower `MAX_CLIP_SECONDS`, choose lower quality, or move export jobs to a worker/storage architecture in a future version.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
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
