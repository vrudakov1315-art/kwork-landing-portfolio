import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

function normalizeProjectRoot(projectRoot) {
  return projectRoot instanceof URL
    ? fileURLToPath(projectRoot)
    : path.resolve(projectRoot);
}

async function findAvailablePort() {
  const probe = createServer();

  return new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : null;

      probe.close((error) => {
        if (error) {
          reject(error);
        } else if (port === null) {
          reject(new Error("Could not allocate a preview port"));
        } else {
          resolve(port);
        }
      });
    });
  });
}

async function isOwnedServerReady(baseURL, token) {
  try {
    const response = await fetch(`${baseURL}/sites/sever/index.html`, {
      method: "HEAD",
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok && response.headers.get("x-preview-token") === token;
  } catch {
    return false;
  }
}

export async function startOwnedPreviewServer(
  projectRoot,
  requestedBaseURL = process.env.BASE_URL
) {
  if (requestedBaseURL) {
    return { baseURL: requestedBaseURL, process: null, token: null };
  }

  const normalizedRoot = normalizeProjectRoot(projectRoot);
  const port = await findAvailablePort();
  const baseURL = `http://127.0.0.1:${port}`;
  const token = randomUUID();
  const serverProcess = spawn(
    process.execPath,
    [path.join(normalizedRoot, "scripts", "serve.mjs")],
    {
      cwd: normalizedRoot,
      env: {
        ...process.env,
        PORT: String(port),
        PREVIEW_TOKEN: token,
      },
      stdio: "inherit",
    }
  );

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Preview server exited with code ${serverProcess.exitCode}`);
    }
    if (await isOwnedServerReady(baseURL, token)) {
      return { baseURL, process: serverProcess, token };
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  serverProcess.kill();
  throw new Error(`Owned preview server did not start at ${baseURL}`);
}
