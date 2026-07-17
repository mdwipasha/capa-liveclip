"use client";

import { create } from "zustand";
import type { ExportQuality, StreamMetadata } from "@/types/domain";

interface ClipSessionState {
  stream?: StreamMetadata;
  startSeconds: number;
  endSeconds: number;
  quality: ExportQuality;
  setStream: (stream: StreamMetadata) => void;
  setRange: (range: [number, number]) => void;
  setQuality: (quality: ExportQuality) => void;
  reset: () => void;
}

export const useClipSession = create<ClipSessionState>((set) => ({
  startSeconds: 0,
  endSeconds: 30,
  quality: "720p",
  setStream: (stream) =>
    set({
      stream,
      startSeconds: 0,
      endSeconds: Math.min(30, Math.max(stream.durationSeconds, 30)),
      quality: stream.formats.find((format) => format.quality === "720p" && format.available)
        ? "720p"
        : "original"
    }),
  setRange: ([startSeconds, endSeconds]) => set({ startSeconds, endSeconds }),
  setQuality: (quality) => set({ quality }),
  reset: () => set({ stream: undefined, startSeconds: 0, endSeconds: 30, quality: "720p" })
}));
