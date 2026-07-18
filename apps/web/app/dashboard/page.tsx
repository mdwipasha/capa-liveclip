import { AppShell } from "@web/components/navigation/app-shell";
import { DashboardClient } from "@web/features/clips/components/dashboard-client";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
