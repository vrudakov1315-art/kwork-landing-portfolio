import { expect, test } from "@playwright/test";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugs = ["sever", "forma", "praktika", "temp", "puls"];
const requiredFiles = [
  "cover.html",
  "description.md",
  "cover.jpg",
  "desktop.jpg",
  "mobile.jpg"
];
const imageFiles = ["cover.jpg", "desktop.jpg", "mobile.jpg"];
const maxImageSize = 10 * 1024 * 1024;
const descriptions = {
  sever: {
    shown:
      "Показаны: атмосферный первый экран, карточки меню, галерея интерьера и форма бронирования.",
    implemented:
      "Реализованы: адаптивная вёрстка, мобильное меню, локальное подтверждение брони.",
  },
  forma: {
    shown:
      "Показаны: примеры интерьеров, этапы работ, виды ремонта и калькулятор стоимости.",
    implemented:
      "Реализованы: адаптивная вёрстка, мобильное меню, интерактивный расчёт сметы.",
  },
  praktika: {
    shown:
      "Показаны: программа обучения, формат занятий, профиль наставника и форма записи.",
    implemented:
      "Реализованы: адаптивная вёрстка, мобильное меню, доступный аккордеон программы.",
  },
  temp: {
    shown:
      "Показаны: направления тренировок, динамическое расписание, тарифы и ответы на вопросы.",
    implemented:
      "Реализованы: адаптивная вёрстка, мобильное меню, переключение формата тренировок.",
  },
  puls: {
    shown:
      "Показаны: продуктовый интерфейс, сценарии работы, тарифы и форма раннего доступа.",
    implemented:
      "Реализованы: адаптивная вёрстка, мобильное меню, переключение периода оплаты.",
  },
};

const forbiddenClaims = {
  forma: [
    "Объект 024",
    "Хамовники",
    "12 лет",
    "148 сданных объектов",
    "3 года гарантии",
    "Пресня",
    "Раменки",
    "Якиманка",
    "фактический срок",
    "Москва и Московская область",
    "+7 495 000-00-00",
    "plan@forma-remont.ru",
    "Позвоним в рабочее время",
  ],
  sever: [
    "ул. Чайковского, 17",
    "+7 812 000-00-17",
    "hello@sever-coffee.ru",
  ],
};

for (const slug of slugs) {
  test(`${slug}: комплект Kwork содержит пять требуемых файлов`, async () => {
    const directory = path.join(projectRoot, "sites", slug, "kwork");

    for (const file of requiredFiles) {
      await expect(access(path.join(directory, file))).resolves.toBeUndefined();
    }
  });

  test(`${slug}: изображения декодируются и соблюдают лимит 10 МБ`, async ({ page }) => {
    await page.goto(`/sites/${slug}/kwork/cover.html`);

    for (const file of imageFiles) {
      const imagePath = path.join(projectRoot, "sites", slug, "kwork", file);
      const imageStat = await stat(imagePath);

      expect(imageStat.size).toBeGreaterThan(0);
      expect(imageStat.size).toBeLessThan(maxImageSize);

      const dimensions = await page.evaluate(
        async ({ src }) => {
          const image = new Image();
          image.src = src;
          await image.decode();
          return { width: image.naturalWidth, height: image.naturalHeight };
        },
        { src: `/sites/${slug}/kwork/${file}` }
      );

      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);

      if (file === "cover.jpg") {
        expect(dimensions).toEqual({ width: 1920, height: 1280 });
      } else if (file === "desktop.jpg") {
        expect(dimensions.width).toBe(1440);
      } else {
        expect(dimensions.width).toBe(390);
      }
    }
  });

  test(`${slug}: описание явно маркирует демонстрационный концепт`, async () => {
    const description = await readFile(
      path.join(projectRoot, "sites", slug, "kwork", "description.md"),
      "utf8"
    );

    expect(description).toContain("Демонстрационный концепт");
    expect(description).toContain(descriptions[slug].shown);
    expect(description).toContain(descriptions[slug].implemented);
  });
}

for (const [slug, claims] of Object.entries(forbiddenClaims)) {
  test(`${slug}: исходный контент не содержит реалистичных бизнес-утверждений`, async () => {
    const html = await readFile(
      path.join(projectRoot, "sites", slug, "index.html"),
      "utf8"
    );
    const script = await readFile(
      path.join(projectRoot, "sites", slug, "script.js"),
      "utf8"
    );

    for (const claim of claims) {
      expect(`${html}\n${script}`).not.toContain(claim);
    }
  });
}

test("sever: название на обложке остаётся цельным словом", async ({ page }) => {
  await page.goto("/sites/sever/kwork/cover.html");

  const title = page.locator("h1");
  await expect(title).toHaveText("Север");

  const metrics = await title.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(styles.lineHeight),
    };
  });

  expect(metrics.height).toBeLessThan(metrics.lineHeight * 1.25);
});
