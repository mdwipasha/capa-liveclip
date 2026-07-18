import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@shared/env";
import type { StorageAdapter, StorageObject } from "@modules/storage/types/storage-adapter";

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly rootDir = env.LOCAL_STORAGE_DIR) {}

  async put(object: StorageObject) {
    const filePath = path.join(this.rootDir, object.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, object.data);
    return { key: object.key, url: `/storage/${object.key}` };
  }

  async get(key: string) {
    try {
      return {
        key,
        contentType: "application/octet-stream",
        data: await readFile(path.join(this.rootDir, key))
      };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    await rm(path.join(this.rootDir, key), { force: true });
  }
}
