# CS2 Analytics — главный паспорт проекта

Главный вход для нового чата и разработчика. Рабочая ветка инициативы: faceit-dev. Эти документы описывают DEV, если явно не указано иное.

## Кто мы и для кого
CS2 Analytics — собственная статистическая и соревновательная платформа для небольшой закрытой компании друзей, играющих в Counter-Strike 2 в формате 5×5. Это личная история нашей команды, игроков, матчей, сезонов, достижений и соперничеств, а не публичный клон FACEIT.

Проект создаётся совместно владельцем/заказчиком и AI-помощником. Владелец определяет цели и принимает решения; помощник изучает код, предлагает решения, вносит согласованные изменения, тестирует и документирует результат.

## Зачем
- Хранить историю матчей и игроков.
- Показывать честную статистику, прогресс, форму, рекорды и сравнения.
- Развивать профили, общую аналитику, сезоны, таблицы и внутренние соревнования.
- В перспективе автоматизировать импорт матчей, включая исследование CS2 .dem.
- Сделать весь сайт цельным и качественным, используя FACEIT как визуальный ориентир, но сохраняя собственные данные и функции.

## Принципы
1. Сначала целостность данных и работающие функции, затем UI.
2. Развиваем существующий проект, не переписываем с нуля без отдельного решения.
3. Все страницы используют единую дизайн-систему.
4. Глобальные разделы и профили — разные представления общих данных, а не независимые копии.
5. Не выдумывать игроков, матчи, статистику, рейтинги и исторические сведения.
6. Отдельно указывать результаты тестов, CI, деплоя и браузерной проверки.
7. Важные изменения сопровождаются тестами, записью решения и обновлением документации.
8. При расхождении документа с фактическим кодом сначала проверить код и тесты, затем исправить документ.

## Среды и запреты
- Репозиторий: nonspam/cs2-5x5.
- Рабочая ветка: faceit-dev.
- DEV: https://cs2-analytics-dev.z2z2djt852.workers.dev/
- DEV Supabase ref: nwujudniysolpevbtggd.
- Production main и production Supabase cs2-analytics не трогать без прямого разрешения.
- Изменения этой инициативы — только в faceit-dev.
- Не запускать destructive SQL, миграции, массовые исправления или перезапись production data в рамках UI-задач.
- Не копировать статистику демонстрационного FACEIT-профиля OBASRAL.
- Не коммитить пароли, токены, service-role keys и секреты.

Перед работой проверить фактические branch и HEAD.

## Как мы общаемся и работаем
Общение — русский язык, дружелюбно, прямо, без лишней формальности. Пользователь может формулировать идеи голосом и не обязан знать технические термины. Помощник переводит намерение в понятный план и задаёт только необходимые вопросы.

Рабочий цикл:
1. Понять цель и критерии приёмки.
2. Изучить текущий код, данные, тесты и документы.
3. Для визуальных задач найти конкретный референс.
4. Обозначить узкий план и риски.
5. Работать в DEV после контрольной точки.
6. Внести минимально достаточные изменения.
7. Запустить тесты и проверить CI.
8. Проверить браузер/деплой, если реально доступно.
9. Обновить статус, решения и профильную документацию.
10. Зафиксировать commit SHA и сообщить, что проверено и что нет.

## Восстановление контекста в новом чате
Прочитать этот файл, затем TECHNICAL_STATE.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, ROADMAP.md, CHANGELOG.md и DECISIONS.md. Затем проверить актуальную ветку, HEAD и последние коммиты. Исторические документы — не автоматическая истина.

## Границы автоматизации
GitHub Actions может автоматически записывать commit, автора, дату и изменённые пути. Он не знает содержания частного разговора в ChatGPT. Смысловые итоги, ограничения и причины решений должны добавляться помощником в DECISIONS.md и профильные документы при каждой задаче. Обновление документации — часть Definition of Done.

## Источники правды
1. Актуальная нужная ветка и среда.
2. Актуальная схема и состояние соответствующей БД, проверенные безопасно.
3. Тесты и runtime contracts.
4. Текущие инженерные документы.
5. Исторические отчёты и старые чаты.
Нельзя переносить исторический snapshot в текущую базу без сверки.

## Импортированная историческая энциклопедия
Источник от 2026-11-09 разобран и сопоставлен с текущей памятью. Его снимок относится к старому `main` и старому Supabase ref; использовать его только как историю. Индекс и важные оговорки: [docs/legacy-encyclopedia-2026-11-09/README.md](docs/legacy-encyclopedia-2026-11-09/README.md).


## FACEIT V2 — актуальное продуктовое решение
Профильный shell становится основным сайтом, а не отдельной страницей рядом со старым продуктом. Продуктовый бриф и критерии приёмки: [docs/FACEIT_V2_PRODUCT_BRIEF.md](docs/FACEIT_V2_PRODUCT_BRIEF.md). Текущий кодовый срез и проверенные/непроверенные пункты: [docs/FACEIT_V2_RUNTIME_AUDIT.md](docs/FACEIT_V2_RUNTIME_AUDIT.md). Техническая контрольная точка: [TECHNICAL_STATE.md](TECHNICAL_STATE.md).

## Критически важный FACEIT research
Перед визуальными задачами обязательно прочитать [FACEIT_REFERENCE.md](FACEIT_REFERENCE.md). Там записано, почему попытка повторить профиль только по screenshot не сработала и почему исследование настоящего HTML/CSS FACEIT стало переломным моментом. Там же находится готовый handoff prompt для нового чата. Исходные CSS/HTML файлы предыдущего чата пока не подтверждены как сохранённые в GitHub.


