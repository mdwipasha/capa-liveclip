import { desc, eq } from "drizzle-orm";
import { db } from "@database/client";
import { ensureDatabase } from "@database/bootstrap";
import { clips, type NewClipRecord } from "@database/schema";

export async function listClips() {
  await ensureDatabase();
  return db.select().from(clips).orderBy(desc(clips.createdAt));
}

export async function getClip(id: string) {
  await ensureDatabase();
  const [clip] = await db.select().from(clips).where(eq(clips.id, id));
  return clip;
}

export async function createClip(record: NewClipRecord) {
  await ensureDatabase();
  await db.insert(clips).values(record);
  return record;
}

export async function deleteClip(id: string) {
  await ensureDatabase();
  await db.delete(clips).where(eq(clips.id, id));
}
