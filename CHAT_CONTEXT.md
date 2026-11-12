# Сохранённый контекст обсуждений проекта

Этот файл хранит только проектные выводы и решения, которые помогают продолжать работу. Это не полная стенограмма чатов и не архив личной переписки.

## 2026-11-11 — Единая память проекта
Пользователь попросил перестать вручную переносить контекст между чатами. Цель — хранить в GitHub паспорт проекта, техническую энциклопедию, устройство кода, известные ошибки и способы решения, запреты, лайфхаки, принятые решения, старые и новые этапы.

Согласован принцип:
- GitHub Actions автоматически фиксирует commit metadata и изменённые файлы.
- AI-помощник при каждой проектной задаче обновляет смысловые документы: текущее состояние, решения, roadmap и этот контекст.
- Новый чат начинает работу с PROJECT_MASTER.md и остальных файлов памяти.
- Автоматический Git-журнал не равен автоматическому сохранению частного разговора; содержание беседы нужно преобразовывать в проектные заметки.

## Предшествующие проектные обсуждения — сводка доступного контекста

### Назначение
CS2 Analytics — платформа для небольшой компании друзей, играющих CS2 5×5. Нужны собственная статистика, история матчей, профили, сезоны, Track, рекорды, сравнения и соревнования.

### Визуальное направление
Пользователь предоставил скриншот FACEIT-профиля OBASRAL и HTML/CSS материалы страницы. Профильный экран был выбран как основной визуальный ориентир. Пользователь отдельно подтвердил, что хочет не изолированный новый профиль, а единый FACEIT-style интерфейс всего сайта.

### Правила по разделам
Track и Seasons должны быть доступны как общие разделы для всей команды и как персональные представления в профилях игроков. Они должны опираться на одну общую модель данных, а не на независимые копии.

### Импорт демок
Обсуждалась идея загрузки CS2 .dem после матча, автоматического извлечения игровых событий и сопоставления игроков по SteamID. Это будущая исследовательская задача, не готовая функция. Перед записью нужны dry-run, защита от повторного импорта и проверка точности каждой метрики.

### Защита проекта
- Только ветка faceit-dev для текущей разработки.
- Не трогать production main и production Supabase без прямого разрешения.
- Сохранять существующие данные и работающие функции.
- Не копировать чужие статистические данные FACEIT.
- Не объявлять тесты, визуальный QA или deployment успешными без фактической проверки.

## Что ещё нужно импортировать
Если у пользователя есть отдельная старая энциклопедия, заметки или экспорт предыдущих чатов, которых нет в текущем репозитории и доступном контексте, их нужно приложить или добавить в репозиторий. После получения — объединить с этим файлом, устранить дубли и сохранить историю решений без выдумывания недостающих деталей.

## Шаблон заметки после нового обсуждения

~~~md
## YYYY-MM-DD — Тема
**Контекст:** что обсуждали.
**Решение:** что согласовано.
**Почему:** причина.
**Ограничения:** что нельзя делать или предполагать.
**Следующий шаг:** конкретное действие.
**Связанные файлы/коммиты:** ссылки на исходники и изменения.
~~~


## 2026-11-11 — Импорт FRESH энциклопедии

Пользователь передал архив `CS2-5x5_ЭНЦИКЛОПЕДИЯ_FRESH_2026-11-09(1).zip` (17 файлов).
Он изучен и сопоставлен с текущей документацией `faceit-dev`.

Источник и правила интерпретации сохранены в:
`docs/legacy-encyclopedia-2026-11-09/README.md`.

Ключевое: исходный пакет описывает snapshot ветки `main` от 2026-11-09 и старый
Supabase ref `agetaoekkbhbmfmhxseu`; это историческая информация, не актуальная
конфигурация DEV. Не переносить его DB counts, project ref, runtime версии или
состояние функций в текущую среду без повторной проверки.

Полезные сведения из архива включены в актуальные PROJECT_MASTER, ARCHITECTURE,
TECHNICAL_STATE, ROADMAP и DECISIONS. Функция «Играли вместе» остаётся исторической,
пока текущий код не подтвердит обратное. Живые данные не пересобирать из старого snapshot.

