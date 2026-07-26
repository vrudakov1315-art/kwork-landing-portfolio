import { test, expect } from "@playwright/test";
import { assertNoHorizontalOverflow, submitDemoForm } from "./helpers.js";

const PAGE_URL = "/sites/sever/index.html";

async function openSever(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(PAGE_URL);
  expect(response?.ok()).toBeTruthy();
  return errors;
}

test("shows the complete seven-section coffee story and menu", async ({ page }) => {
  const errors = await openSever(page);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Кофе, ради которого хочется задержаться",
    })
  ).toBeVisible();
  await expect(page.locator("main > section")).toHaveCount(7);
  await expect(page.locator(".menu-card")).toHaveCount(3);
  await expect(page.locator("#story")).toBeVisible();
  await expect(page.locator("#menu")).toBeVisible();
  await expect(page.locator("#booking")).toBeVisible();
  await assertNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("visibly identifies the page as a demonstration concept", async ({ page }) => {
  const errors = await openSever(page);

  await expect(
    page.getByText("Демонстрационный концепт", { exact: true })
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("rejects an empty booking form with a useful error", async ({ page }) => {
  const errors = await openSever(page);

  await page.locator('#booking-form button[type="submit"]').click();

  await expect(page.locator("#booking-form [role=alert]")).toContainText(
    "Заполните имя и контакты"
  );
  expect(errors).toEqual([]);
});

test("confirms a valid booking in demonstration mode", async ({ page }) => {
  const errors = await openSever(page);

  await submitDemoForm(page, "#booking-form");

  await expect(page.locator("#booking-form [role=status]")).toHaveText(
    "Заявка принята в демонстрационном режиме"
  );
  expect(errors).toEqual([]);
});

test("rejects a booking date earlier than the field minimum", async ({ page }) => {
  const errors = await openSever(page);
  const form = page.locator("#booking-form");
  const date = form.locator('[name="date"]');

  await form.locator("[name=name]").fill("Анна");
  await form.locator("[name=contact]").fill("anna@example.com");
  await date.fill("2020-01-01");
  await form.locator('button[type="submit"]').click();

  await expect(form.locator("[role=alert]")).toHaveText(
    "Выберите доступную дату бронирования"
  );
  await expect(date).toHaveAttribute("aria-describedby", "booking-error");
  await expect(form.locator("[role=status]")).toBeHidden();
  expect(errors).toEqual([]);
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens from its labelled menu button without horizontal overflow", async ({
    page,
  }) => {
    const errors = await openSever(page);
    const toggle = page.getByRole("button", { name: "Открыть меню" });

    await expect(page.locator(".site-nav")).toBeHidden();
    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".site-nav")).toBeVisible();
    await expect(page.locator('.site-nav a[href="#menu"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test("does not move focus when Escape is pressed while the menu is closed", async ({
    page,
  }) => {
    const errors = await openSever(page);
    const nameField = page.locator('#booking-form [name="name"]');

    await nameField.focus();
    await page.keyboard.press("Escape");

    await expect(nameField).toBeFocused();
    expect(errors).toEqual([]);
  });
});

test.describe("tablet layout", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("keeps the bean image caption completely inside the viewport", async ({
    page,
  }) => {
    const errors = await openSever(page);
    const caption = page.locator(".bean-image figcaption");
    const box = await caption.boundingBox();

    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(768);
    expect(errors).toEqual([]);
  });
});
