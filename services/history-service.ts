import { deleteClip, listClips } from "@/server/repositories/history-repository";

export async function getClipHistory() {
  return listClips();
}

export async function removeClip(id: string) {
  await deleteClip(id);
}
