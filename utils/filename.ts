import type { StreamMetadata } from "@/types/domain";

const unsafePattern = /[^a-z0-9-_ .]/gi;

export function sanitizeFilename(value: string) {
  return value.replace(unsafePattern, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export function renderFilenameTemplate(
  template: string,
  stream: Pick<StreamMetadata, "title" | "channelName">,
  createdAt = new Date()
) {
  const date = createdAt.toISOString().slice(0, 10);
  const rendered = template
    .replaceAll("{title}", stream.title)
    .replaceAll("{channel}", stream.channelName)
    .replaceAll("{date}", date);
  return `${sanitizeFilename(rendered) || "liveclip"}.mp4`;
}
