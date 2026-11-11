> **Исторический отчёт — не использовать как текущий статус.** Этот документ описывает branch snapshot `25dcab8` до восстановления runtime. Позже runtime был восстановлен в `faceit-dev` из `3b680400`, затем интегрирована общая shell prototype. Текущий runtime, CI и DEV состояние описаны в [актуальном read-only аудите](FACEIT_V2_READONLY_AUDIT_2026-11-11.md), а фактическая сверка dataset/ELO — в [аудите целостности данных](FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md). Сохранён только как историческая запись о причине восстановления; рекомендации «восстановить runtime» уже выполнены и не являются следующей задачей.

---

# Аудит перехода на FACEIT-style DEV — 2026-11-11

## Статус и границы проверки

Проверка выполнена только чтением GitHub и DEV Supabase. Код, ветки, миграции и данные не изменялись. `main` и production Supabase не затрагивались.

- Repository: `nonspam/cs2-5x5`
- Default branch: `main`, не изменять без отдельного разрешения.
- Рабочая ветка: `faceit-dev`
- Текущий HEAD ветки на момент проверки: `25dcab800a478e72e6da8a19e524303a45fff6e1`
- Последний полный runtime snapshot: `3b680400fdfaae5805fff8e4e862dd568578c9ff`
- Документационный commit, после которого исчез runtime из текущего дерева: `4c4274b7a640d62d0484b2555fac55842490b384`
- DEV URL: https://cs2-analytics-dev.z2z2djt852.workers.dev/
- DEV Supabase project: `cs2-faceit-dev`, ref `nwujudniysolpevbtggd`

## Критическое расхождение Git

Сравнение полного дерева runtime commit `3b68040` с текущим HEAD `25dcab8` показало:

- В runtime commit: 195 файлов.
- В текущем дереве: 11 файлов.
- Удалено из текущего дерева: 195 файлов, включая `index.html`, `app_v57.js`, `style_v57.css`, `account_module.js`, `supabase_adapter.js`, `validation.js`, `package.json`, тесты, миграции, ассеты и Cloudflare deployment notes.
- Добавлено вместо них: 11 файлов документации и project-memory workflow.
- Код не потерян из Git history: он доступен в родительском runtime commit `3b68040`.

Commit `4c4274b` называется `docs: establish persistent project memory and auto journal`, но его diff удаляет runtime и quality-gate workflow. Это критическое состояние ветки, а не штатная миграция движка. Причину появления массовых удалений необходимо разобрать; не скрывать и не считать удалённые файлы восстановленными только потому, что они остались в истории.

Текущий HEAD не содержит приложения и не имеет `package.json` или `quality-gate.yml`. Последний подтверждённый успешный quality gate относится к runtime commit `3b68040`: workflow run https://github.com/nonspam/cs2-5x5/actions/runs/42934830245 (78 passed, 0 failed по историческому отчёту). Это не подтверждает качество текущего HEAD или текущего деплоя.

В GitHub найдено только одно открытое PR — #2, старое исправление backup/data-safety в сторону `main`. Отдельного PR «нового движка» для принятия не найдено. Не выполнять merge в `main`.

## Что на самом деле представляет собой аккаунт / «новое приложение»

В runtime commit `3b68040`:
- `index.html` подключает обычный browser SPA на vanilla JS: `app_v57.js`, `style_v57.css`, `supabase_adapter.js`, `elo_v3.js`, `account_module.js`.
- `manifest.json` содержит `display: standalone`: установленная PWA может открываться отдельным окном без браузерной панели. Это объясняет app-like запуск, но само по себе не означает новый frontend framework или новый backend engine.
- `account_module.js` реализует модальное окно внутри того же приложения: регистрация/вход Supabase Auth, восстановление/смена пароля, одноразовый invite и привязка аккаунта к player_id.
- Следовательно, это новая account/PWA возможность поверх существующего SPA, а не отдельное приложение-движок. Если пользователь наблюдает иной экран/поведение, требуется отдельная проверка актуального deployed build.

## Фактическая функциональность UI в runtime commit 3b68040

Глобальная навигация: Home, Statistics, Matches, Maps, Teams, Records, Seasons; Settings отдельно. Внутренние маршруты отображаются через общий JS render switch.

- Профиль игрока имеет FACEIT-inspired shell и отдельный профильный history view.
- Таблицы игроков, матчей/серий и карт содержат кликабельные строки/переходы к деталям.
- В профиле последние матчи и полная история связаны с деталями матчей.
- FACEIT-подобная левая rail содержит декоративные/неподключённые кнопки Play, Rank, Track, Feed, Clubs, Create Club, Missions, Store, Premium. Не считать их работающими.
- Отдельной рабочей страницы Track в глобальном render switch нет.
- Seasons существуют как страница, но «Season 1» помечен как подготовка/ещё не начался; это placeholder, а не полноценная система сезонов.
- FACEIT shell пока ограничен страницей профиля; весь сайт не переведён на единый FACEIT shell.
- CSS отвечает за визуальную оболочку. Реальная кликабельность, переходы, состояние и данные требуют JS handlers/router и backend/data contracts; одним CSS функциональность не реализовать.