Примечание: бинарный ZIP не коммитился; в GitHub добавлен индекс источника и
консолидированные проектные знания. Исходный файл остаётся в контексте загрузки
этого разговора, а не в репозитории.


## 2026-11-11 — FACEIT CSS: критическая история и handoff между чатами

Пользователь попросил сохранить не только технические факты, но и «тонкости» совместной работы — какие подходы не сработали, что именно стало переломным моментом и почему выбран текущий метод.

Главный эпизод:
- Мы пытались воссоздать профиль игрока FACEIT, опираясь главным образом на screenshot. По картинке не получалось добиться нужного результата: screenshot не раскрывает DOM, selectors, CSS cascade, fonts и responsive rules.
- Затем пользователь передал HTML и CSS настоящей страницы FACEIT (референс OBASRAL). Мы переключились с визуальных догадок на исследование исходников.
- В реальных материалах были замечены семейства Geist Variable, Geist Mono, Play, Coiny, Goldman, а также стили/селекторы avatar, cover, profile hero/header, gradients и stat tiles.
- После этого стало возможно предметно разрабатывать FACEIT-inspired profile shell. Этот переход от screenshot-only к HTML/CSS inspection — ключевой найденный рабочий метод, его нельзя забывать и нельзя возвращаться к прежнему циклу догадок.
- Пользователь хочет не отдельный новый профиль, а единый FACEIT-inspired дизайн всего CS2 Analytics.
- Материалы предыдущего чата назывались «Вставленный текст.txt», «Вставленный текст(1).txt», «Вставленный текст(2).txt» и «css.txt». Они не подтверждены как сохранённые в GitHub. Не говорить, что исходники уже находятся в репозитории; если нужны selectors/точные значения — запросить повторное вложение и затем положить reference copies в docs/reference/faceit/ при проверке лицензии/уместности.
- Подробная последовательность, известная реализация shell, ограничения и готовый handoff prompt сохранены в FACEIT_REFERENCE.md.

Другие важные тонкости:
- У пользователя был опыт нескольких итераций, когда визуальный результат по скриншоту не получался; ему важно, чтобы новый чат не предлагал заново уже провалившийся подход.
- Пользователь хочет ощущение непрерывного разговора с тем же помощником: новый чат должен сначала прочитать проектную память, затем проверить HEAD и продолжить с актуальной точки, а не спрашивать базовую информацию повторно.
- «Перенести всё до символа» следует понимать как максимально подробную передачу доступных фактов, решений, причин и ограничений, но нельзя обещать дословную стенограмму всех старых чатов: у нас нет полного архива всех сообщений. Не выдумывать отсутствующие подробности.
- Handoff prompt находится в конце FACEIT_REFERENCE.md и готов к копированию.

## Следующий шаг
Перед переходом на другой аккаунт проверить, что FACEIT_REFERENCE.md и ссылки на него сохранены в faceit-dev; затем пользователь может начать новый чат готовым handoff prompt. В новом чате первым делом проверить, доступны ли исходные HTML/CSS вложения; если нет — попросить повторно приложить их.

## 2026-11-11 — Engine / merge audit

Пользователь уточнил целевое направление: единая FACEIT V2 платформа, аккаунты и кликабельная навигация по профилям, Track, Seasons, Matches и другим разделам; затем использовать уже имеющуюся базу на новом frontend shell.

