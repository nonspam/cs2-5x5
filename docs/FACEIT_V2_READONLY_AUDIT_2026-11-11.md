# FACEIT V2 — read-only технический аудит №1

Дата: 2026-11-11  
Ветка: `faceit-dev`  
Проверенный HEAD до этого отчёта: `c18e34745d1a9af522696ada00f3e5b83634901f`  
Режим: только чтение; UI/runtime/БД не изменялись.

## Краткий итог

Текущий runtime восстановлен и открывает существующие разделы в общей profile-inspired оболочке. Это пока инкрементальная интеграция поверх монолита `app_v57.js`, а не завершённая новая архитектура. Базовые облачные данные, auth, профильные связи и realtime реализованы в DEV Supabase.

Главные незакрытые задачи:
1. Полная инвентаризация интерактивных элементов и сценариев.
2. Реальная браузерная проверка DEV и подтверждение Cloudflare deployed SHA.
3. Сверка вычисляемых метрик и ELO на одном каноническом наборе данных.
4. Проверка поведения account/profile/auth, истории браузера и адаптивной оболочки.
5. Отдельное проектирование Track и полноценного сезонного lifecycle — эти системы не реализованы.

Никакие изменения кода или дизайна в рамках этого аудита не делались.

## GitHub и качество

- Репозиторий: `nonspam/cs2-5x5`.
- Рабочая ветка: `faceit-dev`; ветка найдена и проверена.
- HEAD: `c18e34745d1a9af522696ada00f3e5b83634901f`.
- Проверка workflow run `43092129786`: job `validate` завершился `success`.
- В истории checkpoint указано 83 passed / 0 failed для `npm run check`.
- `main` не менялся.
- Deployment SHA Cloudflare и фактическая версия, открытая в браузере, не подтверждены.

## Frontend: подтверждённая структура

### Точка входа и порядок скриптов

`index.html` подключает в порядке defer:
1. Supabase JS SDK CDN
2. `supabase-config.js`
3. `validation.js`
4. `supabase_adapter.js`
5. `data_embedded.js`
6. `app_v57.js`
7. `elo_v3.js`
8. `account_module.js`

`DOMContentLoaded` запускает `load()` после выполнения отложенных скриптов, поэтому ELO и account module уже должны быть объявлены к моменту начальной загрузки. Это вывод из порядка скриптов, а не браузерный smoke test.

### Архитектура и маршруты

- Основная логика сосредоточена в одном большом `app_v57.js` (проверено: около 1 276 строк на текущем snapshot).
- В файле обнаружено более 200 объявлений функций; расчёты, рендер страниц, модальные окна, редактирование и навигация перемешаны.
- Общая оболочка создаётся `renderRouteShell(v,page)`; профильная страница использует тот же rail.
- Видимые пункты rail: `home`, `analytics`, `base`, `maps`, `teams`, `records`, `seasons`, `profile`; Settings доступен отдельным shortcut.
- Дополнительные route keys `players` и `compare` присутствуют в page map, но не представлены как отдельные пункты текущего rail. `analytics` делегирует в `players(v)`.
- Track отсутствует в route map и не является рабочей страницей.
- Seasons содержит All Time и экран-заглушку Season 1. Сезонные standings, lifecycle, закрытие/архив и rollover не реализованы.
- Browser history/back-forward, прямые deep links, keyboard navigation и реальная адаптивность не проверялись.

### Функциональные области, найденные в коде

- Home / обзор: последняя серия, последние игры, общие показатели, сводные данные.
- Players / analytics: таблица игроков, ELO, K/D, impact, form, stability, player index; открытие подробностей и профиля.
- Compare: сравнение нескольких игроков.
- Matches / base: список серий, детали матча, добавление, редактирование, архив/корзина, восстановление.
- Maps: статистика и drilldown по картам.
- Teams: сбор/сравнение составов и балансировка.
- Records: карьерные и форматные рекорды.
- Profile: обзор, match history, профильные метаданные, avatar/cover.
- Settings: admin login, добавление игры, игроки/aliases, корзина, backup import/export, audit history.

Это перечень обнаруженных реализаций и функций, а не подтверждение, что каждый control работает корректно. Для этого нужен отдельный ручной/browser audit.

## Data model и DEV Supabase

### DEV project

