export function extractYouTubeId(input: string) {
  const url = new URL(input);
  if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] ?? "";
  if (url.pathname === "/watch") return url.searchParams.get("v") ?? "";
  if (url.pathname.startsWith("/live/")) return url.pathname.split("/").filter(Boolean)[1] ?? "";
  if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/").filter(Boolean)[1] ?? "";
  return url.searchParams.get("v") ?? "";
}
