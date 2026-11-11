# Архитектура CS2 Analytics

Описание основано на структуре faceit-dev. Не подтверждённые детали требуют аудита исходников.

## Runtime
- index.html — browser entrypoint и порядок загрузки.
- app_v57.js — основная браузерная логика, крупный монолит.
- style_v57.css — активные стили.
- validation.js — общая browser/CommonJS валидация.
- supabase_adapter.js — облачная загрузка, admin checks, realtime и commit state.
- supabase-config.js — конфигурация среды; обязательно проверять target project.
- data_embedded.js — embedded fallback/snapshot, не разрешение затирать более новые cloud data.
- elo_v3.js — ELO helpers.
- account_module.js — account/profile linking.

Порядок script/style в index.html — контракт. Изменение путей, порядка или cache-busting требует обновления entrypoint tests.

## Данные и синхронизация
- data/players.json, matches.json, maps.json, aliases.json — локальные данные/snapshot.
- Supabase migrations и supabase_schema.sql — артефакты схемы.
- supabase/functions/cs2-admin — серверная административная функция.
- Документированный cloud write path: browser JWT → cs2-admin Edge Function → server-side commit_cs2_state RPC. Browser не должен напрямую писать state table.
- shared_state.json, server.py и START_SHARED_SERVER.* — предусмотренный LAN-режим; не считать его публичным cloud runtime без проверки.

Перед DB-изменениями читать актуальный Edge Function, SQL, RLS и проверять project ref.

## Канонические сущности
Подробный контракт находится в docs/DATA_MODEL.md.
- Player: уникальный player_id; display names и aliases разрешают raw names.
- Match/series: match_id, формат BO1/BO3/BO5 и упорядоченные map_ids.
- Map: map_id, parent match_id, последовательный 1-based map_index.
- Неразрешённая строка может сохранять raw_name без выдуманного player_id.
- archived исключает сущность из активной статистики, но не означает физическое удаление.
- Compact series могут иметь aggregate stats; нельзя искусственно распределять их по картам.

## QA
- tests/*.test.cjs — Node regression tests.
- npm run check — syntax checks и node tests.
- .github/workflows/quality-gate.yml — CI.
- Старые QA scripts могут проверять исторические snapshots; перед запуском выяснить их версию и ожидания.

Green CI доказывает только покрытые проверки, не визуальную корректность, live Supabase, deployment или все browser flows.

## Эволюция архитектуры
Не перемещать файлы массово. Сначала покрывать поведение тестами, затем извлекать чистые helpers и доменные сервисы по одной ответственности, сохраняя совместимый entrypoint. FACEIT shell — presentation/navigation layer; data, metrics, permissions и persistence остаются собственными.

## Не считать реализованным без проверки
- Полный CS2 .dem importer.
- FACEIT-унификацию всех страниц.
- Disabled tabs/placeholders как рабочие разделы.
- Деплой или browser QA последнего commit.


## FACEIT V2 shared shell — состояние 2026-11-11

- `faceitAppRailMarkup()` формирует общую навигацию.
- `navigateApp(tab)` меняет единый `state.tab`; `renderRouteShell()` размещает существующие page renderers внутри общего profile-inspired shell.
- `profilePage` использует ту же rail; `account_module.js` помещает unlinked account flow внутрь shell.
- Existing route renderers remain in `app_v57.js`; no domain data model rewrite was made.
- Route inventory and known gaps: [docs/FACEIT_V2_RUNTIME_AUDIT.md](docs/FACEIT_V2_RUNTIME_AUDIT.md).
- Product acceptance criteria: [docs/FACEIT_V2_PRODUCT_BRIEF.md](docs/FACEIT_V2_PRODUCT_BRIEF.md).

Track and full season lifecycle are not implemented. Do not expose their placeholders as working navigation.