## Последний read-only технический аудит
Полный frontend/runtime, ELO, DEV Supabase, schema/security advisors и QA gap review: [docs/FACEIT_V2_READONLY_AUDIT_2026-11-11.md](docs/FACEIT_V2_READONLY_AUDIT_2026-11-11.md). Аудит выполнен только чтением; дизайн, runtime и база данных не изменялись.


## Аудит целостности данных и ELO
Проверка 42 матчей / 93 карт, series aggregates, roster coverage, неоднозначных BO3 1:1 и порядка пересчёта рейтинга: [docs/FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md](docs/FACEIT_V2_DATA_INTEGRITY_AUDIT_2026-11-11.md). Спорные правила ELO намеренно не менялись.


## Route and interaction inventory
Static map of existing SPA routes, modal workflows, account/admin features and known navigation gaps: [docs/FACEIT_V2_ROUTE_INVENTORY_2026-11-11.md](docs/FACEIT_V2_ROUTE_INVENTORY_2026-11-11.md). This is source-level inventory only; browser QA is still pending.

## Security and operations

DEV Supabase security/performance findings and recommended hardening work are documented in [the security audit](docs/FACEIT_V2_SECURITY_AUDIT_2026-11-11.md). Intentional RLS-deny patterns and guarded admin RPCs must not be weakened just to silence generic advisor warnings.

## Database reproducibility

DEV's applied migration ledger currently does not match the SQL migration files tracked on `faceit-dev`. Do not run new schema migrations or reset/recreate environments until this is reconciled. See [the migration drift report](docs/FACEIT_V2_MIGRATION_DRIFT_2026-11-11.md).

## Account and profile security

The invite/link/profile security model and live DEV verification are documented in [the account security audit](docs/FACEIT_V2_ACCOUNT_SECURITY_AUDIT_2026-11-11.md). Keep invite implementation server-side; do not expose private invite rows or raw tokens. The media bucket enforces a 5 MiB image allow-list server-side.


## Точка продолжения — Match Center (2026-11-12)
Подробный handoff и следующий шаг: [docs/MATCH_CENTER_CHECKPOINT_2026-11-12.md](docs/MATCH_CENTER_CHECKPOINT_2026-11-12.md). Перед продолжением сверить текущий HEAD `faceit-dev`; кодовая композиция обзора по референсу уже в ветке, но browser QA/deploy и пользовательская приёмка не подтверждены.

## 2026-11-12 — Match Center reference pass 2
Владелец загрузил два новых эталона: `design-references/inbox/1.png` (MVP + четыре award rows) и `design-references/inbox/2.png` (компактная карточка игрока). Реализовано в `app_v57.js` и `style_v57.css`:
- Veto/map list теперь компактные прямоугольные строки: квадратная миниатюра, имя карты, счёт справа; старые большие map cards с подвалом MVP/coverage убраны из обзора.
- Игрок в Match Center: квадратный аватар, ник, текущий CS2EloV3 rating и level, ниже компактные карьерные метрики.
- В Statistics добавлен крупный MVP-блок и четыре award строки: kills выводится из подтверждённых aggregate K/D/A; damage, KAST и entry kills пока помечены как недоступные, так как источник их не содержит.
- MVP пока выбирается детерминированно по убийствам, при равенстве — по K/D; это временный явный критерий, не полноценная оценка влияния.
- Contract tests обновлены под новую структуру.
Quality Gate: commit `2855accc3f83fb9a4110293a4d63e6f2a9cca7e1`, run https://github.com/nonspam/cs2-5x5/actions/runs/43261367570, 183 passed / 0 failed.
Не выполнялись browser QA и deployment; визуальная приёмка владельцем ожидается. Не менять main/production/DB.


## Текущая задача — Match Overview
Подробная точка продолжения: [docs/MATCH_OVERVIEW_HANDOFF_2026-11-12.md](docs/MATCH_OVERVIEW_HANDOFF_2026-11-12.md). Анализ исходного FACEIT HTML/CSS: [docs/MATCH_OVERVIEW_REFERENCE_ANALYSIS_2026-11-12.md](docs/MATCH_OVERVIEW_REFERENCE_ANALYSIS_2026-11-12.md).
Референс получен вложением в чат и изучен. Первая реализация Overview внесена только в `faceit-dev`: nav, metadata, score card, два ростера и центральная колонка. Сейчас ожидаются Quality Gate и визуальная приёмка владельца. Statistics остаётся отдельным этапом и не меняется до одобрения Overview. Не переносить upload-коммиты из default/main в DEV.


## 2026-11-13 — Match Overview follow-up

Current DEV follow-up adds the BO3 series K/D Top 10, repairs the map-artwork stacking hook/layers, and resolves ELO point navigation through the canonical match ID. Data remains source-backed; partial series stats are not padded. See the latest `TECHNICAL_STATE.md` checkpoint and Match Overview handoff. No browser QA, deploy, DB/SQL changes, or `main` changes.


## Quality Gate follow-up — 2026-11-13

Updated stale static contracts after the feature push: removed the obsolete Statistics-tab expectation from Match Center and aligned W/L and alias-resolution assertions with the current implementation. See `TECHNICAL_STATE.md` for run details.


Quality Gate contract cleanup (2026-11-13): removed two final stale expectations for obsolete K/R/HS% and placeholder server/veto copy. The active contract now checks the current ADR field and the explicit missing-veto message.
