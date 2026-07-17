"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AppSettings, ClipHistoryItem, ExportResult, StreamMetadata } from "@/types/domain";
import type { ExportRequest, SettingsUpdateRequest } from "@/lib/validation";

export function useConnectStream() {
  return useMutation({
    mutationFn: (url: string) => apiClient.post<StreamMetadata>("/api/connect", { url })
  });
}

export function useExportClip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExportRequest) => apiClient.post<ExportResult>("/api/export", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] })
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: () => apiClient.get<{ clips: ClipHistoryItem[] }>("/api/history")
  });
}

export function useDeleteClip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/api/history/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] })
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiClient.get<{ settings: AppSettings }>("/api/settings")
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsUpdateRequest) =>
      apiClient.put<{ settings: AppSettings }>("/api/settings", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });
}
