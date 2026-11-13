
## 2026-11-13 — ELO reset to 1000 and profile history cleanup

- ELO V3 now initializes every non-deleted player at 1000 and replays only matches with a reliable played/created timestamp at or after 2026-11-13 03:08:26 (UTC+03:00). All earlier match history remains intact for match/statistics pages but no longer affects the new ELO rating, ranks, or ELO chart. New matches with no usable timestamp are excluded until timestamped.
- Removed the separate "Матчи" count row from the profile "История игры" card; the "Карты" count remains.
- Refreshed JS cache keys and added static regression tests. No database rows or historical match data were modified. Browser QA and live DEV deployment are not verified.


## 2026-11-13 — BO3 Top K/D row colors

- In the dedicated BO3 Top table, K/D above 1 colors K through +/− green; K/D exactly 1 keeps those cells white; K/D below 1 colors them red.
- Player name and AVG remain unchanged. No WG/AVG styling, match-home behavior, database logic, or other sections were changed.
- Added static regression contracts and refreshed app/CSS cache keys. Browser QA and live DEV deployment are not verified.


## BO3 scope guard — 2026-11-13

The series Top 10 panel is now gated to `format === BO3` (case-normalized). It is not rendered for BO1 or BO5 matches, avoiding a misleading BO3 label on other formats. Added a static contract for the format guard.


## Quality Gate contract cleanup — 2026-11-13

The second run (`43325873217`) narrowed the remaining failures to two more stale Match Overview assertions: old K/R and HS% labels and a removed placeholder sentence about server/veto probabilities. The current UI only exposes ADR among those career labels and correctly states that veto data is absent when not supplied. Updated the contracts to match this source-backed behavior; re-run pending.


## Quality Gate follow-up — 2026-11-13

The first run after the feature commit (`43325544240`, 187/191) exposed four stale contract assertions rather than runtime syntax failures: a removed Statistics tab was still expected in Match Center, two tests used a malformed regex for the current W/L expression, and a map-team test expected a removed alias helper variable. Updated these tests to assert the active Overview-only contract and the current unique-alias resolver. Re-run pending.


## 2026-11-13 — Match Overview follow-up: BO3 Top 10, map image layering, profile ELO match links

- Added a series-wide Top 10 K/D panel to Match Overview using `seriesAggregateRows` output only. Best, median-position and worst entries are labelled; zero-death positive-kill rows display `∞`; incomplete sources are explicitly shown as fewer than 10 rather than filled with invented values.
- Corrected map artwork stacking: the map image layer is now above the tile background, the contrast overlay above the image, and labels/scores above the overlay. The map results section now carries the `match-room-center` hook required by its existing full-bleed artwork styles.
- Fixed profile ELO tooltip match navigation to resolve the canonical `DB.matches[].match_id` before calling the strict match lookup. If no match is found, the user receives an explicit message instead of a silent no-op.
- Updated a stale static assertion to target the current unique-alias helper and added regression contracts for Top 10, map artwork hook/layering, and ELO match-id resolution. No browser QA performed; CI is the next verification.
# Current technical checkpoint — 2026-11-11 (authoritative)

> This section supersedes older checkpoint snapshots further down this file. Historical entries are retained as a change record, not as the current state.

## Latest Match Overview checkpoint — 2026-11-12

- Working branch: `faceit-dev` only. Last source implementation commit: `0b9051d9c4c0b090c91382976d6831f6a1d04ca9`; CSS commit: `f71fb7e58bf74ad3ee48834807c7ea0e645a8287`; contract test commit: `8adb0537fd758141068d6b11edeb20040a6c03d8`. Documentation was subsequently updated; re-check branch HEAD before the next write.
- Owner supplied a readable FACEIT match-room HTML/CSS attachment. Analysis and data mapping: [Match Overview reference analysis](docs/MATCH_OVERVIEW_REFERENCE_ANALYSIS_2026-11-12.md).
- Overview source changes: match-room nav/tabs, match metadata, score card, roster headings and center match info/map list. Current average ELO is derived from known current CS2EloV3 player ratings and explicitly labelled current, not historical.
- The supplied DOM includes browser-extension injected analytics (fc-strip/fc-note/faceit-lobby-stats/fc-plate/forecast). Do not treat these as native FACEIT elements or import their sample metrics.
- Only `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs` and documentation were changed. Statistics renderer remains unchanged.
- JavaScript and test source syntax compilation passed in the connector runtime. Full `npm run check` / GitHub Quality Gate for these commits is not confirmed yet.
- No browser QA, deployment, DB writes, SQL, migrations, schema/RLS/grants changes, `main`, or production changes were performed.
- Next: verify Quality Gate, fix any failures, then request owner visual acceptance. Do not start Statistics until the owner approves Overview.


