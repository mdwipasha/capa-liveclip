import { createServer } from "node:http";
import { env } from "@shared/env";
import { exportController } from "@modules/clip/controller/export-controller";
import {
  deleteHistoryController,
  downloadClipController,
  listHistoryController
} from "@modules/history/controller/history-controller";
import {
  getSettingsController,
  updateSettingsController
} from "@modules/settings/controller/settings-controller";
import { connectController } from "@modules/youtube/controller/connect-controller";

async function sendWebResponse(nodeResponse: import("node:http").ServerResponse, response: Response) {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));
  if (!response.body) {
    nodeResponse.end();
    return;
  }
  const body = Buffer.from(await response.arrayBuffer());
  nodeResponse.end(body);
}

async function route(request: Request) {
  const url = new URL(request.url);
  const method = request.method;

  if (method === "GET" && url.pathname === "/api/health") {
    return Response.json({ ok: true, service: "liveclip-api" });
  }
  if (method === "POST" && url.pathname === "/api/connect") return connectController(request);
  if (method === "POST" && url.pathname === "/api/export") return exportController(request);
  if (method === "GET" && url.pathname === "/api/history") return listHistoryController();
  if (method === "GET" && url.pathname === "/api/settings") return getSettingsController();
  if (method === "PUT" && url.pathname === "/api/settings") return updateSettingsController(request);

  const historyMatch = url.pathname.match(/^\/api\/history\/([^/]+)$/);
  if (method === "DELETE" && historyMatch?.[1]) {
    return deleteHistoryController(decodeURIComponent(historyMatch[1]));
  }

  const downloadMatch = url.pathname.match(/^\/api\/download\/([^/]+)$/);
  if (method === "GET" && downloadMatch?.[1]) {
    return downloadClipController(request, decodeURIComponent(downloadMatch[1]));
  }

  return Response.json({ ok: false, error: { code: "NOT_FOUND", message: "Route not found." } }, { status: 404 });
}

const server = createServer(async (nodeRequest, nodeResponse) => {
  const chunks: Buffer[] = [];
  for await (const chunk of nodeRequest) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const origin = `http://${nodeRequest.headers.host ?? `${env.API_HOST}:${env.API_PORT}`}`;
  const request = new Request(new URL(nodeRequest.url ?? "/", origin), {
    method: nodeRequest.method,
    headers: nodeRequest.headers as HeadersInit,
    body: chunks.length > 0 ? Buffer.concat(chunks) : undefined
  });

  try {
    await sendWebResponse(nodeResponse, await route(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown API error.";
    await sendWebResponse(
      nodeResponse,
      Response.json({ ok: false, error: { code: "UNKNOWN_ERROR", message } }, { status: 500 })
    );
  }
});

server.listen(env.API_PORT, env.API_HOST, () => {
  console.log(`LiveClip API listening on http://${env.API_HOST}:${env.API_PORT}`);
});
