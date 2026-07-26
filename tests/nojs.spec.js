import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("Praktika keeps every program module readable without JavaScript", async ({
  page,
}) => {
  await page.goto("/sites/praktika/");

  await expect(page.locator(".program-panel")).toHaveCount(6);
  for (const panel of await page.locator(".program-panel").all()) {
    await expect(panel).toBeVisible();
  }
  await expect(page.locator("#module-6")).toContainText(
    "Проводим финальный прогон"
  );
});

test("Temp keeps the initial schedule readable without JavaScript", async ({
  page,
}) => {
  await page.goto("/sites/temp/");

  await expect(page.locator("#schedule .schedule-row")).toHaveCount(3);
  await expect(page.locator("#schedule")).toContainText("Силовой старт");
  await expect(page.locator("#schedule")).toContainText("Мобильность");
});

test("Temp keeps every FAQ answer readable without JavaScript", async ({
  page,
}) => {
  await page.goto("/sites/temp/");

  await expect(page.locator(".faq-answer")).toHaveCount(3);
  for (const answer of await page.locator(".faq-answer").all()) {
    await expect(answer).toBeVisible();
  }
});
