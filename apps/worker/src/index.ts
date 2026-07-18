import { env } from "@shared/env";

async function main() {
  console.log(`LiveClip worker started with ${env.QUEUE_ADAPTER} queue adapter.`);
  console.log(`Polling every ${env.WORKER_POLL_INTERVAL_MS}ms.`);
}

void main();
