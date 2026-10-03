# CS2 Analytics — полный аудит проекта / v50

## 1. Текущее состояние живой базы

Supabase project: `cs2-analytics` (`eu-west-1`), состояние `cs2_app_state` version **12**.

Live snapshot:
- 14 players total / 13 active
- 67 maps total / 61 active / 6 archived
- 33 matches total / 30 active / 3 archived
- 62 detailed maps + 5 compact maps
- 7 BO1 + 26 BO3, BO5 пока нет
- 1 admin Auth account

RLS для `cs2_app_state` сейчас настроен: public/authenticated SELECT, authenticated-admin INSERT/UPDATE.

## 2. Что уже синхронизировано

Локальный fallback проекта подтянут к live-state:
- добавлен архивный `match_local_1790694105818` + его карта;
- добавлены `Romanchestr`, архивный `player_new` и `FLAFF1X`;
- compact `match_062`/`match_063` и карты 62–66 отмечены как archived, как в live DB;
- `data_embedded.js` и `supabase_state_seed.json` пересобраны;
- добавлен `DB_SYNC_QA_v50.js`.

Проверка синхронизации: PASS.

## 3. Критические проблемы данных

### P0/P1 — команды матчей не записаны
Все 33 live match records сейчас не содержат полноценные `team_a`/`team_b` 5×5. Поэтому старые матчи нельзя честно показать как две команды.

Нельзя решать это через `первые 5 / последние 5`: это будет выдуманная команда.

Правильное решение: добавить в модель явный roster 5×5 и при вводе новой игры заставить админа выбрать Team A / Team B отдельно.

### P1 — детальные карты часто неполные
47 detailed maps имеют меньше 10 строк статистики.
Некоторые имеют 6–9 игроков.

Это не надо «дорисовывать». UI должен явно показывать `7/10`, `8/10`, `9/10` и не считать отсутствующих игроков нулевыми.

### P1 — 12 исторических строк без player_id
Основной нераспознанный raw name — `RomaFoma5` (12 строк), плюс `YAujeNEdevstvini` (1 строка).

Их нельзя автоматически привязать к существующему игроку без доказательства.

### P1 — compact BO3 содержит 2 неидентифицированных игрока
В aggregate stats встречаются `водка` / `Водка` и `flaffix` / `FLAFF1X` с `player_id:null`.
`FLAFF1X` уже существует как игрок, но историческая строка не привязана. Это можно исправить только детерминированно после подтверждения соответствия.
`Водка` пока остаётся отдельной неопознанной сущностью.

### P1 — две одинаковые записи Romanchestr
Есть `player_new` (архивирован) и активный `Romanchestr`, оба без истории.
Это не ломает статистику, но засоряет модель игроков.

Не удалять автоматически: сначала определить, нужен ли активный Romanchestr.

### P1 — исторические BO3 с 1:1
Есть минимум две старые записи BO3 с `1:1`.
Возможно, это реальные незавершённые/кастомные игры, а не ошибка. Нельзя переписывать их в `2:0`/`2:1` без исходника.

UI должен показывать такие серии как `1:1` без попытки назвать их победой/поражением.

### P2 — audit загрязнён тестовыми операциями
В `cs2_operations`/`cs2_audit_log` есть 3 `GPT_*_TEST` записи.
Это не ломает продукт, но для production audit trail это мусор.
Удалять их только после отдельного подтверждения.

## 4. Архитектура

### Что хорошо
- RAW DATA → derived metrics уже отделены логически.
- Player Index считается математически, а не хранится вручную.
- Есть Supabase Auth.
- Есть optimistic version check.
- Есть realtime subscription.
- Есть backup/import.
- Есть архив вместо опасного hard delete для исторических сущностей.
- Есть server-side validation в Edge Function.

### Что нужно переделать
1. Удалить hardcoded offline admin password — закрыто в текущем V52+ cleanup.
2. Сделать один понятный путь сохранения: Supabase API/RPC; direct browser UPDATE оставить только как временный compatibility layer.
3. Синхронизировать UI/API/DB модель команд.
4. Убрать дублирующиеся CSS overrides и собрать один canonical style layer.
5. Разделить UI state, domain state и persistence слой.
6. Сделать единый error boundary с понятными сообщениями.

## 5. Главная страница

Целевая композиция:
- слева: `Последняя игра` + `Последние игры`;
- центр: hero → 4 metric cards → Dynamics;
- справа: Top players → Latest news → небольшой CS2 info/promo блок.

Текущий код этого не даёт полностью: DOM и CSS используют reorder через grid, а metric cards существуют в CSS, но не всегда реально рендерятся.

