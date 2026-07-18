"use client";

import Image from "next/image";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import type { ClipHistoryItem } from "@shared/domain";
import { formatDuration } from "@shared/time";

export function ClipCard({
  clip,
  deleting,
  onDelete
}: {
  clip: ClipHistoryItem;
  deleting?: boolean;
  onDelete: () => void;
}) {
  return (
    <Card className="grid gap-4 p-4 md:grid-cols-[180px_1fr_auto]">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black/30 md:aspect-auto">
        <Image src={clip.thumbnailUrl} alt="" fill className="object-cover" sizes="180px" />
      </div>
      <div className="min-w-0 self-center">
        <h3 className="truncate font-semibold">{clip.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{clip.channelName}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {formatDuration(clip.durationSeconds)} · {clip.resolution} · {new Date(clip.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2 md:flex-col md:justify-center">
        <Button asChild variant="secondary" size="sm">
          <a href={clip.downloadUrl}>
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
        <Button variant="ghost" size="icon" loading={deleting} onClick={onDelete} aria-label="Delete clip">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
