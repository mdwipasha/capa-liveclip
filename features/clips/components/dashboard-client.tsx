"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { SectionHeading } from "@/components/section-heading";
import { useConnectStream, useExportClip } from "@/hooks/use-liveclip-api";
import { useClipSession } from "@/features/clips/store/clip-session-store";
import { MetadataCard } from "@/features/clips/components/metadata-card";
import { TimelineCard } from "@/features/clips/components/timeline-card";
import { PreviewCard } from "@/features/clips/components/preview-card";
import { ExportCard } from "@/features/clips/components/export-card";

export function DashboardClient() {
  const [url, setUrl] = useState("");
  const [latestClipId, setLatestClipId] = useState<string>();
  const toast = useToast();
  const connect = useConnectStream();
  const exportClip = useExportClip();
  const { stream, startSeconds, endSeconds, quality, setStream, setRange, setQuality } = useClipSession();
  const latestClip =
    exportClip.data && exportClip.data.clip.id === latestClipId ? exportClip.data.clip : undefined;

  const handleConnect = () => {
    connect.mutate(url, {
      onSuccess: (data) => {
        setStream(data);
        toast.show({ title: "Stream connected", description: data.title });
      },
      onError: (error) => toast.show({ title: "Connection failed", description: error.message })
    });
  };

  const handleExport = () => {
    if (!stream) return;
    exportClip.mutate(
      { stream, startSeconds, endSeconds, quality },
      {
        onSuccess: (data) => {
          setLatestClipId(data.clip.id);
          toast.show({ title: "Clip ready", description: data.clip.outputFilename });
        },
        onError: (error) => toast.show({ title: "Export failed", description: error.message })
      }
    );
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Clip workspace"
        title="Turn a livestream moment into an MP4."
        description="Connect a YouTube Live URL, select the exact window, and export a short clip."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Connect stream
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            onKeyDown={(event) => event.key === "Enter" && handleConnect()}
          />
          <Button loading={connect.isPending} onClick={handleConnect} className="md:w-40">
            Connect
          </Button>
        </CardContent>
      </Card>

      {connect.isPending ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[520px]" />
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : null}

      {stream && !connect.isPending ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="space-y-6">
            <MetadataCard stream={stream} />
            <TimelineCard
              duration={stream.durationSeconds}
              start={startSeconds}
              end={endSeconds}
              onChange={setRange}
            />
          </div>
          <div className="space-y-6">
            <PreviewCard imageUrl={stream.previewImageUrl} />
            <ExportCard
              stream={stream}
              quality={quality}
              start={startSeconds}
              end={endSeconds}
              clip={latestClip}
              exporting={exportClip.isPending}
              onQualityChange={setQuality}
              onExport={handleExport}
            />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
