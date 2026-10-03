# CS2 ANALYTICS V56 — RELEASE REPORT

Date: 2026-09-30

## Final fixes

- **Все игры** теперь сортируются по постоянному номеру карты, а не по дате матча: `#61 → #1`. При появлении `map_062` новая запись автоматически становится `#62`.
- **Главная / Hero**: удалён старый CSS override, который принудительно подставлял Mirage. Hero теперь использует локальный `assets/maps/nuke.svg`.
- **Нижний правый promo**: уменьшен блок `CS2 ANALYTICS`, чтобы надпись стабильно помещалась внутри карточки без переполнения.
- Старый `CUSTOM_V50_QA.js` заменён на локальный QA без абсолютной ссылки на удалённую V39.

## QA

- V56 QA: PASS
- Core QA: PASS
- Dataset QA: PASS
- V55 UX QA: PASS
- Custom QA: PASS
- JavaScript syntax: PASS
- Active maps: 61
- History range: 61..51

Visual Chromium capture was attempted in the local environment but did not complete; therefore it is not reported as PASS.