## DEV Supabase — read-only проверка

Проект `cs2-faceit-dev` активен и healthy, регион `eu-west-1`, PostgreSQL 17.11.

Текущее состояние `public.cs2_app_state`:
- version: 156
- players: 14
- matches: 42
- maps: 93
- player_profiles: 14
- linked player accounts: 1
- active, unclaimed, unrevoked invites: 0

Это означает, что DEV database уже содержит скопированную базу матчей/игроков и профили. Повторный массовый импорт данных на этом этапе не нужен; сначала надо восстановить и проверить runtime, подключённый к этому DEV project ref.

В БД применено 10 миграций, включая:
- clone/base schema alignment;
- grants/indexes для DEV;
- player profiles и shared media;
- invite-only account linking;
- проверку активности игрока при claim;
- перенос account helper functions в private schema.

Storage bucket `cs2-player-media` публичен на чтение, лимит 5 MiB, разрешены JPEG/PNG/WebP/GIF. INSERT/UPDATE/DELETE ограничены папкой текущего auth user id.

RLS:
- `cs2_app_state`: публичное чтение.
- `player_profiles`: публичное чтение, UPDATE только связанного игрока и с проверкой owner-пути avatar/cover.
- `player_account_links`: пользователь читает только свою связь.
- `player_account_invites`: RLS включён, policies отсутствуют, grants anon/authenticated отозваны; доступ только серверной роли/privileged helpers.

Supabase advisors:
- WARN: leaked password protection выключен.
- WARN: authenticated role может вызывать SECURITY DEFINER `commit_cs2_state` и `is_cs2_admin`; anon execute отсутствует. `commit_cs2_state` проверяет admin allow-list через `is_cs2_admin`, но перед расширением account/security модели нужен отдельный security review.
- INFO: RLS enabled without policies для нескольких закрытых admin/operation tables; проверить фактические grants, не открывать их публично.
- INFO: два неиндексированных FK в `private.player_account_invites` (`created_by`, `claimed_by`).
- INFO: несколько unused indexes; не удалять без анализа реальной нагрузки.

Никаких SQL writes, миграций, деплоев или изменений данных в этой проверке не выполнялось.

## Что не удалось подтвердить

- Фактический Cloudflare deployed commit SHA и состояние Workers URL: нет прямого доступа к Cloudflare deployment control plane в этой проверке.
- Browser QA текущего DEV URL: веб-инструмент не смог открыть workers.dev endpoint.
- Что текущий DEV deployment действительно соответствует runtime commit `3b68040`.
- Что новый app-like экран, который видит пользователь, совпадает с сохранённым PWA manifest/runtime.

Так как Cloudflare deployment notes и frontend entrypoint удалены из текущего дерева, проверка фактического deployed SHA — blocker перед любым слиянием/переносом.

## Рекомендуемый порядок

1. Восстановить runtime-файлы из commit `3b68040` в `faceit-dev`, сохранив текущие документы памяти. Не менять `main` и production Supabase.
2. Проверить diff восстановления и убедиться, что DEV config по-прежнему указывает только на `nwujudniysolpevbtggd`.
3. Запустить `npm run check`, восстановить quality-gate workflow и получить свежий green CI на новом HEAD.
4. Подтвердить deployed Cloudflare SHA, открыть DEV на desktop/mobile и пройти account/profile/navigation flows.
5. После baseline QA спроектировать единый app shell/router и реальную карту маршрутов: Home, Players, Profile, Matches/Series, Maps, Track, Seasons, Records, Settings.
6. Для каждой вкладки определить реальные действия и data contract. Удалить или связать все декоративные FACEIT controls; не маркировать placeholders как готовые.
7. Развивать UI по одной странице/сценарию с regression tests. CSS — визуальная система; JS/router — клики и переходы; Supabase — авторизация, хранение и данные.
8. Лишь после проверенного UI и data mapping решать, нужны ли дополнительные data migrations. DEV уже содержит 42 матча, 93 карты и 14 игроков.
9. Только после согласованного DEV acceptance — отдельно обсуждать перенос/merge в production. Production branch/database остаются неприкосновенными до явного разрешения.

## Контрольная точка

На момент этого аудита изменений кода/БД не внесено. Главный blocker — восстановление 195 runtime-файлов в `faceit-dev` и подтверждение deployed SHA.