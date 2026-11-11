# FACEIT V2 — аудит целостности данных и расчётов

Дата: 2026-11-11  
Среда: DEV Supabase `cs2-faceit-dev` (`nwujudniysolpevbtggd`)  
Git branch: `faceit-dev`  
Режим: read-only. SQL выполнялся только через SELECT; код, данные и схема не изменялись.

## 1. Срез текущих данных

Состояние `public.cs2_app_state`:
- version: **156**
- players: **14**
- matches: **42**
- maps: **93**
- player_profiles: **14**
- auth users: **1**

Структура матчей:
- BO1: 5
- BO3: 36
- BO5: 1
- archived matches: 0
- archived maps: 0
- все 42 серии имеют непустой `series_score`
- 93/93 карт отмечены `stats_available=true` и имеют player_stats
- 11 серий содержат `series_aggregate_stats` по 10 строк

В данных нет compact maps на момент аудита; это не отменяет необходимости сохранять поддержку compact series в валидаторе и коде.

## 2. Сверка series aggregate с картами

Проверены все 11 серий с `series_aggregate_stats`.

Для каждой серии суммы K/D/A по игрокам из `series_aggregate_stats` сопоставлены с суммами player_stats всех карт этой серии. Идентичность сравнивалась по `player_id`, а для guest rows — по нормализованному `raw_name`.

Результат:
- 11/11 серий совпали полностью;
- 0 несовпадающих строк;
- суммарные K/D/A для каждого игрока/гостя совпадают.

Это хороший признак целостности текущего набора агрегатов. В частности, ELO-модуль может использовать series aggregate как приоритетный источник для этих серий без расхождения с map-level K/D/A.

## 3. Полнота составов и влияние на ELO

В исходном state 22 матча имеют неполные `team_a/team_b`. После учёта fallback на непустые `lobby_team_a/lobby_team_b`:
- 31/42 матчей имеют полный series-level roster 5×5;
- 11/42 остаются с неполным series-level roster.

У 10 из этих 11 серий в каждой карте присутствует map-level 5×5 roster; у одной (`match_016`) map-level roster также неполный. Однако текущий ELO вызывает `historicalLobbyGroups(match, null)`, то есть строит roster на уровне серии. Если в match-level roster уже есть частичные массивы, helper не переходит к map-level составам, и ELO не пытается объединить их.

Следствие: 10 серий потенциально могут быть восстановлены из map-level roster, но это нельзя делать автоматически, пока не проверена неизменность состава между картами и не утверждена семантика замен/гостей. Сейчас они должны считаться не прошедшими eligibility gate, а не «потерянными матчами».

## 4. Результаты 1:1 в BO3

Обнаружены две серии:
- `match_003`: BO3, `series_score=1:1`, две карты; карта 1 — 9:13, карта 2 — 13:9.
- `match_029`: BO3, `series_score=1:1`, две карты; карта 1 — 17:19, карта 2 — 16:13.

Текущая функция `CS2EloV3.matchResult()` трактует любой равный ненулевой series score как DRAW. Поэтому эти серии могут участвовать в ELO как ничьи, если roster проходит проверку.

Неизвестно, являются ли они намеренно завершёнными ничьими, незавершёнными BO3 или результатом исторического импорта. Не менять их outcome/ELO без решения владельца. Нужна явная продуктовая трактовка ничьей и незавершённой серии.

## 5. Порядок матчей и исторические даты

ELO сортирует active matches через app helper `matchOrder()`, который использует `seriesOrderSort()`. Текущий comparator:
- сортирует legacy IDs вида `match_001` по числовой части ID;
- затем сортирует `match_local_<timestamp>` по числу в ID;
- не сортирует по `played_at`.

В базе:
- 18/42 матчей не имеют `played_at`;
- среди 16 legacy matches с датой найдено одно нарушение хронологии по ID-порядку: `match_001` — 2024-08-26, а `match_002` — 2024-08-08, но ELO обрабатывает `match_001` раньше `match_002`;
- у восьми local matches с датой соседних инверсий в порядке числового ID не найдено.

Поскольку ELO пересчитывается последовательно, изменение порядка может менять ожидаемые вероятности и последующий рейтинг. Перед исправлением требуется выбрать канонический порядок: played_at, сохранённый series order, ID/creation order или отдельное поле sequence. Нельзя просто заменить comparator на дату: 18 дат отсутствуют, а series_number в данных не является надёжно уникальным/последовательным источником.

## 6. Текущая реализация ELO и покрытие тестами

В коде:
- старт: 1000;
- командный результат: 85%;
- индивидуальный impact: 15%;
- provisional K: 32 для первых 10 учитываемых серий;
- established K: 24;
- одна запись на серию, не на каждую карту;
- полный 5×5 roster обязателен;
- гости учитываются как нейтральные 1000, но сами не получают рейтинг;
- неизвестный результат и неполный roster пропускаются.

В текущем `tests/elo_v3.test.cjs` восемь тестов:
1. базовый полный 5×5 win/loss;
2. неполный roster не оценивается;
3. неизвестный 0:0 result не оценивается;
4. незарегистрированный guest нейтрален;
5. provisional K остаётся до десятой серии и переключается на established K с одиннадцатой;
6. BO5 учитывается как одно событие серии;
7. результат восстанавливается из map scores при отсутствии series score;
8. series aggregate K/D/A совпадает по ELO-влиянию с суммой map-level rows.

Пока нет отдельного regression coverage для:
- перехода с provisional K на established K после 10 серий;
- DRAW и BO3 1:1 semantics;
- chronological ordering / missing played_at;
- BO1/BO3/BO5 outcome edge cases;
- равного рейтинга команд и team-average Elo;
- impact clamp / относительной поправки;
- серии с substitutions и неполным match-level roster, но полным map-level roster;
- точного соответствия ELO series aggregate и map totals.

