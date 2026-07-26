import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "logos");

const logos = [
  { slug: "sever", selector: ".site-header .brand" },
  { slug: "forma", selector: ".site-header .brand" },
  { slug: "praktika", selector: ".site-header .brand" },
  {
    slug: "temp",
    selector: ".site-header .logo",
    standalone: `
      <!doctype html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8" />
          <style>
            :root {
              --ink: #0a0b09;
              --acid: #c8ff3d;
              --paper: #f0f2e9;
              --display: "Arial Black", "Arial Narrow", Impact, sans-serif;
            }
            * { box-sizing: border-box; }
            html, body { margin: 0; background: transparent; }
            .logo {
              display: inline-flex;
              align-items: center;
              color: var(--paper);
              font-family: var(--display);
              font-size: 21.6px;
              letter-spacing: -0.05em;
              line-height: 1.5;
              text-decoration: none;
            }
            .logo span {
              display: inline-grid;
              width: 1.55em;
              height: 1.55em;
              margin-right: 0.2em;
              place-items: center;
              background: var(--acid);
              color: var(--ink);
              clip-path: polygon(15% 0, 100% 0, 85% 100%, 0 100%);
            }
          </style>
        </head>
        <body>
          <header class="site-header">
            <a class="logo"><span>Т</span>ЕМП</a>
          </header>
        </body>
      </html>
    `,
  },
  { slug: "puls", selector: ".site-header .brand" },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: 4,
  viewport: { width: 1440, height: 900 },
});

try {
  for (const logo of logos) {
    const page = await context.newPage();
    const pageUrl = pathToFileURL(
      path.join(root, "sites", logo.slug, "index.html"),
    ).href;

    if (logo.standalone) {
      await page.setContent(logo.standalone);
    } else {
      await page.goto(pageUrl);
    }
    await page.addStyleTag({
      content: `
        html, body, .site-header {
          background: transparent !important;
        }
        .site-header {
          position: static !important;
          display: block !important;
          min-height: 0 !important;
          padding: 0 !important;
          border: 0 !important;
        }
        .site-header > * {
          display: none !important;
        }
        ${logo.selector} {
          display: inline-flex !important;
          box-sizing: content-box !important;
          margin: 0 !important;
          padding: 14px !important;
          border: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
        }
      `,
    });

    const mark = page.locator(logo.selector).first();
    await mark.waitFor();
    await mark.screenshot({
      path: path.join(outputDir, `${logo.slug}.png`),
      omitBackground: true,
      animations: "disabled",
    });

    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Exported ${logos.length} logos to ${outputDir}`);
