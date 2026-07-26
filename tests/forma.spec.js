import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/sites/forma/");
});

test("labels the page as a demonstration concept for visitors", async ({
  page
}) => {
  await expect(
    page.getByText("Демонстрационный концепт", { exact: true })
  ).toBeVisible();
});

test("contains the specified seven semantic content sections", async ({ page }) => {
  await expect(page.locator("main > section")).toHaveCount(7);
});

test("rejects an area below the supported 10 m² minimum", async ({ page }) => {
  await page.locator("#area").fill("0");
  await page.locator("#estimate button[type=submit]").click();

  await expect(page.locator("#estimate-result")).toContainText(
    "Укажите площадь от 10 до 500 м²"
  );
});

test("calculates a 50 m² capital renovation as 1 600 000 ₽", async ({
  page
}) => {
  await page.locator("#area").fill("50");
  await page.locator("#repair-type").selectOption("capital");
  await page.locator("#estimate button[type=submit]").click();

  await expect(page.locator("#estimate-result")).toHaveText(
    "Предварительная стоимость 1 600 000 ₽"
  );
});

test("updates an existing estimate when the renovation type changes", async ({
  page
}) => {
  await page.locator("#area").fill("50");
  await page.locator("#repair-type").selectOption("cosmetic");
  await page.locator("#estimate button[type=submit]").click();
  await expect(page.locator("#estimate-result")).toHaveText(
    "Предварительная стоимость 900 000 ₽"
  );

  await page.locator("#repair-type").selectOption("design");

  await expect(page.locator("#estimate-result")).toHaveText(
    "Предварительная стоимость 2 400 000 ₽"
  );
});

test("handles the consultation request locally without a network request", async ({
  page
}) => {
  await page.locator("#contact-form [name=name]").fill("Анна");
  await page
    .locator("#contact-form [name=contact]")
    .fill("+7 999 123-45-67");

  const outboundRequests = [];
  page.on("request", (request) => outboundRequests.push(request.url()));
  await page.locator("#contact-form button[type=submit]").click();
  await page.waitForTimeout(200);

  await expect(page.locator("#contact-form [role=status]")).toHaveText(
    "Заявка принята в демонстрационном режиме"
  );
  expect(outboundRequests).toEqual([]);
});

test("keeps the hero heading inside the 375 px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });

  const heading = page.locator(".hero h1");
  const { clientWidth, scrollWidth } = await heading.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth
  }));

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
