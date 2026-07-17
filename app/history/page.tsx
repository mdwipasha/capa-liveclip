import { AppShell } from "@/components/navigation/app-shell";
import { HistoryClient } from "@/features/history/components/history-client";

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryClient />
    </AppShell>
  );
}