Главную надо собрать заново на уровне markup, а не лечить ещё десятком CSS overrides.

### Что добавить
- явный статус последней игры;
- маленький score badge с цветом результата;
- 4 метрики под hero: Index / Impact / K/D / K-D;
- Top 5 с micro trend;
- Latest news без audit-мусора;
- map thumbnail + score в recent games;
- аккуратный `61 maps / 13 players / 30 active series` counter.

## 6. Навигация

Сейчас CSS перегружен последовательными переопределениями `.topbar`, `.nav-btn`, `.gear`.

Нужно:
- вкладки реально растянуть до gear;
- убрать вертикальные рамки вокруг gear;
- gear оставить как свободную кнопку без отдельной полоски;
- убрать desktop hover-подменю/подписи, если они не нужны;
- оставить активную синюю подсветку и тонкий underline;
- на mobile — горизонтальный скролл без ломания layout.

## 7. Матчи

### Исправить
- BO1 → только одна карта + score + две команды 5×5;
- BO3 → TOP-10 по всей серии, затем выбранная карта;
- не показывать K-D difference, если она не нужна в match UI;
- score colors: win/positive green, loss red, neutral white;
- K/D > 1 green, < 1 red, = 1 white;
- неполную статистику маркировать как partial.

### Новое добавление игры
Сейчас 10 игроков выбираются одной кучей, а `team_a/team_b` фактически зависят от порядка.
Это надо убрать.
Нужен UI:
- пул игроков;
- Team A — 5 слотов;
- Team B — 5 слотов;
- drag/drop или click-to-add;
- нельзя сохранить, пока 5+5 не заполнено.

## 8. Карты

Нужно сохранить:
- map cards;
- horizontal/vertical toggle;
- latest 10 detailed maps строго по времени/FIFO;
- click → full map detail;
- partial data badge;
- compact BO3 → только series aggregate, без выдуманной per-map статистики.

Map DNA стоит оставить только если он реально даёт пользователю ценность. Если оставляем — без длинного объясняющего вступления.

## 9. Игрок

Карточка должна быть максимально чистой:
- Player Index
- Impact
- Stability
- Form
- K/D
- K-D/map
- K/map
- A/map
- periods
- LOW / AVG / HIGH
- history variability

`Расчёт текущего темпа` из player card убрать из UI.

Формулу Index не менять:
- 35% K/D
- 25% K-D/map
- 15% Impact
- 10% Stability
- 10% K/map
- 5% Form

## 10. Почему Index

Сейчас есть хорошая идея, но блок должен показывать реальные значения конкретного игрока:
- Result effectiveness
- Impact
- Form
- Stability
- Volume
- Map factor
- Total

Никаких `—`, если значение можно вычислить из тех же raw data.

## 11. Динамика

Поддержать:
- 1–13 игроков;
- поиск;
- select all / reset;
- focus;
- K/D, K-D, Impact, Index, Form, Stability, K, D, A, AVG;
- checkpoints 10/20/30/40/50/60;
- green/red trend markers.

На главной график должен быть компактнее, чем на отдельной странице статистики.

## 12. Records

Селектор должен фильтровать на уровне series:
- Career
- BO1
- BO3

Для BO3 рекорды должны считаться по aggregate всей серии, а не по случайной карте.

Для compact BO3 нельзя притворяться, что есть per-map records.

## 13. Teams

Модель сейчас самая слабая часть продукта.
Нужна нормальная сущность roster:
- match_id
- team_a[5]
- team_b[5]
- source / confidence

Для старых матчей, где roster отсутствует, показывать `команды не записаны`, а не угадывать.

Для новых матчей roster должен быть обязательным.

## 14. Trash

Оставить archive/restore.
Permanent delete — только с двойным подтверждением.
Показывать compact красивыми series rows.

При удалении серии карта тоже должна корректно уходить в архив и возвращаться при restore.

## 15. Settings

Сделать максимально чисто:
- DB counters;
- add game;
- players/aliases;
- trash;
- backup export/import;
- cloud sync status;
- current version;
- last sync time.

History of changes — отдельный компактный блок, не смешивать его с public news.

## 16. UX / визуал

Сделать сайт «дорогим» не количеством эффектов, а системой:
- один radius system;
- один spacing system;
- один blue accent;
- зелёный/красный только для смысла;
- меньше рамок;
- больше воздуха;
- крупные цифры;
- короткие подписи;
- micro transitions 150–220ms;
- без тяжёлых glow в каждом блоке;
- одинаковые table row heights;
- sticky topbar;
- скрытый scrollbar только там, где прокрутка очевидна.

## 17. Технический долг

Основная проблема CSS — накопленные overrides: одни и те же selectors определены много раз.
Это уже мешает предсказуемо чинить homepage/nav/modal.

