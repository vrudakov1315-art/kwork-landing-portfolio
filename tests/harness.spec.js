import { test, expect } from "@playwright/test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitesDirectory = path.join(projectDirectory, "sites");

test("returns 404 for missing files", async ({ request }) => {
  const response = await request.get("/missing.html");
  expect(response.status()).toBe(404);
});

test("rejects path traversal", async ({ request }) => {
  const response = await request.get("/%2e%2e/%2e%2e/package.json");
  expect([400, 403, 404]).toContain(response.status());
});

test("rejects symbolic links that escape the public root", async ({ request }) => {
  await mkdir(sitesDirectory, { recursive: true });
  const publicTestDirectory = await mkdtemp(path.join(sitesDirectory, ".symlink-security-"));
  const outsideDirectory = await mkdtemp(path.join(tmpdir(), "kwork-outside-"));
  const outsideFile = path.join(outsideDirectory, "secret.txt");
  const publicLink = path.join(publicTestDirectory, "secret.txt");

  try {
    await writeFile(outsideFile, "must not be public");
    await symlink(outsideFile, publicLink, "file");

    const response = await request.get(
      `/sites/${path.basename(publicTestDirectory)}/secret.txt`
    );

    expect([400, 403, 404]).toContain(response.status());
  } finally {
    await rm(publicTestDirectory, { recursive: true, force: true });
    await rm(outsideDirectory, { recursive: true, force: true });
  }
});