Ключевые результаты read-only аудита:
- «Новое приложение» объясняется PWA manifest с display=standalone; аккаунт в runtime commit 3b68040 — модальное окно внутри vanilla JS SPA, а не отдельный frontend engine.
- В runtime 3b68040 есть account signup/login/invite linking, профильная оболочка, matches/maps/players/records/seasons. Track не реализован как самостоятельная страница; Season 1 — placeholder; FACEIT rail содержит декоративные controls.
- Текущий faceit-dev HEAD 25dcab8 имеет только docs/workflow. Сравнение с runtime commit 3b68040 показало 195 файлов, удалённых из актуального tree коммитом 4c4274b, но сохранённых в Git history.
- Последний подтверждённый quality gate для 3b68040 зелёный (78 passed, 0 failed); текущий HEAD не содержит package.json и quality-gate workflow.
- DEV Supabase уже содержит state v156: 14 players, 42 matches, 93 maps, 14 player_profiles, 1 linked account, 0 active invites. Не делать повторный импорт без необходимости.
- DEV security/performance advisors: leaked password protection off; SECURITY DEFINER RPC warnings; 2 unindexed invite FKs; review grants/RLS before account expansion.
- Нового engine PR для принятия не найдено; единственный open PR #2 не относится к этой миграции. main и production Supabase не трогать.
- Подробный отчёт: docs/ENGINE_MIGRATION_AUDIT_2026-11-11.md.
- Никаких runtime/DB изменений в рамках аудита не выполнено.


## 2026-11-11 — FACEIT V2: актуальный технический статус после восстановления runtime

**Актуальная ветка:** `faceit-dev`. Runtime восстановлен в этой ветке из snapshot `3b680400`, затем добавлена единая profile-inspired shell. Текущий рабочий tree содержит приложение, Supabase adapter, ELO V3, account module, SQL migrations, assets и 12 тестовых файлов. Исторический раздел Engine / merge audit выше описывает более раннее состояние branch до восстановления runtime и не должен использоваться как current status.

Подтверждённые code checkpoints:
- Runtime restore: `c8ee8cd8776bd4fc113d88a1531b5596db8fb45e`.
- Общая shell prototype: `390a580d53bda0263342b884951d47cb065388b0`.
- Последний code-quality checkpoint: `52e3a0b8fb9d09b59010a74f9df5c7d9d88493f7`; GitHub Actions quality gate success, 83 passed / 0 failed.
- Последний branch HEAD на момент обновления этой заметки: проверить заново через GitHub branch API; после documentation commits project-memory workflow может добавить отдельный journal commit.
- DEV Supabase ref остаётся `nwujudniysolpevbtggd`. На дату аудита: state v156, 14 players, 42 matches, 93 maps, 14 profiles, 1 auth user.
- Никаких DB writes, migrations, production changes или deployments в этой фазе не выполнялось.

Технические findings:
- Runtime — vanilla JS SPA с большим `app_v57.js` (222 функции), общая оболочка пока prototype.
- Визуальный дизайн не утверждён владельцем; дальнейшие UI changes запрещены без его HTML/CSS/reference и указаний.
- Полный read-only runtime / Supabase / security audit: `docs/FACEIT_V2_READONLY_AUDIT_2026-11-11.md`.
- Read-only dataset / metrics / ELO audit: `docs/FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md`.
- В DEV все 11 series aggregate наборов совпали по K/D/A с суммой map stats; 31/42 матчей имеют полный series-level 5×5 roster, 11 имеют неполный roster.
- Два BO3 с series_score 1:1 после двух карт трактуются текущим ELO как DRAW; бизнес-смысл не подтверждён.
- ELO сортирует матчи через ID-based `matchOrder`, а не `played_at`; найдено одно несоответствие порядка между `match_001` и `match_002`.
- Эти правила не менять до согласования с владельцем.

## 2026-11-11 — Пользовательский формат работы

Пользователь попросил вести проект более автономно и крупными этапами, не присылать уведомление после каждой мелочи. Нужно объединять аудит/изменения/тестирование в законченные блоки и писать только при существенном результате или когда требуется решение/материал от пользователя. Не просить HTML/CSS заранее: запросить их только когда конкретный раздел готов к визуальной реализации.

Техническая подготовка и безопасные улучшения могут продолжаться самостоятельно. Не придумывать дизайн. Не менять `main`, production Supabase, live data или deployed environment без прямого разрешения. Пользователь остаётся владельцем продуктовых решений.


## 2026-11-11 — Additional verified fixes

