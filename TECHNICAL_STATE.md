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
