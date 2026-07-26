import { expect, test } from "@playwright/test";
import { assertNoHorizontalOverflow } from "./helpers.js";

const slugs = ["sever", "forma", "praktika", "temp", "puls"];
const widths = [375, 768, 1280, 1440];

for (const slug of slugs) {
  for (const width of widths) {
    test(`${slug}: ${width}px viewport keeps its heading and page in bounds`, async ({
      page,
    }) => {
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 1000 });

      const response = await page.goto(`/sites/${slug}/`);
      expect(response?.ok()).toBeTruthy();
      await assertNoHorizontalOverflow(page);

      const textBounds = await page.locator("h1").evaluate((heading) => {
        const range = document.createRange();
        range.selectNodeContents(heading);
        const bounds = range.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right };
      });

      expect(textBounds.left).toBeGreaterThanOrEqual(0);
      expect(textBounds.right).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);
    });
  }
}
