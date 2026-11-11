# FACEIT V2 — runtime и UI контрольная точка

Дата: 2026-11-11  
Ветка: `faceit-dev`  
Production: не затрагивался

## Восстановление runtime

- Runtime восстановлен из последнего сохранённого полного snapshot `3b680400` отдельным commit `c8ee8cd8776bd4fc113d88a1531b5596db8fb45e`.
- Возвращено 71 выбранное runtime/test/data/config file; текущие документы проекта сохранены.
- DEV config проверен: `https://nwujudniysolpevbtggd.supabase.co` (проект `cs2-faceit-dev`).
- Никакие SQL migrations не запускались; Supabase данные не изменялись.
- `main` не изменялся.

## FACEIT V2 shell — первый рабочий срез

Кодовые изменения:
- `app_v57.js`: commit `390a580d53bda0263342b884951d47cb065388b0`.
- `account_module.js`: unlinked account/profile gate перенесён внутрь общего shell.
- `style_v57.css`: добавлен layout общего shell и responsive nav rules.
- `tests/faceit-v2-shell.test.cjs`: добавлены проверки маршрутов и shell contract.

Теперь существующие страницы рендерятся внутри общей profile-inspired оболочки:
- Overview / Home
- Players
- Matches / Series
- Maps
- Teams
- Records
- Seasons
- Profile
- Settings

Навигация находится в левой панели. Верхняя дублирующая навигация отключена; в верхней полосе остаются бренд, account menu и shortcut настроек. Profile page использует ту же левую навигацию, что и остальные разделы. Для остальных страниц общий shell содержит player/account sidebar и центральный route container.

В профиле:
- оставлены рабочие вкладки Overview и Match history;
- убраны неработающие social/matchmaking placeholders (Friends, Videos, Guestbook, Inventory, Clubs, Matchmaking, Leagues, Tournaments);
- убраны декоративные элементы левого/правого rail (Play, Feed, Clubs, Missions, Store, Premium и правые иконки);
- для владельца профиля доступны отдельные действия редактирования avatar и cover;
- shortcut «Статистика игрока» ведёт в Players.

## Проверки

<badge>Green CI</badge>

- Workflow: https://github.com/nonspam/cs2-5x5/actions/runs/43091902336
- Commit: `390a580d53bda0263342b884951d47cb065388b0`
- `npm run check`: syntax checks + Node tests.
- Итог: **83 passed, 0 failed**.

Промежуточные commits до исправления кавычек в HTML handler имели failed CI. Причина локализована по GitHub Actions logs, исправлена переходом на `data-app-route` и общий binder. Финальный проверенный code commit — `390a580d`.

## Что пока НЕ подтверждено / не готово

- Cloudflare deployed SHA не подтверждён.
- DEV workers.dev endpoint не открылся через доступный web reader; browser QA не выполнен.
- Desktop/tablet/mobile проверены только на уровне CSS rules и regression contract, не визуальным browser run.
- Полный аудит всех controls каждой страницы ещё не завершён; наличие старой страницы в router не означает, что каждый её control проверен.
- Track пока не имеет рабочей страницы и поэтому намеренно не добавлен в навигацию.
- Seasons остаются частично реализованным разделом: Season 1 — placeholder/preparation, полноценного lifecycle/rollover ещё нет.
- ELO V3 отображается и имеет тесты, но бизнес-правила/калибровка/сезонные reset требуют отдельной проверки и согласования.
- Единство всех метрик между страницами ещё не доказано полным data reconciliation.

## Следующие задачи

1. Проверить Cloudflare deployed SHA и реальный DEV в браузере.
2. Провести полный inventory всех controls и маршрутов, включая мобильное меню.
3. Проверить back/forward navigation, auth, public profile, own profile, player details и match details.
4. Убедиться, что старые разделы корректно вписываются в общий shell, нет overflow и дублирующих заголовков.
5. Сверить расчёты ELO, winrate, K/D, impact, records и match history на общих fixture/data sets.
6. Реализовать Track как реальную функцию и полноценные сезоны только после audit.
7. Сезонный lifecycle, calibration и rollover строить поверх проверенной общей модели.

## Важная архитектурная оговорка

Это первый интеграционный срез, а не окончательная переработка frontend architecture. Основная логика всё ещё находится в большом `app_v57.js` monolith. Shared shell использует текущий `state.tab` и существующие page renderers. Не переписывать весь runtime с нуля; сначала закрепить поведение browser tests, затем выделять router/components поэтапно.
