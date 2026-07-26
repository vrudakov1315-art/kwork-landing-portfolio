import { test, expect } from "@playwright/test";
import { assertNoHorizontalOverflow } from "./helpers.js";

const PAGE_URL = "/sites/temp/";

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL);
});

test("presents the Temp training offer as a demonstration concept", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Тренируйся в своём темпе",
    })
  ).toBeVisible();
  await expect(
    page.getByText("Демонстрационный концепт", { exact: true })
  ).toBeVisible();
});

test("switches from gym sessions to the online schedule", async ({ page }) => {
  const modeSwitcher = page.locator("[data-training-mode]");
  const gymMode = modeSwitcher.getByRole("button", { name: "В зале" });
  const onlineMode = modeSwitcher.getByRole("button", { name: "Онлайн" });

  await expect(gymMode).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#schedule")).toContainText("Силовой старт");

  await onlineMode.click();

  await expect(gymMode).toHaveAttribute("aria-pressed", "false");
  await expect(onlineMode).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#schedule")).toContainText("Мобилити live");
  await expect(page.locator("#schedule")).not.toContainText("Силовой старт");
});

test("opens one FAQ answer at a time", async ({ page }) => {
  const firstQuestion = page.getByRole("button", {
    name: "Подойдёт ли мне, если я только начинаю?",
  });
  const secondQuestion = page.getByRole("button", {
    name: "Что нужно для онлайн-тренировки?",
  });

  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".faq-item").nth(0).locator(".faq-answer")).toBeVisible();

  await secondQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
});

test("confirms a valid demonstration training request locally", async ({
  page,
}) => {
  const outboundRequests = [];
  page.on("request", (request) => outboundRequests.push(request.url()));

  await page.locator("#training-form [name=name]").fill("Анна");
  await page
    .locator("#training-form [name=contact]")
    .fill("+7 999 123-45-67");
  await page.locator('#training-form button[type="submit"]').click();
  await page.waitForTimeout(100);

  await expect(page.locator("#training-form [role=status]")).toHaveText(
    "Запись принята в демонстрационном режиме"
  );
  expect(outboundRequests).toEqual([]);
});

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps core controls usable without horizontal overflow", async ({
    page,
  }) => {
    await expect(page.locator("[data-training-mode]")).toBeVisible();
    await expect(page.locator("#training-form")).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
