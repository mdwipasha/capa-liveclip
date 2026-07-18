import { AppSidebar } from "@web/components/navigation/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-shell flex gap-6">
      <AppSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </main>
  );
}
