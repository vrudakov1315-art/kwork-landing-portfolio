import { expect, test } from "@playwright/test";
import { startOwnedPreviewServer } from "../scripts/capture-server.mjs";

const projectRoot = new URL("..", import.meta.url);

test("capture starts and verifies a dedicated preview server by default", async ({
  request,
}) => {
  const preview = await startOwnedPreviewServer(projectRoot);

  try {
    expect(preview.baseURL).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect(preview.baseURL).not.toBe("http://127.0.0.1:4173");
    expect(preview.process).not.toBeNull();

    const response = await request.head(
      `${preview.baseURL}/sites/sever/index.html`
    );
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["x-preview-token"]).toBe(preview.token);
  } finally {
    preview.process?.kill();
  }
});

test("capture respects an explicitly supplied BASE_URL without owning it", async () => {
  const preview = await startOwnedPreviewServer(
    projectRoot,
    "http://127.0.0.1:4999"
  );

  expect(preview).toEqual({
    baseURL: "http://127.0.0.1:4999",
    process: null,
    token: null,
  });
});
