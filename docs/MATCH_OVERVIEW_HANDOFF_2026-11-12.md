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
