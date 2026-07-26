import { test, expect } from "@playwright/test";
import { assertNoHorizontalOverflow } from "./helpers.js";

const PAGE_URL = "/sites/puls/index.html";

async function openPuls(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(PAGE_URL);
  expect(response?.ok()).toBeTruthy();
  return errors;
}

test("presents the complete Puls product concept with a local interface mockup", async ({
  page,
}) => {
  const errors = await openPuls(page);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Все процессы команды — в одном ритме",
    })
  ).toBeVisible();
  await expect(
    page.getByText("Демонстрационный концепт", { exact: true })
  ).toBeVisible();
  await expect(page.locator("main > section")).toHaveCount(7);
  await expect(page.locator("[data-product-preview]")).toBeVisible();
  await expect(page.locator("#faq details")).toHaveCount(4);
  await expect
    .poll(() =>
      page
        .locator('img[src^="./assets/"]')
        .first()
        .evaluate((image) => image.naturalWidth)
    )
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("keeps decorative product-preview controls out of keyboard navigation", async ({
  page,
}) => {
  await openPuls(page);

  await expect(page.locator("[data-product-preview] button")).toHaveCount(0);
});

test("switches all three plans between monthly and annual monthly-equivalent prices", async ({
  page,
}) => {
  const errors = await openPuls(page);
  const plans = page.locator("[data-plan]");

  await expect(plans).toHaveCount(3);
  await expect(page.locator('[data-billing="monthly"]')).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(plans.locator("[data-price]").allTextContents()).resolves.toEqual([
    "990",
    "2 490",
    "4 990",
  ]);

  await page.locator('[data-billing="yearly"]').click();

  await expect(page.locator('[data-billing="yearly"]')).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(plans.locator("[data-price]").allTextContents()).resolves.toEqual([
    "790",
    "1 990",
    "3 990",
  ]);
  await expect(page.locator("[data-billing-note]")).toHaveText(
    "Цена за месяц при оплате за год"
  );
  expect(errors).toEqual([]);
});

test("keeps billing selection in the DOM and resets it after reload", async ({
  page,
}) => {
  await openPuls(page);
  await page.locator('[data-billing="yearly"]').click();
  await page.reload();

  await expect(page.locator('[data-billing="monthly"]')).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.locator("[data-plan] [data-price]").first()).toHaveText(
    "990"
  );
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("validates and confirms the demonstration access form locally", async ({
  page,
}) => {
  const errors = await openPuls(page);
  const form = page.locator("#access-form");

  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[role=alert]")).toHaveText(
    "Укажите имя и рабочую почту"
  );

  const outboundRequests = [];
  page.on("request", (request) => outboundRequests.push(request.url()));
  await form.locator("[name=name]").fill("Анна");
  await form.locator("[name=email]").fill("anna@example.com");
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(100);

  await expect(form.locator("[role=status]")).toHaveText(
    "Доступ открыт в демонстрационном режиме"
  );
  expect(outboundRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("fits the product and pricing content at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await openPuls(page);

  await expect(page.locator("[data-product-preview]")).toBeVisible();
  await expect(page.locator("[data-plan]")).toHaveCount(3);
  await assertNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("keeps the decorative hero layer inside every required audit width", async ({
  page,
}) => {
  for (const width of [375, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(PAGE_URL);
    await assertNoHorizontalOverflow(page);
  }
});
