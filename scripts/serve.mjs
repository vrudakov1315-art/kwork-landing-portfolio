import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = path.join(rootDirectory, "sites");
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const previewToken = process.env.PREVIEW_TOKEN;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function resolveRequestPath(requestUrl) {
  const rawPathname = requestUrl.split("?", 1)[0];
  const pathname = decodeURIComponent(rawPathname);
  const relativePath = pathname.replace(/^[/\\]+/, "");
  const candidate = path.resolve(rootDirectory, relativePath);
  const relativeToRoot = path.relative(rootDirectory, candidate);
  const relativeToPublicDirectory = path.relative(publicDirectory, candidate);

  if (
    relativeToRoot === ".." ||
    relativeToRoot.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToRoot) ||
    relativeToPublicDirectory === ".." ||
    relativeToPublicDirectory.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToPublicDirectory)
  ) {
    return null;
  }

  return pathname.endsWith("/") ? path.join(candidate, "index.html") : candidate;
}

async function sendFile(request, response) {
  let filePath;

  try {
    filePath = resolveRequestPath(request.url || "/");
  } catch {
    response.writeHead(400).end();
    return;
  }

  if (!filePath) {
    response.writeHead(404).end();
    return;
  }

  try {
    const [canonicalPublicDirectory, canonicalFilePath] = await Promise.all([
      realpath(publicDirectory),
      realpath(filePath)
    ]);
    const relativeCanonicalPath = path.relative(canonicalPublicDirectory, canonicalFilePath);

    if (
      relativeCanonicalPath === ".." ||
      relativeCanonicalPath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeCanonicalPath)
    ) {
      response.writeHead(404).end();
      return;
    }

    const fileStat = await stat(canonicalFilePath);
    if (!fileStat.isFile()) {
      response.writeHead(404).end();
      return;
    }

    const body = await readFile(canonicalFilePath);
    const headers = {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    };
    if (previewToken) headers["X-Preview-Token"] = previewToken;

    response.writeHead(200, headers);
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(500).end();
  }
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  void sendFile(request, response);
});

server.listen(port, host);
