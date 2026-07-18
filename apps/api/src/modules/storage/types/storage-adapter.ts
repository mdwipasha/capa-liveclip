export interface StorageObject {
  key: string;
  contentType: string;
  data: Uint8Array;
}

export interface StorageAdapter {
  put(object: StorageObject): Promise<{ url: string; key: string }>;
  get(key: string): Promise<StorageObject | null>;
  delete(key: string): Promise<void>;
}
