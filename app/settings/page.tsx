import { AppShell } from "@/components/navigation/app-shell";
import { SettingsClient } from "@/features/settings/components/settings-client";

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsClient />
    </AppShell>
  );
}
