"use client";

import { Download, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClipHistoryItem, ExportQuality, StreamMetadata } from "@/types/domain";
import { formatDuration } from "@/utils/time";

export function ExportCard({
  stream,
  quality,
  start,
  end,
  clip,
  exporting,
  onQualityChange,
  onExport
}: {
  stream: StreamMetadata;
  quality: ExportQuality;
  start: number;
  end: number;
  clip?: ClipHistoryItem;
  exporting: boolean;
  onQualityChange: (quality: ExportQuality) => void;
  onExport: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Select value={quality} onValueChange={(value) => onQualityChange(value as ExportQuality)}>
          <SelectTrigger>
            <SelectValue placeholder="Quality" />
          </SelectTrigger>
          <SelectContent>
            {stream.formats.map((format) => (
              <SelectItem key={format.quality} value={format.quality} disabled={!format.available}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="w-full" loading={exporting} onClick={onExport}>
          <WandSparkles className="h-4 w-4" />
          Generate MP4
        </Button>
        {clip ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <p className="text-sm font-medium">Clip ready</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDuration(clip.durationSeconds)} · {clip.resolution} · {new Date(clip.createdAt).toLocaleString()}
            </p>
            <Button asChild className="mt-4 w-full" variant="secondary">
              <a href={clip.downloadUrl}>
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Selected range: {formatDuration(Math.max(0, end - start))}. Short clips export faster on Vercel.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
