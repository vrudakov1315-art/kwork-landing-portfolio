import { expect, test } from "@playwright/test";

const sites = [
  { slug: "forma", firstLink: "#services" },
  { slug: "praktika", firstLink: "#program" },
  { slug: "temp", firstLink: "#directions" },
  { slug: "puls", firstLink: "#features" },
];

test.use({ viewport: { width: 390, height: 844 } });

for (const { slug, firstLink } of sites) {
  test(`${slug}: mobile menu opens from an accessible toggle`, async ({ page }) => {
    await page.goto(`/sites/${slug}/`);

    const toggle = page.locator(".menu-toggle");
    const navigation = page.locator(".site-nav");

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAccessibleName("Открыть меню");
    await expect(toggle).toHaveAttribute("aria-controls", `${slug}-site-nav`);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(navigation).toBeHidden();

    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveAccessibleName("Закрыть меню");
    await expect(navigation).toBeVisible();
    await expect(navigation.locator(`a[href="${firstLink}"]`)).toBeVisible();
  });

  test(`${slug}: mobile menu closes after a section link is followed`, async ({
    page,
  }) => {
    await page.goto(`/sites/${slug}/`);

    const toggle = page.locator(".menu-toggle");
    const navigation = page.locator(".site-nav");

    await toggle.click();
    await navigation.locator(`a[href="${firstLink}"]`).click();

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAccessibleName("Открыть меню");
    await expect(navigation).toBeHidden();
  });

  test(`${slug}: Escape closes the mobile menu and restores toggle focus`, async ({
    page,
  }) => {
    await page.goto(`/sites/${slug}/`);

    const toggle = page.locator(".menu-toggle");
    const navigation = page.locator(".site-nav");

    await toggle.click();
    await navigation.locator(`a[href="${firstLink}"]`).focus();
    await page.keyboard.press("Escape");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAccessibleName("Открыть меню");
    await expect(navigation).toBeHidden();
    await expect(toggle).toBeFocused();
  });
}