- DEV Edge Function `cs2-admin` was version 2 and rejected empty `played_at` strings in the current state. Since the function validates the entire next state on every commit, this blocked cloud writes. Fixed blank-date handling, preserved rejection of malformed non-empty dates, deployed v3 to DEV only and re-fetched the active source. The full current DEV state now validates with zero errors.
- `saveMatchEdit` writes `manual_edit` provenance; Edge validator did not allow it for detailed historical series. Added the value and a regression test.
- Player create/archive/restore were not synchronizing `status` and `is_active`; fixed the three mutations and added a contract test.
- Added regression tests for ELO calibration transition, BO5 series event, map-score fallback, map/aggregate parity, Edge validation and lifecycle. Suite count is now 99; GitHub Actions remains queued, so do not call it green yet. Manual syntax compilation passed.
- The current DEV data was read-only validated against the deployed v3 Edge validator: 14 players, 42 matches, 93 maps, no errors. No DB rows/schema/policies/migrations were changed.
- Latest route map: `docs/FACEIT_V2_ROUTE_INVENTORY_2026-11-11.md`.



## 2026-11-11 — DEV Supabase security review

- Reviewed Supabase security and performance advisors, table grants/RLS, SECURITY DEFINER RPC definitions, account-link view, storage policies, and the public JSON state.
- No-policy RLS findings on invites/admins/login aliases/audit/operations are intentional deny-by-default; no anon/authenticated table grants were found for those tables.
- `commit_cs2_state` and `is_cs2_admin` are intentionally callable by authenticated clients; the former checks the admin predicate and the frontend depends on the guarded RPC. Do not revoke without replacing the client commit path.
- `my_player_account` is `security_invoker=true` and its underlying link table has own-user RLS, but the view has broader-than-needed anon/DML grants. Recommend a narrow-grants migration; not applied.
- DEV Auth leaked-password protection is disabled. Requires Auth settings change; not changed.
- `player_account_invites.created_by` and `claimed_by` FKs lack indexes; recommend a migration. Unused-index advisor findings are informational and should not trigger automatic drops.
- Public state scan found no email-like values, auth identifiers, or password/token fields. Storage bucket public read is paired with own-UID folder write/update/delete policies.
- No database, Auth, Storage, grants, policies or migration writes were made. Full findings: `docs/FACEIT_V2_SECURITY_AUDIT_2026-11-11.md`.


## 2026-11-11 — DEV migration drift

- Compared all 10 DEV migration ledger entries against every SQL file on `faceit-dev`. Several applied 14-digit migrations have no exact tracked file; three DEV helper SQL files use 8-digit prefixes and do not match the ledger versions. GitHub path history did not recover missing migration files.
- Live `public.my_player_account` view is absent from all tracked SQL files. It is `security_invoker=true` and filters by `auth.uid()`, but its broad grants were noted in the security audit.
- Do not run further schema migrations or recreate/reset environments until missing SQL is recovered from an authoritative source and the view is represented in migration history. Do not fabricate historical migration contents.
- Report: `docs/FACEIT_V2_MIGRATION_DRIFT_2026-11-11.md`.


## 2026-11-11 — Account and profile security review

- Read-only DEV review confirms one confirmed Auth user and one unique player link; do not copy identity details into project docs. No invite rows currently exist.
- `player_account_links` has PK on auth_user_id and unique player_id. `player_account_invites` stores only SHA-256 hashes of 144-bit random tokens, expires after 7 days, is single-use, row-locked on claim, and is revalidated against active player/profile state at redemption.
- SECURITY DEFINER invite implementations live in `private`, use empty search_path, and enforce admin/auth checks; public wrappers are SECURITY INVOKER. Anon has no direct table grants or invite RPC execution. Authenticated can execute wrappers but cannot directly select invite rows.
- Profile RLS binds edits to the linked player and requires media paths under auth.uid(). Storage policies enforce same per-user folder. Bucket configuration independently enforces 5 MiB and JPEG/PNG/WebP/GIF.
- A read-only authenticated-role context check confirmed own-account view returns one row. No DB/Auth/storage mutations were performed.
- Added 9 static account-security contract tests; total suite 100. GitHub Actions quality gate passed: 100 passed / 0 failed on run 43100294912. Details: `docs/FACEIT_V2_ACCOUNT_SECURITY_AUDIT_2026-11-11.md`.
- Registration's pending invite code is held in page memory until email confirmation; reloading before claim loses the pending value, but user can re-enter the code. Low-priority UX follow-up only.


