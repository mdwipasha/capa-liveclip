import Image from "next/image";
import { BadgeCheck, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StreamMetadata } from "@/types/domain";
import { formatDuration } from "@/utils/time";

export function MetadataCard({ stream }: { stream: StreamMetadata }) {
  const stats = [
    ["Status", stream.liveStatus],
    ["Duration", stream.durationSeconds ? formatDuration(stream.durationSeconds) : "Live window"],
    ["Resolution", stream.resolution],
    ["Video", stream.videoCodec],
    ["Audio", stream.audioCodec]
  ];
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image src={stream.thumbnailUrl} alt="" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs backdrop-blur">
          <Radio className="h-3.5 w-3.5 text-primary" />
          {stream.liveStatus}
        </div>
      </div>
      <CardContent className="pt-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">{stream.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            {stream.channelName}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 truncate text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
