"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, WandSparkles } from "lucide-react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select";
import type { ClipHistoryItem, ExportQuality, StreamMetadata } from "@shared/domain";
import { formatDuration } from "@shared/time";

const QUALITY_EXPORT_SECONDS_PER_CLIP_SECOND: Record<ExportQuality, number> = {
  original: 0.55,
  "480p": 0.75,
  "720p": 1,
  "1080p": 1.35,
  "2k": 2.15,
  "4k": 3.5
};

function estimateExportSeconds(durationSeconds: number, quality: ExportQuality) {
  const multiplier = QUALITY_EXPORT_SECONDS_PER_CLIP_SECOND[quality] ?? 1.25;
  return Math.max(10, Math.ceil(8 + durationSeconds * multiplier));
}

function exportPhase(progress: number) {
  if (progress < 18) return "Resolving media stream";
  if (progress < 48) return "Downloading selected range";
  if (progress < 88) return "Encoding MP4";
  return "Finalizing clip";
}

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
  const durationSeconds = Math.max(0, end - start);
  const estimatedSeconds = useMemo(
    () => estimateExportSeconds(durationSeconds, quality),
    [durationSeconds, quality]
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!exporting) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);

    return () => window.clearInterval(interval);
  }, [exporting]);

  const estimatedProgress = exporting
    ? Math.min(96, Math.max(6, Math.round((elapsedSeconds / estimatedSeconds) * 100)))
    : 0;
  const remainingSeconds = Math.max(0, estimatedSeconds - elapsedSeconds);

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
        {exporting ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{exportPhase(estimatedProgress)}</span>
              <span>{estimatedProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${estimatedProgress}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Estimated time left: {remainingSeconds > 0 ? formatDuration(remainingSeconds) : "almost done"}. Actual
              time depends on YouTube speed, clip length, and selected quality.
            </p>
          </div>
        ) : null}
        {clip ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <p className="text-sm font-medium">Clip ready</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDuration(clip.durationSeconds)} - {clip.resolution} - {new Date(clip.createdAt).toLocaleString()}
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
            Selected range: {formatDuration(durationSeconds)}. Estimated export: {formatDuration(estimatedSeconds)}.
            Lower quality and shorter ranges finish faster.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