Это пробелы покрытия, не доказанные дефекты формулы. Добавлять тесты на спорные правила можно после согласования их ожидаемого поведения.

## 7. Frontend controls — статический проход

Для `app_v57.js`:
- 239 887 JavaScript characters (255 145 UTF-8 bytes в Git tree);
- 1 276 строк;
- 222 function declarations;
- 126 inline `onclick` attributes;
- 9 inline `onchange` attributes;
- 21 вызов `addEventListener`;
- 50 уникальных имён обработчиков в простых inline onclick-вызовах; все 50 найдены среди объявленных функций (кроме специального DOM helper `$`).

Это подтверждает, что у статически обнаруженных handler names есть определения. Это не browser QA: не проверены фактическая кликабельность, ошибки при определённом state, модальные сценарии, mobile touch, focus/keyboard и сетевые сбои.

## 8. Подтверждённое качество

Последний code-quality run:
- commit: `52e3a0b8fb9d09b59010a74f9df5c7d9d88493f7`
- GitHub Actions: https://github.com/nonspam/cs2-5x5/actions/runs/43094751757
- job `validate`: success
- полный suite: 83 passed, 0 failed по результату этого run.

После этого были только documentation/project-memory commits; runtime не менялся. Автоматический journal commit не запускает повторный workflow из-за стандартного GitHub Actions anti-recursion для bot token. Поэтому CI подтверждает кодовый commit `52e3a0b`, а не самую позднюю документационную вершину.

## 9. Решения, которые пока нельзя принимать автоматически

1. Считать ли BO3 1:1 после двух карт DRAW или незавершённой серией.
2. Можно ли восстанавливать series roster из map-level rosters, если match-level roster неполный; как обрабатывать замены.
3. Какой порядок матчей считать каноническим для ELO при отсутствующем played_at.
4. Нужно ли пересчитывать старые ELO после утверждения этих правил; если да — какой baseline/season reset использовать.

До этих решений не менять ELO eligibility, outcome handling, sort order, K weights или impact formula.

## 10. Следующий инженерный этап

1. Зафиксировать owner decisions по трём вопросам из раздела 9.
2. Добавить golden fixtures для реальных edge cases, сохранив current outputs как baseline до принятия новых правил.
3. Только затем менять ELO eligibility/order/outcome и сверять полный рейтинг всех 14 игроков.
4. Выполнить browser smoke test на DEV: auth, profile, navigation, player/match/map details, add/edit/archive/restore, backup and responsive layout.
5. Не менять production DB, `main` или deployed environment без отдельного разрешения.

## Границы

Только DEV/read-only. Никаких UPDATE/INSERT/DELETE, migrations, grants/policies changes, runtime/UI changes или deployments в рамках этого аудита не выполнялось.


### Точная проверка roster eligibility

Отдельный read-only запрос повторил ключевые условия ELO roster gate: 5 слотов на каждой стороне после fallback с пустого lobby roster на match roster, 10 уникальных slots, минимум один известный игрок на каждой стороне. Результат:
- 31 полный 5×5;
- 31 с десятью уникальными слотами;
- 31 с известным игроком на каждой стороне;
- 31 с определённым непустым результатом (ни одной серии 0:0).

Следовательно, при текущих данных и текущем match-level roster helper ELO должен учитывать **31 из 42** серий. Остальные 11 не проходят полный series-level roster gate; 10 из них требуют отдельной проверки map-level roster consistency, прежде чем менять eligibility.


## Engineering addendum — validation and lifecycle fixes (2026-11-11)

### Deployed Edge validator v2 defect

The deployed `cs2-admin` version 2 validator treated `played_at: ''` as an invalid date because it called `Date.parse('')`. The current DEV state contained two such rows, and the embedded fallback contained four. The add-match wizard permits leaving the date blank. Since the Edge Function validates the complete next state on every commit, this rejected all cloud write operations while those blank strings existed.

The validator now treats null/blank `played_at` as absent and continues to reject non-empty invalid dates. The new behavior was checked against the entire live DEV state and the embedded fallback; both validate cleanly.

### Team assignment provenance

`saveMatchEdit()` writes `team_assignment_source='manual_edit'` when editing team assignments. The Edge validator did not include `manual_edit` in its allowed provenance set for `detailed` historical series. Added `manual_edit` to the allowed set and added a regression test that mutates a detailed embedded series to this provenance.

### Player lifecycle contract

The UI previously changed only `is_active` on create/archive/restore, while Edge validation requires `status` and `is_active` to agree. Fixed:
- create: `status='active', is_active=true`;
- archive: `status='archived', is_active=false`;
- restore: `status='active', is_active=true`.

A read-only simulation against a clone of the live DEV state confirmed that the new create/archive/restore shapes pass validation and the old inconsistent archive/restore patches are rejected.

### DEV deployment and verification

- `cs2-admin` deployed to DEV project `nwujudniysolpevbtggd`, active version **3**.
- `verify_jwt=false` preserved; function still performs its own bearer-token and admin allow-list checks.
- Deployed `index.ts` and `validation.js` were fetched back; validation source exactly matches `faceit-dev`.
- Full current DEV state validates with v3: **14 players, 42 matches, 93 maps; zero validation errors**.
- No SQL, data, schema, grants, policies or migration writes were performed.
- GitHub Actions for the expanded **91-test** suite remain queued at time of this note. Manual syntax compilation passed for changed JS files. Previous completed CI was 83/83.
- Cloudflare frontend deployment and browser QA remain unverified.

This is a DEV-only Edge Function deployment, not a production deployment.
