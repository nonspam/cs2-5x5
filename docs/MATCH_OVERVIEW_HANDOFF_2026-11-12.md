# Handoff: Match Overview first, Statistics second
Дата: 2026-11-12
Репозиторий: `nonspam/cs2-5x5`
Рабочая ветка: `faceit-dev`
Статус: HTML/CSS референс получен и разобран; первая реализация Match Overview внесена в `faceit-dev`; CI и визуальная приёмка новых изменений ещё не подтверждены.

## Прочитать в первую очередь
1. [PROJECT_MASTER.md](../PROJECT_MASTER.md) — правила и продуктовый контекст.
2. [TECHNICAL_STATE.md](../TECHNICAL_STATE.md) — актуальный технический статус.
3. [CHAT_CONTEXT.md](../CHAT_CONTEXT.md) — решения и история общения.
4. Этот файл — точка остановки по Match Overview.
5. [MATCH_CENTER_CHECKPOINT_2026-11-12.md](MATCH_CENTER_CHECKPOINT_2026-11-12.md) — ранее выполненная работа по Match Center.

## Главная задача при возвращении
Продолжить разработку экрана матча строго поэтапно:
- **Этап 1 — Match Overview.** Сначала изучить переданный владельцем HTML/CSS с точными размерами, названиями классов/элементов и визуальными правилами. Затем реализовать только Overview, сохранив реальные данные и существующее поведение.
- **Этап 2 — Statistics.** Не начинать до завершения и согласования Overview. После этого отдельно разобрать референс статистики и реализовать его.

Не смешивать два этапа в один большой редизайн. Не придумывать недостающие блоки и стили: владелец задаёт визуальное направление и принимает результат.

## Референс получен и разобран — 2026-11-12

Исходник приложен непосредственно в чат и прочитан. Подробный разбор и implementation map: [MATCH_OVERVIEW_REFERENCE_ANALYSIS_2026-11-12.md](MATCH_OVERVIEW_REFERENCE_ANALYSIS_2026-11-12.md).

Ключевые факты:
- 1.23 MB / 27,024 строк; 10 embedded style blocks, 182 media rules, 1,600 inline style attributes.
- Нативная структура: local navigation → match metadata → score card → три колонки (ростер / центральная колонка / ростер).
- CSS-фрагмент не содержит runtime-generated styled-components rules для многих ключевых DOM классов. Не заявлять, что computed CSS и все точные размеры полностью восстановлены.
- Часть DOM — браузерное расширение (`fc-strip`, `fc-note`, `faceit-lobby-stats`, `fc-plate`, forecast и team panels), а не нативный FACEIT. Не копировать его значения в продукт как подтверждённую статистику.
- Для CS2 Analytics отсутствуют подтверждённые server/veto/demo/forecast fields. Их не выдумывать. Средний ELO в score card явно подписан как текущий, а не исторический.

## Первая реализация Match Overview внесена

Изменены только:
- `app_v57.js` — nav, score card, roster headers и средний текущий ELO;
- `style_v57.css` — scoped Match Room styling и responsive layout;
- `tests/faceit-v2-shell.test.cjs` — новые contract assertions.

Statistics renderer не редактировался. DB/SQL/schema/RLS/grants/migrations, `main`, production и deployment не затрагивались.

Commits:
- JS: `4e55c9224a4bcb3bb5a1af03ec38258147755e89`, `12144170211501b9678cddba67d83c81daca64b1`, `0b9051d9c4c0b090c91382976d6831f6a1d04ca9`;
- CSS: `f71fb7e58bf74ad3ee48834807c7ea0e645a8287`;
- tests: `8adb0537fd758141068d6b11edeb20040a6c03d8`;
- reference analysis doc: `f439a70489b22ba31295cece7e2e5ef7ad305e78`.

JavaScript and test source were syntax-compiled in the connector runtime. Full `npm run check` / GitHub Quality Gate for these commits is not yet confirmed. Browser QA, deployment and owner visual acceptance are not performed.

## Третий проход — точная карточка игрока по выделенному FACEIT-референсу

