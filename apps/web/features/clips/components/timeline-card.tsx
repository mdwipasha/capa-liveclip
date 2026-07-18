"use client";

import { Scissors } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Slider } from "@web/components/ui/slider";
import { secondsToTimestamp, timestampToSeconds } from "@shared/time";

export function TimelineCard({
  duration,
  start,
  end,
  onChange
}: {
  duration: number;
  start: number;
  end: number;
  onChange: (range: [number, number]) => void;
}) {
  const max = Math.max(duration || 3600, 60);
  const update = (next: [number, number]) => {
    const sorted: [number, number] = [Math.min(next[0], next[1] - 1), Math.max(next[1], next[0] + 1)];
    onChange([Math.max(0, sorted[0]), Math.min(max, sorted[1])]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Slider value={[start, end]} min={0} max={max} step={1} onValueChange={(value) => update([value[0], value[1]])} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{secondsToTimestamp(start)}</span>
          <span>{secondsToTimestamp(end)}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Start</Label>
            <Input value={secondsToTimestamp(start)} onChange={(event) => update([timestampToSeconds(event.target.value), end])} />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input value={secondsToTimestamp(end)} onChange={(event) => update([start, timestampToSeconds(event.target.value)])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
