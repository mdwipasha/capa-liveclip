import { AppShell } from "@web/components/navigation/app-shell";
import { SettingsClient } from "@web/features/settings/components/settings-client";

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsClient />
    </AppShell>
  );
}
