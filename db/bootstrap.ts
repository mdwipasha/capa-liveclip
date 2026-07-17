import { dbClient } from "@/db/client";

let initialized = false;

export async function ensureDatabase() {
  if (initialized) return;
  await dbClient.batch([
    `CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY NOT NULL,
      stream_id TEXT NOT NULL,
      source_url TEXT NOT NULL,
      title TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      start_seconds INTEGER NOT NULL,
      end_seconds INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      resolution TEXT NOT NULL,
      quality TEXT NOT NULL,
      output_filename TEXT NOT NULL,
      download_url TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY NOT NULL,
      default_quality TEXT NOT NULL,
      filename_template TEXT NOT NULL,
      theme TEXT NOT NULL,
      app_version TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  ]);
  initialized = true;
}
