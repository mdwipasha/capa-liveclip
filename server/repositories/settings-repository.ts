import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ensureDatabase } from "@/db/bootstrap";
import { settings, type NewSettingsRecord } from "@/db/schema";
import { env } from "@/lib/env";
import type { AppSettings } from "@/types/domain";

const defaultSettings: NewSettingsRecord = {
  id: "default",
  defaultQuality: "720p",
  filenameTemplate: "{title}-{date}",
  theme: "dark",
  appVersion: env.APP_VERSION,
  updatedAt: new Date().toISOString()
};

export async function getSettings(): Promise<AppSettings> {
  await ensureDatabase();
  const [record] = await db.select().from(settings).where(eq(settings.id, "default"));
  if (record) return record;
  await db.insert(settings).values(defaultSettings);
  return defaultSettings;
}

export async function updateSettings(
  input: Pick<AppSettings, "defaultQuality" | "filenameTemplate" | "theme">
) {
  await ensureDatabase();
  const record: NewSettingsRecord = {
    ...input,
    id: "default",
    appVersion: env.APP_VERSION,
    updatedAt: new Date().toISOString()
  };
  await db.insert(settings).values(record).onConflictDoUpdate({
    target: settings.id,
    set: record
  });
  return record;
}
