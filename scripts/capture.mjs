import { chromium } from "@playwright/test";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startOwnedPreviewServer } from "./capture-server.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugs = ["sever", "forma", "praktika", "temp", "puls"];
const maxImageSize = 10 * 1024 * 1024;

async function preparePage(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
    `
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) {
      image.loading = "eager";
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await Promise.all(
      [...document.images].map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }
        if (image.complete && image.naturalWidth > 0) {
          await image.decode().catch(() => {});
        }
      })
    );
    window.scrollTo(0, 0);
  });
}

async function assertImageLimit(filePath) {
  const imageStat = await stat(filePath);
  if (imageStat.size === 0 || imageStat.size >= maxImageSize) {
    throw new Error(
      `${path.relative(projectRoot, filePath)}: expected 1–${maxImageSize - 1} bytes, got ${imageStat.size}`
    );
  }
}

const preview = await startOwnedPreviewServer(projectRoot);
const { baseURL } = preview;
const serverProcess = preview.process;
let browser;

try {
  browser = await chromium.launch();

  for (const slug of slugs) {
    console.log(`Capturing ${slug}...`);
    const outputDirectory = path.join(projectRoot, "sites", slug, "kwork");
    await mkdir(outputDirectory, { recursive: true });

    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 1000 }
    });
    const page = await context.newPage();

    const desktopPath = path.join(outputDirectory, "desktop.jpg");
    await preparePage(page, `${baseURL}/sites/${slug}/index.html`);
    await page.screenshot({
      path: desktopPath,
      type: "jpeg",
      quality: 86,
      fullPage: true
    });

    await page.setViewportSize({ width: 390, height: 844 });
    const mobilePath = path.join(outputDirectory, "mobile.jpg");
    await preparePage(page, `${baseURL}/sites/${slug}/index.html`);
    await page.screenshot({
      path: mobilePath,
      type: "jpeg",
      quality: 86,
      fullPage: true
    });

    await page.setViewportSize({ width: 1920, height: 1280 });
    const coverPath = path.join(outputDirectory, "cover.jpg");
    await preparePage(page, `${baseURL}/sites/${slug}/kwork/cover.html`);
    await page.screenshot({
      path: coverPath,
      type: "jpeg",
      quality: 90
    });

    await Promise.all(
      [desktopPath, mobilePath, coverPath].map((filePath) => assertImageLimit(filePath))
    );
    await context.close();
    console.log(`Captured ${slug}`);
  }
} finally {
  await browser?.close();
  serverProcess?.kill();
}