Также есть старый код `showTempo`, хотя UI-фича должна быть убрана из карточки игрока.

Есть смешение legacy localStorage/server sync/cloud sync.
Для release лучше оставить Supabase как source of truth, localStorage — только UI preferences/temporary draft.

## 18. Release-порядок

### Шаг 1 — data correctness
1. Team model.
2. Partial stats badges.
3. Player identity normalization.
4. Clean duplicate player draft.
5. Clarify 1:1 historical BO3.

### Шаг 2 — persistence/security
1. Remove hardcoded offline admin password.
2. One cloud commit path.
3. Audit cleanup.
4. Auth password protection.
5. Error/retry handling.

### Шаг 3 — UI rebuild
1. Home.
2. Nav/gear.
3. Match modal.
4. Player detail.
5. Records.
6. Map Lab.
7. Teams.
8. Settings.

### Шаг 4 — QA
- syntax
- data validation
- derived metrics
- create/edit/archive/restore
- BO1/BO3 filters
- team drag/drop
- modal scroll
- wheel scroll
- mobile
- desktop 1080p/1440p/4K
- Supabase read/write/realtime
- backup rollback

### Шаг 5 — release
Только после этого делать финальный ZIP.


## V50 WORK COMPLETED — 2026-09-30

### Product / UI
- Homepage rebuilt around the requested 3-column editorial dashboard: last game, recent games, hero, four KPI cards, dynamics, top players, news, and CS2 info block.
- Gear zone has no borders/stripes and navigation stretches across the available topbar space.
- Match lobby no longer invents 5v5 teams from row order. Missing historical team rosters remain explicitly marked as unknown.
- New match creation requires an explicit 5+5 team split; click cycle is A → B → remove.
- Existing matches with stored 5+5 teams can edit their rosters without affecting historical matches that lack team data.
- Detailed map pages now explicitly show partial-data warnings for fewer than 10 recorded players.
- Series detail warns when a BO3/BO5 aggregate is based on incomplete detailed maps.
- Player history now sorts the latest detailed maps chronologically by match time, then map index.
- Backup filename changed to CS2_ANALYTICS_backup_*.json.

### Cloud / security architecture
- Browser cloud writes now go through the protected `cs2-admin` Edge Function instead of direct table UPDATE.
- `cs2-admin` is now JWT-protected (`verify_jwt=true`), checks the authenticated user's email against `app_admins`, validates the full candidate state, then commits through the server-side `commit_cs2_state` RPC.
- Direct INSERT/UPDATE RLS policies on `cs2_app_state` were removed. Public/anonymous SELECT remains available.
- Direct authenticated EXECUTE on `commit_cs2_state` was revoked.
- Edge Function validation now understands BO5 and optional/explicit 5v5 rosters while preserving historical matches with no roster data.

### Database cleanup / sync
- Live Supabase state advanced to version 13.
- Added safe aliases `FLAFF1X -> FLAFF1X` and `flaffix -> FLAFF1X`; matching compact-series rows were linked to the existing player instead of remaining anonymous.
- Removed three known GPT smoke/realtime test operation/audit rows.
- No historical match was assigned a guessed team roster.
- Local seed, offline JSON and embedded fallback were synchronized to the current cloud dataset.

### QA
- `node --check app.js` PASS
- `node --check supabase_adapter.js` PASS
- `node --check data_embedded.js` PASS
- `CUSTOM_V50_QA.js` PASS
- `DB_SYNC_QA_v50.js` PASS
- `MECHANISM_QA_v39.js` PASS
- Chromium visual dump was attempted but the installed headless Chromium process hung in this container; therefore no false browser-visual PASS is claimed.

### Current cloud dataset
- Players: 14 total / 13 active
- Maps: 67 total / 61 active / 6 archived
- Matches: 33 total / 30 active / 3 archived
- BO1: 7
- BO3: 26
- BO5: 0


## V51 polish pass — 2026-09-30
- Removed duplicate runtime definitions of `nav()` and `render()`; syntax and lifecycle QA remain green.
- Added keyboard navigation: Escape closes the top modal; `/` and Ctrl/Cmd+K focus player search outside text-entry controls.
- Added focus-visible treatment, smooth scrolling, reduced-motion handling and mobile-safe navigation/table overflow.
- Corrected PWA/page metadata from legacy CS5 naming to CS2 Analytics and added local favicon.
- Preserved all V50 data/security semantics: explicit 5×5 assignment for new matches, no guessed historical teams, partial-data warnings, server-side cloud write path.
- No Player Index formula, source data, historical team inference, or derived-stat methodology changed in this pass.
