import { AppShell } from "@web/components/navigation/app-shell";
import { HistoryClient } from "@web/features/history/components/history-client";

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryClient />
    </AppShell>
  );
}
