"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { SectionHeading } from "@web/components/section-heading";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select";
import { Skeleton } from "@web/components/ui/skeleton";
import { useToast } from "@web/components/ui/toast";
import { useSettings, useUpdateSettings } from "@web/hooks/use-liveclip-api";
import type { ExportQuality } from "@shared/domain";

export function SettingsClient() {
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();
  const toast = useToast();
  const [defaultQuality, setDefaultQuality] = useState<ExportQuality>("720p");
  const [filenameTemplate, setFilenameTemplate] = useState("{title}-{date}");

  useEffect(() => {
    if (!settingsQuery.data?.settings) return;
    setDefaultQuality(settingsQuery.data.settings.defaultQuality);
    setFilenameTemplate(settingsQuery.data.settings.filenameTemplate);
  }, [settingsQuery.data?.settings]);

  const settings = settingsQuery.data?.settings;

  return (
    <div>
      <SectionHeading
        eyebrow="Settings"
        title="Application defaults"
        description="Tune export defaults now. Theme switching is reserved for a future release."
      />
      {settingsQuery.isLoading ? <Skeleton className="h-96" /> : null}
      {settings ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Export preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Default export quality</Label>
              <Select value={defaultQuality} onValueChange={(value) => setDefaultQuality(value as ExportQuality)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                  <SelectItem value="2k">2K</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Output filename template</Label>
              <Input value={filenameTemplate} onChange={(event) => setFilenameTemplate(event.target.value)} />
              <p className="text-xs text-muted-foreground">Available tokens: {"{title}"}, {"{channel}"}, {"{date}"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-muted-foreground">Theme</p>
                <p className="mt-1 font-medium">Dark</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="mt-1 font-medium">{settings.appVersion}</p>
              </div>
            </div>
            <Button
              loading={updateSettings.isPending}
              onClick={() =>
                updateSettings.mutate(
                  { defaultQuality, filenameTemplate, theme: "dark" },
                  {
                    onSuccess: () => toast.show({ title: "Settings saved" }),
                    onError: (error) => toast.show({ title: "Save failed", description: error.message })
                  }
                )
              }
            >
              <Save className="h-4 w-4" />
              Save settings
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
