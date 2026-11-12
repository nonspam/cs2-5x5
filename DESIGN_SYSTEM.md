# Design system — FACEIT-inspired CS2 Analytics

## Цель и решение
Владелец выбрал единый FACEIT-inspired интерфейс для всего сайта, а не отдельный новый профиль рядом со старым интерфейсом. Общий shell должен постепенно объединить главную, игроков, профили, матчи, статистику, сезоны, Track, рекорды и настройки.

FACEIT profile OBASRAL и переданные screenshot/HTML/CSS — визуальный референс. Чужие данные, статистику и идентичность не переносить.

## Визуальные принципы
- Постоянная левая навигация и единые active/hover/focus состояния.
- Общие фон, шрифтовая шкала, интервалы, границы, поверхности и акцент.
- Повторяемые карточки, таблицы, графики, tabs, filters и метаданные.
- Плотная, но читаемая статистика.
- Сначала desktop reference, затем tablet/mobile.
- Уникальные разделы без прямого FACEIT аналога строить из тех же компонентов и визуального ритма.
- Декоративный макет не заменяет реальную страницу и её действия.

## Правила реализации
1. Перед CSS-правкой найти DOM и действующий cascade.
2. Предпочитать scoped styles с понятным root class.
3. Избегать широких global selectors без необходимости.
4. Не оставлять конкурирующие CSS rules без понимания порядка.
5. Сохранять handlers, data bindings, permissions и persistence.
6. Сверять screenshot при одинаковом viewport.
7. Проверять overflow, клики, focus, empty/error states и mobile.
8. Не заявлять pixel-perfect без реального сравнения рендера.

## Приёмка страницы
- Есть ли точный FACEIT аналог и screenshot?
- Что уникально для CS2 Analytics?
- Какие данные и действия должны сохраниться?
- Какие общие компоненты переиспользуются?
- Совпадают ли иерархия и spacing?
- Работают ли фильтры, переходы и пустые состояния?
- Проверены ли desktop и mobile?
- Обновлены ли документы и QA evidence?

## Источники
Исходные FACEIT HTML/CSS выгрузки передавались в предыдущем чате и не являются гарантированно доступными файлами репозитория. Если их не окажется в новом чате, попросить пользователя прикрепить повторно.


## FACEIT research — ключевой метод
Не пытаться воспроизвести сложный интерфейс только по screenshot, если доступны исходные материалы. В предыдущей работе screenshot-only подход не давал нужного результата. Перелом наступил после изучения HTML + CSS реальной FACEIT profile page: это раскрыло типографику, selectors, avatar/cover, hero, gradients и stat tiles. Подробная история и handoff: [FACEIT_REFERENCE.md](FACEIT_REFERENCE.md).

Семейства, замеченные в выгрузке: Geist Variable, Geist Mono, Play, Coiny, Goldman. Это не готовая карта назначения шрифтов — проверить конкретные declarations и computed styles при повторном доступе к исходникам. Исходные большие HTML/CSS файлы пока не подтверждены в GitHub; если отсутствуют, попросить пользователя загрузить их повторно.


## CSS readiness checkpoint — 2026-11-12

The current stylesheet is a prototype layered onto a dense legacy cascade. Static measurements, shell selector map, risks and the staged implementation plan are documented in [the CSS readiness audit](docs/FACEIT_V2_CSS_READINESS_AUDIT_2026-11-12.md). Planning estimate: about 80% of technical preparation is complete before the owner-directed CSS pass; final approved visual implementation is only about 5–10% complete. Do not start broad restyling until the original FACEIT HTML/CSS reference extracts are available and the DEV browser baseline is captured.


## FACEIT reference archive received — 2026-11-12

The owner has now supplied a RAR5 archive with four UTF-8 page captures: player history, match room overview/statistics, seasons, and Track Stats. The archive has been inspected and mapped by screen. See [the reference archive inventory](docs/FACEIT_REFERENCE_ARCHIVE_INVENTORY_2026-11-12.md).

These are HTML/page snapshots with embedded or appended CSS material, not four clean standalone stylesheets. The Track capture also contains extension-injected CSS, which must be excluded from the app's visual layer. The previous note that the original reference files were not available in the current conversation is superseded by this upload.

Implementation order: shared profile shell + player history; seasons; match room; Track Stats. Keep CSS scoped to the appropriate page/component roots, preserve existing app data and handlers, and do not claim pixel-perfect fidelity before fixed-viewport browser comparison.
