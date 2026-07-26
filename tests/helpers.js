export async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  if (overflow) throw new Error("Horizontal overflow detected");
}

export async function submitDemoForm(page, selector) {
  const form = page.locator(selector);
  await form.locator("[name=name]").fill("Тест");
  await form.locator("[name=contact]").fill("test@example.com");
  await form.locator('button[type="submit"]').click();
  await form.locator('[role="status"]').waitFor();
}
