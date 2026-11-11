# Источник: CS2-5x5 FRESH encyclopedia (2026-11-09)

Этот каталог фиксирует импорт и разбор пользовательского архива
`CS2-5x5_ЭНЦИКЛОПЕДИЯ_FRESH_2026-11-09(1).zip`, полученного 2026-11-11.

В исходном ZIP было 17 файлов:

- 00_START_HERE.md
- 01_PROJECT.md
- 02_CURRENT_ARCHITECTURE.md
- 03_DATA_AND_DB.md
- 04_DATA_MODEL.md
- 05_FRONTEND_CURRENT.md
- 06_MATCH_CREATION.md
- 07_VALIDATION_AND_TESTS.md
- 08_PLAYER_ANALYTICS.md
- 09_CHART_AND_UI_HISTORY.md
- 10_RECENT_HISTORY.md
- 11_TOGETHER_PLAY_STATUS.md
- 12_KNOWN_ISSUES.md
- 13_DEV_PROTOCOL.md
- 14_NEW_CHAT_PROMPT.md
- 15_FILE_MAP.txt
- CURRENT_SNAPSHOT.json

## Как использовать

Это исторический снимок состояния на 2026-11-09, а не описание текущего DEV runtime.
В нём указаны ветка `main`, Supabase ref `agetaoekkbhbmfmhxseu`, версия state 154,
42 matches, 93 maps, 15 players, 41 aliases и Edge Function version 15.
Эти значения нельзя применять к DEV или считать актуальными без отдельной проверки.

Текущая рабочая линия этой инициативы:
- repository: `nonspam/cs2-5x5`
- branch: `faceit-dev`
- DEV Supabase ref: `nwujudniysolpevbtggd` (проверять перед любыми DB-операциями)
- production `main` и production Supabase не трогать без прямого разрешения.

## Что из архива перенесено в актуальную энциклопедию

- Назначение продукта для небольшой постоянной компании друзей, играющих CS2 5×5.
- Приоритет надёжности существующих функций и сохранности реальных данных.
- Архитектура frontend/backend и порядок загрузки runtime-файлов.
- Модель игроков, матчей, карт, aliases и guest identities.
- Pipeline создания матча через commit и только после успешной серверной записи.
- Валидация, тесты, known issues и безопасный порядок диагностики.
- История графиков, tooltip и регрессии функции «Играли вместе».
- Правило отличать активные функции от исторических экспериментов.

Смысловые сведения объединены в корневых документах:
`PROJECT_MASTER.md`, `ARCHITECTURE.md`, `TECHNICAL_STATE.md`,
`CHAT_CONTEXT.md`, `DECISIONS.md` и `ROADMAP.md`.

## Важные оговорки из исходника

1. «Играли вместе» описана как историческая/отменённая функция, не как активная.
2. Снимок базы и перечисленные counts относятся к старому project ref и дате снимка.
3. Валидация aggregate rows и partial-series parity отмечены как точка проверки,
   а не как разрешение менять validator без проверки серверного контракта.
4. Не восстанавливать старые snapshots поверх живых данных.
5. Не считать тесты, браузерный QA или deployment пройденными без фактического запуска.

Исходный ZIP был предоставлен пользователем. В GitHub сохранён его индекс и
проверенные проектные знания; бинарный ZIP как вложение в этот commit не загружался.
