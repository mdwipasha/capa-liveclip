import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ExportQuality } from "@shared/domain";

export const clips = sqliteTable("clips", {
  id: text("id").primaryKey(),
  streamId: text("stream_id").notNull(),
  sourceUrl: text("source_url").notNull(),
  title: text("title").notNull(),
  channelName: text("channel_name").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  startSeconds: integer("start_seconds").notNull(),
  endSeconds: integer("end_seconds").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  resolution: text("resolution").notNull(),
  quality: text("quality").$type<ExportQuality>().notNull(),
  outputFilename: text("output_filename").notNull(),
  downloadUrl: text("download_url").notNull(),
  createdAt: text("created_at").notNull()
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  defaultQuality: text("default_quality").$type<ExportQuality>().notNull(),
  filenameTemplate: text("filename_template").notNull(),
  theme: text("theme").$type<"dark">().notNull(),
  appVersion: text("app_version").notNull(),
  updatedAt: text("updated_at").notNull()
});

export type ClipRecord = typeof clips.$inferSelect;
export type NewClipRecord = typeof clips.$inferInsert;
export type SettingsRecord = typeof settings.$inferSelect;
export type NewSettingsRecord = typeof settings.$inferInsert;
