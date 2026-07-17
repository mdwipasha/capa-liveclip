import { z } from "zod";

const youtubeHostPattern = /(^|\.)((youtube\.com)|(youtu\.be))$/i;

export const exportQualitySchema = z.enum(["original", "1080p", "720p", "480p"]);

export const youtubeUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid YouTube Live URL.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return youtubeHostPattern.test(url.hostname);
    } catch {
      return false;
    }
  }, "Only YouTube URLs are supported in this MVP.");

export const connectRequestSchema = z.object({
  url: youtubeUrlSchema
});

export const exportRequestSchema = z
  .object({
    stream: z.object({
      id: z.string().min(1),
      url: youtubeUrlSchema,
      title: z.string().min(1),
      channelName: z.string().min(1),
      thumbnailUrl: z.string().url(),
      liveStatus: z.enum(["live", "upcoming", "ended", "unknown"]),
      durationSeconds: z.number().int().nonnegative(),
      resolution: z.string().min(1),
      videoCodec: z.string().min(1),
      audioCodec: z.string().min(1),
      previewImageUrl: z.string().url(),
      formats: z.array(
        z.object({
          quality: exportQualitySchema,
          label: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
          available: z.boolean()
        })
      )
    }),
    startSeconds: z.number().int().nonnegative(),
    endSeconds: z.number().int().positive(),
    quality: exportQualitySchema
  })
  .refine((input) => input.endSeconds > input.startSeconds, {
    message: "End time must be after start time.",
    path: ["endSeconds"]
  });

export const settingsUpdateSchema = z.object({
  defaultQuality: exportQualitySchema,
  filenameTemplate: z.string().trim().min(3).max(120),
  theme: z.literal("dark")
});

export const historyDeleteSchema = z.object({
  id: z.string().min(1)
});

export type ConnectRequest = z.infer<typeof connectRequestSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
export type SettingsUpdateRequest = z.infer<typeof settingsUpdateSchema>;
