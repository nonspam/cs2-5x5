# CS2 Analytics V53 — Cleanup Release Report

Дата сборки: 2026-09-30

## Что изменено после V52
- Удалён hardcoded offline admin password из production-кода.
- Облачная авторизация осталась через Supabase Auth + server-side `cs2-admin`.
- Для локального/общего сервера убрана фиктивная браузерная password-защита: админка открывается явно из локального режима, а границей доступа остаётся сам сервер.
- Старый `CS5_EMBEDDED_DATA` переименован в `CS2_EMBEDDED_DATA`.
- Legacy `cs5_*` localStorage-ключи заменены на `cs2_analytics_*`. При первом запуске старые ключи автоматически мигрируются и удаляются только после успешной записи нового ключа.
- Имена внутреннего toast/hydration state также очищены от `CS5` legacy-префикса.
- Документация обновлена: старый offline-пароль больше не публикуется как рабочий способ входа.
- Добавлен `LEGACY_CLEANUP_QA_20260930.js` для отдельной проверки cleanup-регрессий.

## Проверки
- `python3 QA_CHECK_V52.py` — PASS
- `node REWORK_QA_20260930.js` — PASS
- `node TEAM_PROBABILITY_QA_20260930.js` — PASS
- `node CORE_QA_20260930.js` — PASS
- `node LEGACY_CLEANUP_QA_20260930.js` — PASS
- `node --check app.js` — PASS
- `node --check supabase_adapter.js` — PASS
- `node --check data_embedded.js` — PASS
- Local HTTP `/api/health` — PASS
- Local HTTP `/api/state` — PASS (14 players / 67 maps / 33 matches)
- Local HTTP `/` — HTTP 200

## Что намеренно не менялось
- Формула Player Index.
- Team Probability.
- Исторические составы и неполные roster-данные.
- Dataset: 14 игроков / 67 карт / 33 матча.
- Порядок карт и существующая UI-композиция V52.
- Chromium visual PASS не заявляется: среда выполнения по-прежнему блокирует автоматический браузерный прогон.

## Оставшийся технический долг
- CSS всё ещё содержит исторические override-слои; это следующий отдельный cleanup, который требует визуального регресса и не должен делаться вслепую.
- LAN shared server по-прежнему рассчитан на доверенную локальную сеть и не является публичной системой авторизации.