Supabase project проверен по ref из `supabase-config.js`:
- Project ref: `nwujudniysolpevbtggd`.
- Name: `cs2-faceit-dev`.
- Region: `eu-west-1`.
- Status: `ACTIVE_HEALTHY`.
- PostgreSQL 17.11.
- Frontend config использует publishable key, не service-role key.

### Состояние данных

Read-only запрос к `public.cs2_app_state` вернул:
- version: **156**
- updated_at: `2026-11-10 17:31:13+00`
- players: **14**
- matches: **42**
- maps: **93**
- player_profiles: **14**
- auth.users: **1**

Отдельно встроенный fallback `data_embedded.js` содержит 14 players, 37 matches, 80 maps и 41 aliases. Он отстаёт от cloud state на 5 матчей и 13 карт. При корректно настроенном cloud mode приложение загружает Supabase state как authoritative; нельзя использовать embedded snapshot как актуальную статистическую истину. Если cloud load не удаётся, загрузка показывает boot error, а не должна выдавать embedded данные за актуальную облачную базу.

### Таблицы и миграции

В public schema найдены:
- `app_admins`
- `app_login_aliases`
- `cs2_app_state`
- `cs2_operations`
- `cs2_audit_log`
- `player_profiles`

В private schema в policy/catalog queries подтверждены:
- `player_account_links`
- `player_account_invites`

RLS включён на перечисленных таблицах. Доступ к state разрешён на чтение для anon/authenticated; запись приложения выполняется через защищённый RPC. `player_profiles` публично читается, а update ограничен проверкой linked player и принадлежностью media path текущему auth user. Storage bucket `cs2-player-media` имеет отдельные policies для публичного чтения и собственных upload/update/delete.

В DEV зарегистрировано 10 миграций, последняя:
`20261110211414_move_player_account_helpers_to_private_schema`.

Активная Edge Function:
- `cs2-admin`, version 2, status ACTIVE.
- В её коде проверяется bearer token через Supabase Auth и членство email в `app_admins`; admin write path проверяет действия и отправляет операции через `commit_cs2_state`.
- `verify_jwt=false` у Edge Function; ручная проверка пользователя реализована внутри функции. Это намеренная схема, но требует тестов auth/error paths и не считается заменой security review.

### Security/performance advisors

Последний read-only advisors snapshot вернул:
- RLS enabled / no policies — 5 таблиц: private invites, app_admins, app_login_aliases, cs2_audit_log, cs2_operations. При этом таблицы закрыты grants для anon/authenticated; отсутствие policies само по себе не означает публичную доступность.
- SECURITY DEFINER RPC `commit_cs2_state` и `is_cs2_admin` исполняемы authenticated. Внутри `commit_cs2_state` есть проверка `is_cs2_admin()`; обе функции имеют пустой search_path. Нужно сохранить это ограничение и проверить через negative auth tests, прежде чем менять grants.
- Leaked Password Protection отключён — рекомендация Supabase Auth включить защиту от скомпрометированных паролей.
- Два foreign keys private.player_account_invites без covering indexes.
- Три индекса отмечены как unused на момент snapshot; не удалять без оценки реальной нагрузки.

Это findings, а не выполненный security remediation. Никаких grants, policies, функций или настроек Auth не меняли.

## ELO V3 — фактическая логика в коде

Файл `elo_v3.js` реализует детерминированный пересчёт истории:
- стартовый рейтинг: 1000;
- вес результата команды: 85%;
- вес индивидуального impact: 15%;
- provisional K = 32 для первых 10 учитываемых серий игрока;
- established K = 24 после этого;
- одно начисление на серию BO1/BO3/BO5.

Результат серии берётся из `series_score`; если его нет/он не распознан, используется счёт карт. Нулевая серия 0:0 считается без результата. Для рейтингового события нужен полный состав 5×5, десять уникальных roster slots, минимум один известный игрок на каждой стороне и определённый исход. Неизвестные гости участвуют в среднем рейтинге команды как 1000, но сами ELO не получают.

Impact:
`clamp(50 + 6 × (K−D за карту) + 2 × (A за карту − 4), 0, 100)`.

Для каждого известного игрока impact сравнивается со средним impact его команды; относительная поправка ограничена диапазоном [-1, 1]. Итог:
`K × (0.85 × (actual − expected) + 0.15 × relativeImpact)`.

Победа принудительно даёт минимум +1, поражение максимум −1; результат округляется до 0.1. Ничья не имеет аналогичного ограничения. При наличии series aggregate из 10 или более строк используется aggregate; иначе ELO пытается агрегировать map-level player_stats.

