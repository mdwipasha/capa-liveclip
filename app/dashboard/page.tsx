import { AppShell } from "@/components/navigation/app-shell";
import { DashboardClient } from "@/features/clips/components/dashboard-client";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
