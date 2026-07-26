# «Форма» — лендинг студии ремонта

Статический одностраничный сайт с портфолио, этапами работ, калькулятором
предварительной стоимости и локальной демонстрационной формой заявки.

## Запуск

Из каталога `portfolio/kwork-landings`:

```powershell
npm test -- tests/forma.spec.js
```

Страница доступна по адресу `/sites/forma/` через общий тестовый сервер.

## Фотографии

Все изображения скачаны локально с официального CDN Pexels и используются
по [лицензии Pexels](https://www.pexels.com/license/). Страницы источников:

- `assets/living-room.jpg` — Jonathan Borba,
  [Modern Living Room](https://www.pexels.com/photo/modern-living-room-9976124/).
- `assets/kitchen.jpg` — Curtis Adams,
  [Modern Kitchen Interior with White Cabinets](https://www.pexels.com/photo/modern-kitchen-interior-with-white-cabinets-15062158/).
- `assets/bedroom.jpg` — Curtis Adams,
  [Modern Bedroom Interior](https://www.pexels.com/photo/modern-bedroom-interior-10099254/).
- `assets/bathroom.jpg` — Max Vakhtbovych,
  [Modern Bathroom Interior](https://www.pexels.com/photo/modern-bathroom-interior-8082225/).

## Калькулятор

Диапазон площади: 10–500 м². Ставки: косметический — 18 000 ₽/м²,
капитальный — 32 000 ₽/м², дизайнерский — 48 000 ₽/м². Форма заявки
демонстрационная: она показывает локальное подтверждение и не отправляет данные.