Владелец прислал отдельные файлы HTML/замеров карточки и CSS выделенной области игрока. Прочитаны оба источника. В HTML подтверждены структура FACEIT player row: контейнер карточки, аватар 40 px, блок ника, отдельный Elo/end-slot и skill-level значок 32 px. Замер внешнего элемента из приложенного снимка: примерно 369.1 × 142.0 px. В HTML присутствует также расширение FACEIT Analytics: `.fc-plate`, `.fc-strip`, `.fc-note`; их метрики/данные не являются нативными данными FACEIT и не копируются как источник.

В `style_v57.css` добавлен новый scoped override только для Match Overview roster:
- карточка стала единой поверхностью, аватар вынесен в левую зону карточки;
- верхняя строка собрана вокруг ника, Elo и уровня;
- нижние шесть показателей отображаются одной непрерывной полосой без отдельных плиток/рамок;
- длинные ники переносятся вместо принудительного ellipsis;
- сохранены только реально имеющиеся метрики приложения; отсутствующие данные не синтезируются.

Добавлен тестовый контракт в `tests/faceit-v2-shell.test.cjs`. Проверены JS-синтаксис приложения и синтаксис тестового файла, плюс статические условия новой карточки. Полный npm test/Quality Gate и визуальный браузерный тест не запускались. Не менялись данные, Statistics, DB/SQL/RLS/grants/migrations, main/production; деплой не выполнялся.

CSS commit: `297c66eb595acd408d7a7b261deda071ce5ebe84`.
Tests commit: `6002c5387af4ab5d721fd739131c763048eb4ab4`.

## Визуальная обратная связь и второй проход — 2026-11-12

Владелец прислал два скриншота: текущий Match Overview и целевую карточку FACEIT. Замечания:
- убрать отдельные тёмные прямоугольники вокруг каждого показателя игрока;
- показывать показатели единой горизонтальной строкой, в стиле FACEIT;
- не обрезать ники игроков;
- убрать декоративную круглую метку «CS2» рядом со счётом, из-за которой она визуально конкурирует с числом счёта;
- приблизить карточку игрока к FACEIT, а не ограничиваться цветами/скруглениями.

Второй проход внесён в `faceit-dev`:
- `app_v57.js`: W/L добавлен на основе известных результатов карьеры; метрики сведены к шести показателям (W/L, матчи, WR, kills/map, K/D, ADR); ник имеет title и допускает перенос; метка CS2 удалена из score card, числовой счёт оставлен отдельным элементом.
- `style_v57.css`: шесть колонок без индивидуальных фонов/рамок, полный перенос длинного ника, более ясная сетка счёта.
- `tests/faceit-v2-shell.test.cjs`: проверки новой структуры и стилей.

Commits:
- JS: `370df73b995298f4ff3840ae7fc71fae74000ee0`
- CSS: `b582cc43d75a863c53fb0188163350493046c069`
- tests: `0c1cb75e37b7c4169396bb8f8a3c0ce5757f7374`

Проверены синтаксис JS и тестового файла, а также целевые статические условия: шесть метрик, прозрачная строка без плиток, перенос ника, удаление CS2 badge, наличие числового элемента счёта. Полный test suite/Quality Gate и браузерная визуальная проверка не запускались. Никаких изменений Statistics, данных, DB, SQL, RLS, grants, migrations, main, production или deployment не было.

**Нужен дополнительный референс:** попросить владельца прислать CSS именно колонки/карточки игрока FACEIT (и, если возможно, соответствующий HTML фрагмент). В текущем общем snapshot отсутствуют runtime-generated правила ключевых styled-components, поэтому точную геометрию и состояния карточки нельзя надёжно восстановить. Следующий проход должен использовать этот CSS, если он будет предоставлен, и сверить визуально после разрешённой владельцем проверки. Не утверждать pixel-perfect соответствие до этого.

