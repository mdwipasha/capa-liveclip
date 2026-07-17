import { deleteClip, getClip, listClips } from "@/server/repositories/history-repository";

export async function getClipHistory() {
  return listClips();
}

export async function getClipById(id: string) {
  return getClip(id);
}

export async function removeClip(id: string) {
  await deleteClip(id);
}
