import { test, expect } from "@playwright/test";
import { assertNoHorizontalOverflow, submitDemoForm } from "./helpers.js";

const PAGE_URL = "/sites/praktika/index.html";

async function openPraktika(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(PAGE_URL);
  expect(response?.ok()).toBeTruthy();
  return errors;
}

test("presents the complete course journey and clearly fictional mentor", async ({
  page,
}) => {
  const errors = await openPraktika(page);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Навык, который становится практикой",
    })
  ).toBeVisible();
  await expect(page.locator("main > section")).toHaveCount(7);
  await expect(page.locator(".program-item")).toHaveCount(6);
  await expect(
    page.getByText("Вымышленный персонаж для демонстрации", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("Демонстрационный концепт", { exact: true })
  ).toBeVisible();
  await expect
    .poll(() =>
      page.locator(".mentor-photo img").evaluate((image) => image.naturalWidth)
    )
    .toBeGreaterThan(0);
  await expect(page.locator("#course-form")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("operates the course accordion by mouse and Enter with accessible state", async ({
  page,
}) => {
  const errors = await openPraktika(page);
  const triggers = page.locator(".program-item > button");

  await expect(triggers).toHaveCount(6);
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "true");

  const secondTrigger = triggers.nth(1);
  const secondPanelId = await secondTrigger.getAttribute("aria-controls");
  expect(secondPanelId).toBeTruthy();
  await expect(secondTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(`#${secondPanelId}`)).toBeHidden();

  await secondTrigger.click();
  await expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`#${secondPanelId}`)).toBeVisible();

  const thirdTrigger = triggers.nth(2);
  const thirdPanelId = await thirdTrigger.getAttribute("aria-controls");
  expect(thirdPanelId).toBeTruthy();
  await thirdTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(thirdTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`#${thirdPanelId}`)).toBeVisible();
  expect(errors).toEqual([]);
});

test("validates and confirms the demonstration enrollment form", async ({
  page,
}) => {
  const errors = await openPraktika(page);
  const form = page.locator("#course-form");

  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[role=alert]")).toContainText(
    "Заполните имя и контакты"
  );

  await submitDemoForm(page, "#course-form");
  await expect(form.locator("[role=status]")).toHaveText(
    "Заявка принята в демонстрационном режиме"
  );
  expect(errors).toEqual([]);
});

test("keeps the hero heading inside the 375 px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto(PAGE_URL);

  const textBounds = await page.locator(".hero h1").evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const bounds = range.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right };
  });

  expect(textBounds.left).toBeGreaterThanOrEqual(0);
  expect(textBounds.right).toBeLessThanOrEqual(375);
});
