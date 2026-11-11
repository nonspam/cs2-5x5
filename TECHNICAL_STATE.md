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
