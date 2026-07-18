"use client";

import { SectionHeading } from "@web/components/section-heading";
import { Skeleton } from "@web/components/ui/skeleton";
import { useToast } from "@web/components/ui/toast";
import { useDeleteClip, useHistory } from "@web/hooks/use-liveclip-api";
import { ClipCard } from "@web/features/history/components/clip-card";

export function HistoryClient() {
  const history = useHistory();
  const remove = useDeleteClip();
  const toast = useToast();

  return (
    <div>
      <SectionHeading
        eyebrow="Clip history"
        title="Recent exports"
        description="Local clip records from this LiveClip database."
      />
      {history.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : null}
      <div className="space-y-4">
        {history.data?.clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            deleting={remove.isPending}
            onDelete={() =>
              remove.mutate(clip.id, {
                onSuccess: () => toast.show({ title: "Clip deleted", description: clip.title }),
                onError: (error) => toast.show({ title: "Delete failed", description: error.message })
              })
            }
          />
        ))}
      </div>
      {history.data?.clips.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center text-muted-foreground">
          No clips yet. Exports from the dashboard will appear here.
        </div>
      ) : null}
    </div>
  );
}
