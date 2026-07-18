import Link from "next/link";
import { Button } from "@web/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-3 text-4xl font-semibold">That clip frame is missing.</h1>
        <p className="mt-4 text-muted-foreground">The page does not exist or the route has moved.</p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