- Working branch: `faceit-dev`; do not change `main`.
- Runtime restored from the full snapshot and integrated into a shared profile-inspired shell. The shell is a technical prototype, not an approved final design.
- User workflow: work autonomously in larger batches; avoid micro-updates. Request HTML/CSS/screenshots only when a specific section is ready for owner-directed visual implementation. Do not invent section design.
- Runtime remains a vanilla JS SPA centered on `app_v57.js`; browser QA and Cloudflare deployed SHA are not verified.
- CSS readiness checkpoint (2026-11-12): about 80% of technical prep before owner-directed visual CSS is complete; final approved FACEIT visual work is only 5–10%. [CSS/cascade audit](docs/FACEIT_V2_CSS_READINESS_AUDIT_2026-11-12.md).
- DEV Supabase ref: `nwujudniysolpevbtggd`. State: v156, 14 players, 42 matches, 93 maps, 14 profiles, 1 auth user.
- DEV Edge Function `cs2-admin`: active version 3, deployed from `faceit-dev`; current full state validates with zero errors. No database/schema writes were performed.
- Source test suite has 100 cases. GitHub Actions quality gate passed on commit `2fcabef0bca7076da77c214b87f0e26075605d97`: 100 passed / 0 failed. [CI run](https://github.com/nonspam/cs2-5x5/actions/runs/43100294912).
- Fixed on `faceit-dev`: blank optional `played_at` validation; `manual_edit` team provenance; player create/archive/restore status consistency.
- Key unresolved product decisions: BO3 1:1 after two maps (draw vs incomplete); whether to derive a series roster from map-level rosters when series roster is incomplete; canonical chronological order for ELO when dates are missing.
- Track absent; Season 1 remains placeholder. Do not implement lifecycle or change ELO rules until decisions are approved.
- Account/invitation/profile security review: [account security audit](docs/FACEIT_V2_ACCOUNT_SECURITY_AUDIT_2026-11-11.md).
- Security and performance review: [DEV Supabase security audit](docs/FACEIT_V2_SECURITY_AUDIT_2026-11-11.md).
- Migration reproducibility blocker: [DEV migration/schema drift](docs/FACEIT_V2_MIGRATION_DRIFT_2026-11-11.md).
- Full runtime/Supabase audit: [read-only audit](docs/FACEIT_V2_READONLY_AUDIT_2026-11-11.md).
- Data/ELO and validation audit: [data integrity audit](docs/FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md).
- Route/action map: [route inventory](docs/FACEIT_V2_ROUTE_INVENTORY_2026-11-11.md).

---

# Актуальная контрольная точка — FACEIT V2 (2026-11-11)

Эта секция новее исторических snapshots ниже и отражает текущее состояние после восстановления runtime и первого прохода объединения shell.

- Repository: `nonspam/cs2-5x5`
- Working branch: `faceit-dev` only.
- Current docs HEAD at this checkpoint: `e401dfbbc130d1242d5318dd69e06f3b5f4779f1`.
- Runtime recovery commit: `c8ee8cd8776bd4fc113d88a1531b5596db8fb45e` (71 selected files restored from snapshot `3b68040`).
- FACEIT V2 shared-shell code commit: `390a580d53bda0263342b884951d47cb065388b0`.
- DEV Supabase project ref: `nwujudniysolpevbtggd`; `supabase-config.js` checked and still points only to this DEV project.
- Production `main` and production Supabase were not modified. No SQL migrations or database writes were executed.
- Quality gate on code commit `390a580d`: **83 passed, 0 failed**. Run: https://github.com/nonspam/cs2-5x5/actions/runs/43091902336.
- Current source files: `app_v57.js`, `style_v57.css`, `account_module.js`, `supabase_adapter.js`, `validation.js`, `elo_v3.js`, `data_embedded.js`.
- The FACEIT-inspired profile shell is now the shared app shell for existing routes. Left rail routes: Overview, Players, Matches, Maps, Teams, Records, Seasons, Profile, Settings. The duplicate top navigation is disabled.
- Profile currently exposes Overview and Match history. Non-working social/matchmaking placeholders and decorative FACEIT rail items were removed.
- Track is not yet a working route and is intentionally not exposed. Season 1 remains a placeholder; full season lifecycle and rollover are not implemented.
- `app_v57.js` remains a large monolith; this is an incremental shared-shell refactor, not a framework rewrite.
- Cloudflare deployed SHA and real browser QA are **not verified**. The workers.dev URL could not be opened by the available web reader. Do not claim deployment or visual QA.

Detailed implementation checkpoint: [docs/FACEIT_V2_RUNTIME_AUDIT.md](docs/FACEIT_V2_RUNTIME_AUDIT.md).  
Product direction and acceptance criteria: [docs/FACEIT_V2_PRODUCT_BRIEF.md](docs/FACEIT_V2_PRODUCT_BRIEF.md).

---

# Текущее техническое состояние

Изменяемый снимок. Перед использованием сверять с GitHub, CI и DEV.

## Контрольная точка — 2026-11-11
- Repository: nonspam/cs2-5x5
- Branch: faceit-dev
- HEAD до добавления энциклопедии: 3b680400fdfaae5805fff8e4e862dd568578c9ff
- GitHub default branch: main; не использовать для текущих задач без разрешения.
- DEV: https://cs2-analytics-dev.z2z2djt852.workers.dev/
- DEV Supabase ref, указанный в DEV deployment docs: nwujudniysolpevbtggd.
- Последний известный quality gate для исходного HEAD: 78 passed, 0 failed. Run: https://github.com/nonspam/cs2-5x5/actions/runs/42934830245
- Browser screenshot QA именно последнего profile shell не подтверждён.
- Deployment SHA последнего profile shell не подтверждён.

## Последняя известная FACEIT-inspired реализация
В app_v57.js добавлен scoped profile shell: глобальная левая навигация, колонка игрока, центральные tabs/CS2 subnav/rating/recent results/graph/metrics и правая utility rail. CSS находится в style_v57.css, cache key в index.html. Используются реальные переменные профиля; часть вкладок/разделов — disabled placeholders. Перед изменениями открыть актуальный код и проверить фактический DOM/handlers.

## Исторические источники
docs/ENGINEERING_BASELINE.md, docs/DATA_MODEL.md, docs/PROJECT_CHECKPOINT_2026-10-22.md, docs/ROADMAP_NEXT_PHASES_2026-10-22.md, FULL_SITE_AUDIT_V58_3.md, PROJECT_FULL_AUDIT_v50.md и DEV_COPY_STATUS.md содержат полезные аудиты. Их цифры/версии/DB counts — исторические snapshots, не текущие факты без повторной проверки.

## Команды
Требуется Node.js >=20.
~~~bash
npm run check
~~~
Выполняет syntax checks и node --test tests/*.test.cjs.

## Следующие проверки
- Убедиться, что branch/HEAD ожидаемые.
- Проверить index.html и порядок runtime assets.
- Выполнить реальный browser QA profile shell, responsive breakpoints, overflow и доступность controls.
- Не выдавать disabled tabs за готовые страницы.
- Перед DB задачами проверить project ref; сначала read-only.
- После документационного commit проверить CI workflow.
- Deployment проверять по Cloudflare deployment SHA и открытию DEV URL.


## Актуализация по состоянию на 2026-11-11, после повторной проверки GitHub
Последний найденный commit в faceit-dev: `03915654cc37f173772130356a6cba83009581cf` — bust cache for impact score and winrate interaction update (2026-11-09 15:48:19Z). Предыдущий commit: `c5cb7cab14a40e3aeeb6ab74d323a2b2e422cffe` — Rework impact score and static winrate leaderboard.

Следовательно, ранее записанный HEAD `3b680400fdfaae5805fff8e4e862dd568578c9ff` — историческая контрольная точка profile shell, не текущий HEAD. Указанные 78 passed / 0 failed относились к workflow для старого SHA и не подтверждают тесты актуального HEAD. Для commit 03915654 в проверке combined status вернулся пустой statuses array; это не доказательство успешного или неуспешного CI. Browser QA и deployment SHA актуального HEAD не подтверждены.

Подробная история исследования FACEIT, включая то, почему screenshot-only подход не сработал и почему переход к реальному HTML/CSS стал переломным моментом: [FACEIT_REFERENCE.md](FACEIT_REFERENCE.md).

## Дополнение — аудит engine/merge 2026-11-11

- Текущий branch HEAD на момент аудита: 25dcab800a478e72e6da8a19e524303a45fff6e1.
- Текущий tree содержит только 11 файлов документации/workflow; runtime отсутствует.
- Сравнение с полным runtime commit 3b680400fdfaae5805fff8e4e862dd568578c9ff: 195 runtime files отсутствуют в текущем tree, но доступны в Git history.
- Коммит 4c4274b7a640d62d0484b2555fac55842490b384 добавил project-memory docs и одновременно удалил runtime/quality-gate artifacts из tree.
- Последний подтверждённый успешный quality gate — commit 3b68040, run 42934830245; он не проверяет текущий HEAD.
- DEV Supabase cs2-faceit-dev активен: state v156, 14 players, 42 matches, 93 maps, 14 profile rows, 1 linked account, 0 active invites.
- DEV уже содержит копию данных; повторный массовый импорт не нужен до проверки runtime.
- Подробный read-only отчёт: docs/ENGINE_MIGRATION_AUDIT_2026-11-11.md.
- Cloudflare deployed SHA и browser QA текущего DEV URL не подтверждены.
- Следующий blocker: восстановить runtime из 3b68040 в faceit-dev, сохранив документацию, затем CI и browser/deployment QA.


---

# Актуальная контрольная точка — Match Center (2026-11-12)

Подробный handoff: [docs/MATCH_CENTER_CHECKPOINT_2026-11-12.md](docs/MATCH_CENTER_CHECKPOINT_2026-11-12.md).

- Последняя композиция обзора по FACEIT Match Room reference: `a22a1f6640d6578d42732893acc4b85fc1db6965`.
- Последний source/test SHA с успешным Quality Gate: `6cd35f76c29007dfa27ee8d2ab322d4b8ca36d96`; 182 passed / 0 failed; [run 43258651699](https://github.com/nonspam/cs2-5x5/actions/runs/43258651699).
- Исправление `CS2EloV3.player(id)` вместо отсутствующего `playerData(id)` сохранено в `2232bc2a4c0d7aeb6b4e892023d9d0a9451638f8`.
- Референс владельца: `design-references/inbox/image.png`.
- Browser QA, визуальная приёмка владельцем и deployment SHA не подтверждены.
- Следующее действие: получить визуальную обратную связь владельца по DEV Match Center, затем итеративно исправлять отмеченные отличия.

## 2026-11-12 — Match Center reference pass 2
Владелец загрузил два новых эталона: `design-references/inbox/1.png` (MVP + четыре award rows) и `design-references/inbox/2.png` (компактная карточка игрока). Реализовано в `app_v57.js` и `style_v57.css`:
- Veto/map list теперь компактные прямоугольные строки: квадратная миниатюра, имя карты, счёт справа; старые большие map cards с подвалом MVP/coverage убраны из обзора.
- Игрок в Match Center: квадратный аватар, ник, текущий CS2EloV3 rating и level, ниже компактные карьерные метрики.
- В Statistics добавлен крупный MVP-блок и четыре award строки: kills выводится из подтверждённых aggregate K/D/A; damage, KAST и entry kills пока помечены как недоступные, так как источник их не содержит.
- MVP пока выбирается детерминированно по убийствам, при равенстве — по K/D; это временный явный критерий, не полноценная оценка влияния.
- Contract tests обновлены под новую структуру.
Quality Gate: commit `2855accc3f83fb9a4110293a4d63e6f2a9cca7e1`, run https://github.com/nonspam/cs2-5x5/actions/runs/43261367570, 183 passed / 0 failed.
Не выполнялись browser QA и deployment; визуальная приёмка владельцем ожидается. Не менять main/production/DB.


## Контрольная точка — 2026-11-12, Match Overview handoff
- Последний известный `faceit-dev` HEAD перед этим документированием: `5510c34a96a33a84a96d8ad171f76b660e54d307`; перепроверить HEAD перед любыми изменениями.
- Текущий фокус: получить читаемое содержимое HTML/CSS-референса `матч внутри,обозр и стата.txt`, загруженного в default/main коммитами `64a081d` и `eac20e9`. Connector вернул пустой файл; анализ исходника ещё не выполнен.
- План: (1) Match Overview only; (2) после согласования Overview — Statistics отдельным этапом.
- Не переносить upload-коммиты в `faceit-dev` до чтения и проверки файла.
- Ранее сделанная работа Match Center и CI 183/183 описаны в [docs/MATCH_CENTER_CHECKPOINT_2026-11-12.md](docs/MATCH_CENTER_CHECKPOINT_2026-11-12.md) и [docs/MATCH_OVERVIEW_HANDOFF_2026-11-12.md](docs/MATCH_OVERVIEW_HANDOFF_2026-11-12.md).
- Browser QA/deployment не подтверждены. DB writes/schema/migrations запрещены без отдельного разрешения. Только `faceit-dev`; не менять `main`.


## Контрольная точка — 2026-11-12, Match Overview handoff
- Последний известный HEAD до обновления handoff: `5510c34a96a33a84a96d8ad171f76b660e54d307`; перепроверять актуальный HEAD перед изменениями.
- Новый upload `матч внутри,обозр и стата.txt` присутствует в default/main в коммитах `64a081d` и `eac20e9`. Connector вернул пустое содержимое, поэтому HTML/CSS ещё не изучены.
- Следующий этап: получить читаемый файл; реализовать только Match Overview; после согласования отдельно заняться Statistics.
- Не переносить upload-коммиты в `faceit-dev` до чтения и проверки файла.
- Handoff: [docs/MATCH_OVERVIEW_HANDOFF_2026-11-12.md](docs/MATCH_OVERVIEW_HANDOFF_2026-11-12.md).
- Browser QA/deployment не подтверждены. DB writes/schema/migrations запрещены без отдельного разрешения. Только `faceit-dev`; не менять `main`.

 
## 2026-11-13 — Match Center Top tab and profile ELO point interaction
- `faceit-dev` removes the BO3 Top 10 block from Overview and exposes a dedicated TOP tab beside Overview.
- TOP table uses aggregate BO3 statistics and resolved player names; columns K/D/A/KD/+/−/AVG, with AVG explicitly calculated as kills per series map. BEST/BAD endpoints only; no MEDIAN/WORST.
- Profile ELO point interactions use delegated capture-phase click/keyboard handling and a 28px nearest-point hit test; SVG hit radius increased.
- `index.html` asset cache key bumped to `faceit-profile-match-top-elo-hitfix-20261113-v1`.
- Tests added/updated in `tests/faceit-v2-shell.test.cjs`.
- CI/browser QA/deployed SHA are not confirmed. No DB writes, SQL, schema/RLS/grants/migrations, main, or production changes.


## 2026-11-13 — Statistics player table: remove Matches column
- Corrected the **СТАТИСТИКА ИГРОКОВ** table in `players(v)`: removed the Matches header and per-player match-count cell; Maps remains the first gameplay count column.
- Did not alter profile `gameHistory`, other statistics, sorting, aggregates, or match data.
- Added a focused regression contract in `tests/faceit-v2-shell.test.cjs` and bumped the app JS cache key to `faceit-statistics-maps-only-20261113-v1`.
- Updated only `faceit-dev`; no DB writes, SQL, migrations, schema/RLS/grants, `main`, production, browser QA, or deployment.


## 2026-11-13 — Map catalogue card sizing correction
- Removed the forced 1:1 card aspect ratio that left a large empty black area below the 104px map image.
- Map catalogue cards now use content height with a 150px desktop image and 120px image on narrower layouts; grid remains five columns on wide desktop with existing responsive breakpoints.
- Added a CSS regression contract and bumped the app cache key to `faceit-map-cards-compact-20261113-v1`.
- Only `faceit-dev`; no data, DB, SQL, schema/RLS/grants, `main`, production, browser QA, or deployment changes.


## 2026-11-13 — Lime accent for section headers and active controls
- Applied a shared lime accent (`#b8ef45`) to the primary section header strips for Player Statistics, Matches/Series, Teams, Records, and Maps.
- Adjusted header padding and title/subtitle insets so page titles no longer sit flush against the strip edge.
- Highlighted active toolbar controls and the selected map card / selected-map subheader with the same lime treatment; ordinary data colors and table content remain unchanged.
- Bumped `style_v57.css` cache key to `lime-section-headers-20261113-v1`; added CSS regression contracts.
- Only `faceit-dev`; no DB/data writes, SQL, migrations, schema/RLS/grants, `main`, production, browser QA, or deployment.
