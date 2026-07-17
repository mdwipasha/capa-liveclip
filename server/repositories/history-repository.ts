import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ensureDatabase } from "@/db/bootstrap";
import { clips, type NewClipRecord } from "@/db/schema";

export async function listClips() {
  await ensureDatabase();
  return db.select().from(clips).orderBy(desc(clips.createdAt));
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
