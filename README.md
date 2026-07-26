# Портфолио адаптивных лендингов для Kwork

Пять автономных демонстрационных концептов. Все страницы, стили, сценарии и изображения работают локально без runtime-зависимостей от внешних ресурсов.

## Установка и проверка

Команды выполняются из каталога `portfolio/kwork-landings`:

```powershell
npm ci
npx playwright install chromium
npm test
npm run capture
```

`npm run capture` заново создаёт по три JPEG для каждого сайта и проверяет лимит 10 МБ на файл.

## Локальный просмотр

Запустите сервер:

```powershell
node scripts/serve.mjs
```

После запуска сайты доступны по адресам:

| Сайт | Локальный URL |
| --- | --- |
| Север | <http://127.0.0.1:4173/sites/sever/index.html> |
| Форма | <http://127.0.0.1:4173/sites/forma/index.html> |
| Практика | <http://127.0.0.1:4173/sites/praktika/index.html> |
| Темп | <http://127.0.0.1:4173/sites/temp/index.html> |
| Пульс | <http://127.0.0.1:4173/sites/puls/index.html> |

## Изображения для Kwork

Все пути указаны относительно `portfolio/kwork-landings`.

| Сайт | Формат | Точный путь |
| --- | --- | --- |
| Север | Обложка 1920×1280 | `sites/sever/kwork/cover.jpg` |
| Север | Полная desktop-страница | `sites/sever/kwork/desktop.jpg` |
| Север | Полная mobile-страница | `sites/sever/kwork/mobile.jpg` |
| Форма | Обложка 1920×1280 | `sites/forma/kwork/cover.jpg` |
| Форма | Полная desktop-страница | `sites/forma/kwork/desktop.jpg` |
| Форма | Полная mobile-страница | `sites/forma/kwork/mobile.jpg` |
| Практика | Обложка 1920×1280 | `sites/praktika/kwork/cover.jpg` |
| Практика | Полная desktop-страница | `sites/praktika/kwork/desktop.jpg` |
| Практика | Полная mobile-страница | `sites/praktika/kwork/mobile.jpg` |
| Темп | Обложка 1920×1280 | `sites/temp/kwork/cover.jpg` |
| Темп | Полная desktop-страница | `sites/temp/kwork/desktop.jpg` |
| Темп | Полная mobile-страница | `sites/temp/kwork/mobile.jpg` |
| Пульс | Обложка 1920×1280 | `sites/puls/kwork/cover.jpg` |
| Пульс | Полная desktop-страница | `sites/puls/kwork/desktop.jpg` |
| Пульс | Полная mobile-страница | `sites/puls/kwork/mobile.jpg` |

В каталоге `sites/<site>/kwork/` также находятся `description.md` с текстом карточки и `cover.html` с исходным макетом обложки.