Важно: это описание текущего кода, не утверждённые окончательные правила рейтинга. Не менять веса, K, старт, калибровку или seasonal reset без отдельного решения владельца и fixture-based regression tests.

## Расхождения и технические риски для следующего аудита

1. **Дублирование валидатора.** `validation.js` — отдельный более строгий canonical validator, используемый Supabase adapter для commit. В `app_v57.js` также есть inline `validateBase` с отличающейся реализацией. Нужно проверить, не расходятся ли требования при начальной загрузке, локальном backup/import и облачной записи.
2. **Данные fallback отстают.** Embedded snapshot: 14/37/80 против cloud state: 14/42/93. Нужно выяснить процесс обновления snapshot и убедиться, что статический/offline режим явно обозначает возраст/источник данных.
3. **Монолитный runtime.** Риск регрессий при изменениях; сначала тестировать поведение и инвентаризировать controls, затем выделять модули небольшими шагами.
4. **Навигация.** `navigateApp` меняет `state.tab` и вызывает render; browser history не интегрирован.
5. **Сезоны/Track.** Season 1 — подготовительная заглушка; Track отсутствует.
6. **Метрики.** В приложении есть несколько агрегаторов и profile-specific summaries. Требуется сравнить K/D, winrate, impact, index, form, records и ELO на одном наборе матчей, особенно для compact series, archived players, guest aliases и неполных данных.
7. **QA.** Тесты Node/CI подтверждены, но визуальное и интерактивное поведение в настоящем браузере не подтверждено.

## Рекомендуемый следующий порядок

1. Составить таблицу всех routes, кнопок, вкладок, модалок и input actions: рабочее / частичное / placeholder / не проверено.
2. Получить browser access/возможность реального DEV smoke test; подтвердить deployed SHA.
3. Написать read-only fixture audit для validators и агрегаторов, не трогая live data.
4. Проверить auth: sign-up/sign-in/reset/change password, link invite, logout, own/public profile, storage ownership.
5. Проверить навигацию и responsive shell.
6. После завершения аудита согласовать с владельцем порядок section-by-section UI. До получения его HTML/CSS/references не менять визуальную реализацию.
7. Только после этого переходить к реализации Track/seasons и утверждённой модели ELO lifecycle.

## Границы

- Только `faceit-dev`.
- Не трогать `main` и production Supabase.
- Не выполнять SQL migrations, UPDATE/INSERT/DELETE, массовый импорт или другие DB writes без прямого разрешения.
- Не менять дизайн/markup/CSS без указаний владельца.
- Не объявлять browser QA или deployment завершёнными без фактического подтверждения.


## Статическая инвентаризация controls — первый проход

Для текущего `app_v57.js` (239 887 bytes, 1 276 строк) выполнен простой source-level подсчёт:
- 222 function declarations;
- 126 inline `onclick` attributes;
- 9 inline `onchange` attributes;
- 21 вызов `addEventListener`;
- 44 вызова `querySelector/querySelectorAll`;
- 50 различных имён обработчиков, обнаруженных в inline `onclick`.

Эти цифры показывают масштаб ручной проверки, но не являются количеством уникальных UI-кнопок и не доказывают их работоспособность: элементы часто создаются в template strings, а обработчики могут назначаться динамически. Следующий этап — разобрать их по сценариям и проверить каждый видимый control в браузере.


## Дополнение: покрытие тестами и обработчики

Текущий suite состоит из 12 test files и 83 test cases:
- account/profile: 6
- adapter operations: 9
- DEV readiness/security contract: 8
- ELO V3: 4
- embedded dataset: 1
- entrypoint/load order: 3
- lifecycle regression: 5
- metrics regression: 7
- Player Index golden fixtures: 5
- runtime contract: 10
- validation: 20
- FACEIT V2 shell: 5

Static source scan для простых inline click handlers нашёл 50 уникальных имён; все 50 соответствуют объявленным функциям (DOM helper `$` — отдельный helper). Это не доказывает корректность выполнения handlers в browser runtime.

Последний подтверждённый quality gate: run `43094751757`, job `validate` success, commit `52e3a0b8`, 83 tests passed / 0 failed. После этого были только docs commits и auto journal; runtime не менялся.

Подробная сверка фактических 42 матчей / 93 карт, 11 aggregate sets, roster eligibility и спорных ELO правил: [FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md](FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md).