## 2026-11-11 — Static HTML injection surface pass

- Scanned runtime HTML sinks in `app_v57.js` and `account_module.js`, plus adapters/validators/data/ELO modules. No eval/new Function/document.write/javascript: sinks found. Dynamic user-facing strings are escaped at inspected HTML boundaries; map asset URLs are URL-encoded.
- Two inline handlers use raw `player_id`; both browser and Edge validators constrain the allowed character set to Unicode letters/numbers plus `_ . : space -`, excluding quote and markup delimiters. Added a regression test for that invariant. Total suite is 100; CI remains queued.
- This is static review only, not penetration testing or browser QA. See account security audit.


## 2026-11-12 — CSS readiness pass

- Static audit of `style_v57.css`: 3,514 lines, 92 custom properties, 125 media queries; shell CSS block ~14.7k chars/128 lines/153 parsed blocks/122 selector strings/18 `!important`/6 media queries. Legacy cascade has many repeated selectors; `.topbar nav` repeats 20 times, `.topbar` 16, `.nav-btn` 15.
- Current shared shell is scoped under `.faceit-exact-shell` / `.faceit-route-shell`, but body `:has()` rules hide the old topbar and reset main. Must verify all routes in browser before visual changes.
- Estimates: technical prep before owner-directed CSS ~80%; final approved visual CSS 5–10%; whole FACEIT V2 ~30–35%. These are planning estimates, not objective code coverage.
- Original FACEIT HTML/CSS uploads are not confirmed in repo. Need them reattached before faithful CSS work. Exact Cloudflare URL and deployed SHA also remain unverified.
- No CSS/runtime changes were made in this audit. Full report: `docs/FACEIT_V2_CSS_READINESS_AUDIT_2026-11-12.md`.

- Follow-up CSS route-root map added to the readiness report (home, players, base, maps, teams, records, seasons, profile). Quality gate for CSS audit commit passed: 100/100 tests, 0 failures (run 43101582571).


## 2026-11-12 — Match Center: первая итерация по устным требованиям владельца

Пользователь описал новый ориентир для страницы матча по FACEIT: квадратная карточка карты; победитель слева, проигравший справа; названия команд от капитанов и аватары; убрать искусственные TEAM A/B, количество игроков и командные агрегаты; карточки игроков должны показывать фото, ник, уровень L и карьерные матчи/WR/AVG/KD плюс будущие KR/ADR/HS%; убрать декоративные полукруги; карты показывать прямоугольными карточками; в таблице красить положительные/отрицательные значения; в перспективе добавить veto и награды MVP + четыре номинации.

Начата первая кодовая итерация Match Center в `app_v57.js` и `style_v57.css`: герой упрощён, карта вынесена в квадратный tile, победившая команда ставится слева, названия строятся от первого игрока roster (временный proxy капитана), аватары показываются, командные метрики скрыты, карточки используют карьерные матчи/WR/AVG/KD и ELO level, отсутствующие KR/ADR/HS% честно отображаются как недоступные, таблица получила цветовые классы, карты остаются прямоугольными.

Ограничения текущего data contract: отдельное поле капитана не подтверждено; veto-pick/ban history не найден; KR, ADR, HS%, damage и entry-kill metrics отсутствуют в текущем runtime-потоке. Не вычислять их из K/D/A и не выдавать приблизительные MVP/awards за достоверные. Для будущей итерации требуется источник этих метрик и согласование формулы внутреннего рейтинга MVP.

Эта итерация не является финальным дизайном. Сверить с референсными изображениями пользователя, когда он добавит их в `design-references/match-center/`.


### Match Center implementation follow-up

The first Match Center implementation was committed, then the existing UI contract test correctly flagged one obsolete assertion that required the removed team AVG MAP label. The test was updated to assert the new map tile, career metric grid, future-metric placeholders, and positive/negative scoreboard states. A draw is labeled as a draw rather than incorrectly showing a winner. CI result for the first pass: 181/182 passed; this follow-up is intended to bring the suite back to green.
