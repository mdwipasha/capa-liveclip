import { env } from "@shared/env";
import { LocalStorageAdapter } from "@modules/storage/adapters/local-storage-adapter";
import type { StorageAdapter } from "@modules/storage/types/storage-adapter";

export function createStorageAdapter(): StorageAdapter {
  if (env.STORAGE_PROVIDER === "local") return new LocalStorageAdapter();
  throw new Error(`${env.STORAGE_PROVIDER} storage adapter is configured but not implemented yet.`);
}