## Что произошло с загрузкой референса 2026-11-12
Владелец загрузил файл через GitHub UI в репозиторий. Обнаружен commit:
- [64a081db889a05514dce0f9f94d8ddbe92711b90](https://github.com/nonspam/cs2-5x5/commit/64a081db889a05514dce0f9f94d8ddbe92711b90)
- Message: `Add files via upload`
- Файл: `матч внутри,обозр и стата.txt`
- Изменение: файл добавлен в корень репозитория; сравнение с `faceit-dev` показало 27,023 добавленные строки.

Второй upload-коммит:
- [eac20e94297ed89a212be17524891f0ff4fb7dfa](https://github.com/nonspam/cs2-5x5/commit/eac20e94297ed89a212be17524891f0ff4fb7dfa)
- Message: `Add files via upload`
- Этот коммит был последним найденным commit в default/main истории на момент проверки.

**Важная проблема:** GitHub connector подтвердил путь/commit/статистику файла, но `fetch_file` вернул пустое содержимое (UTF-8 и base64). Поэтому содержимое HTML/CSS фактически не было прочитано и не анализировалось. Не делать вид, что файл изучен. Нужно открыть файл в GitHub через Raw/Download либо получить его непосредственно вложением в чат, проверить фактическое содержимое и только затем писать код.

## Ветки и безопасность
- Разработка этой задачи — только `faceit-dev`.
- Не переносить upload-коммиты в `faceit-dev` автоматически: сначала получить и проверить содержимое файла.
- Не коммитить UI-работу в `main`; не менять production deployment.
- Не выполнять DB writes, SQL, migrations, schema/RLS/grants changes.
- Перед каждым изменением заново проверить актуальный HEAD `faceit-dev`; не полагаться на SHA из старых сообщений.
- Не запускать deploy или browser QA, если владелец отдельно не попросил.
- В отчёте разделять source changes, CI, browser QA и deployment. Не заявлять непроверенное.

## Уже реализовано ранее (не откатывать)
Подробности — в [MATCH_CENTER_CHECKPOINT_2026-11-12.md](MATCH_CENTER_CHECKPOINT_2026-11-12.md). Кратко:
- Исправлен вызов ELO API для уровня игрока: используется `CS2EloV3.player(id)`, не несуществующий `playerData(id)`.
- Match Center адаптирован к FACEIT Match Room reference: верхний hero, три колонки команд/центра/команд.
- Компактные карточки игроков: квадратный аватар, ник, рейтинг, level badge и метрики.
- Строки карт: квадратная миниатюра, название, счёт справа.
- В Statistics добавлен MVP и award rows, но часть метрик недоступна из текущего источника; не подставлять фальшивые значения.

Последние известные commits по предыдущей реализации:
- Source/tests: `2855accc3f83fb9a4110293a4d63e6f2a9cca7e1`
- Docs: `08ea5fe256dfedcad1c122e5e21228524804d71b`
- Последний известный journal HEAD до этого handoff: `5510c34a96a33a84a96d8ad171f76b660e54d307`. Это историческая отметка, перед работой перепроверить ветку.

## CI / проверка
- Quality Gate для source commit `2855accc3f83fb9a4110293a4d63e6f2a9cca7e1`: 183 passed, 0 failed.
- Quality Gate для docs commit `08ea5fe256dfedcad1c122e5e21228524804d71b`: 183 passed, 0 failed.
- [CI run 43261514891](https://github.com/nonspam/cs2-5x5/actions/runs/43261514891).
- Browser QA и deployment для последней реализации не подтверждены.

## Следующие шаги
1. Проверить актуальный HEAD `faceit-dev` и Quality Gate для новых source/test commits; не заявлять успешный CI без фактического статуса.
2. Если CI выявит ошибки — исправить их в той же ветке и повторно проверить.
3. Показать владельцу результат Match Overview для визуальной приёмки и собрать конкретные замечания.
4. Не запускать browser QA или deployment без отдельного разрешения.
5. Statistics не редактировать и не начинать до явного одобрения Overview.

## Готовый контекст для нового чата
Попроси новый чат прочитать этот handoff и документы из списка в начале. Затем пусть он подтвердит понимание ограничений и продолжит с получения читаемого HTML/CSS файла. Никакого редизайна Statistics до закрытия Overview.


## Срочное исправление после скриншота владельца

Первый визуальный проход карточки оказался неудовлетворительным: на реальном скриншоте аватарная зона была пустой, а карточка слишком низкой и статистика слишком мелкой. Исправлена структура: аватар обёрнут в отдельный grid-item и возвращён в нормальный layout flow; задана явная геометрия 40 px, сетка идентичности 40px / flexible name / rating / 30px level; минимальная высота карточки увеличена до 126 px; метрики увеличены и получили больше вертикального пространства. Добавлен регрессионный тест для обёртки аватара и размеров.

Исправления:
- app: `d11f6816ae1ea317d2b984712bca0e06d1b86961` (последующая синтаксическая правка включена в итоговую версию app)
- app syntax fix: `f34cd60397c683b6f908b739621dfc8528a9231f`
- CSS: `fe26e2957fbe045911582266acc8e854f597a6cc`
- test: `0a7cc5ea83bb498bb4f63d66375900c0471e50db`

Повторная визуальная проверка в браузере пока не выполнена; это исправление кода по обнаруженным причинам, а не подтверждение пиксельного результата.


## Карточки карт — полноразмерная обложка в пределах самой плитки

По просьбе владельца превью карты встроено непосредственно в прямоугольник результата матча: больше нет отдельной маленькой картинки слева от названия. Существующий map-specific image source (`mapRemoteAsset(mp.map)`, уже используемый через `mapThumb`) растягивается на всю плитку. Поверх добавлен тёмный градиент для контраста, а MAP 1, название карты и счёт остаются поверх фотографии. Название карты крупнее, счёт выделен справа. Изображение остаётся привязанным к фактическому имени карты, поэтому Overpass получает именно ресурс Overpass, Cache — Cache; случайная универсальная картинка не подставляется.

Изменены `app_v57.js`, `style_v57.css`; добавлен тестовый контракт в `tests/faceit-v2-shell.test.cjs`. JS синтаксис и статические проверки прошли. Браузерный визуальный контроль не запускался, поэтому финальную читаемость конкретного кадра нужно подтвердить на DEV.

Commits:
- app: `d021028c937b2d9675251d41f715dfa06708a6fe`
- CSS: `a15a77eafad97000d7c0a58fe6db44bcac667bf9`
- test: `2831525be51dbcf1da8b1e830403752d4ad113f0`


## 2026-11-13 — Match Overview follow-up: BO3 Top 10, map image layering, profile ELO match links

- Added a series-wide Top 10 K/D panel to Match Overview using `seriesAggregateRows` output only. Best, median-position and worst entries are labelled; zero-death positive-kill rows display `∞`; incomplete sources are explicitly shown as fewer than 10 rather than filled with invented values.
- Corrected map artwork stacking: the map image layer is now above the tile background, the contrast overlay above the image, and labels/scores above the overlay. The map results section now carries the `match-room-center` hook required by its existing full-bleed artwork styles.
- Fixed profile ELO tooltip match navigation to resolve the canonical `DB.matches[].match_id` before calling the strict match lookup. If no match is found, the user receives an explicit message instead of a silent no-op.
- Updated a stale static assertion to target the current unique-alias helper and added regression contracts for Top 10, map artwork hook/layering, and ELO match-id resolution. No browser QA performed; CI is the next verification.

 
## 2026-11-13 — Separate BO3 Top tab and ELO chart hit-target repair

Owner requested that the compact Top 10 ranking be removed from Overview and moved to a dedicated **TOP** tab directly beside Overview. Implemented on `faceit-dev`:
- Overview no longer contains the ranking block.
- For BO3 matches, the room navigation shows Overview and Top. Top uses the full available content width and lists up to ten series players sorted by aggregate K/D.
- Columns: rank, player, K, D, A, K/D, +/−, AVG. AVG is explicitly defined as kills per map in the series; no damage/ADR/KAST/round-average data is fabricated.
- The player-name resolver checks player ID, registered display names, aliases and guest display names before falling back to the source raw name. First row is marked BEST in green; last row BAD in red. MEDIAN/WORST labels were removed.
- ELO chart no longer relies on independent click handlers on each SVG group. Click and keyboard handling are delegated at the profile root in capture phase; hit testing resolves the nearest plotted point within 28 CSS pixels, and SVG hit circles were expanded. Tooltip still opens the corresponding match via its canonical match ID.

Files changed: `app_v57.js`, `style_v57.css`, `index.html` (cache key bumped), `tests/faceit-v2-shell.test.cjs`, `TECHNICAL_STATE.md`, this handoff.

Validation status: source changes committed to `faceit-dev`; automated CI status must be checked separately. No browser QA was run. Therefore the ELO click fix is implemented but not yet confirmed in a real browser. No database/SQL/schema/RLS/grants/migrations, `main`, or production changes were made.
