# Progress checkpoint — 2026-11-11

- [x] Restore the last full runtime snapshot on `faceit-dev`.
- [x] Integrate existing routes into a shared profile-inspired shell prototype (visuals remain provisional).
- [x] Perform read-only runtime, Supabase security and data integrity audits.
- [x] Inventory route and modal/workflow behavior from source: [route inventory](docs/FACEIT_V2_ROUTE_INVENTORY_2026-11-11.md).
- [x] Verify the current DEV dataset and series aggregate parity; document unresolved ELO rules.
- [x] Fix DEV Edge validation for blank optional dates and `manual_edit` provenance; deploy `cs2-admin` v3 to DEV only.
- [x] Fix player create/archive/restore status synchronization in the runtime source.
- [ ] Confirm GitHub Actions for the expanded 90-test suite (runs queued at checkpoint time).
- [ ] Browser QA on DEV and verify Cloudflare deployed SHA.
- [ ] Confirm owner decisions for BO3 1:1, series roster fallback and ELO chronology.
- [ ] After technical audit, implement each visual section from owner-supplied HTML/CSS/references.

---

# Roadmap — CS2 Analytics

План — очередь работ, не обещание сроков. Приоритет корректируется после аудита и согласования.

## Цель
Единая FACEIT-inspired платформа для нашей CS2-компании: профили, матчи, аналитика, история, сезоны, соревнования и автоматизированный импорт — на общей модели данных.

## 0. Project memory
- [x] Паспорт, архитектура, дизайн-система, технический статус и решения.
- [x] Автоматический GitHub commit journal workflow.
- [ ] Подтвердить выполнение workflow после push.
- [ ] Встроить обновление смысловых документов в каждый PR/task checklist.

## 1. Аудит и стабилизация
- Проверить DEV runtime и profile shell в браузере.
- Составить инвентаризацию страниц: работает / частично / placeholder / не проверено.
- Убедиться, что DEV config не обращается к production Supabase.
- Сохранить regression coverage до крупных UI изменений.

## 2. FACEIT V2 — профиль как основной сайт
- [x] Принять решение: профильный shell становится оболочкой всего сайта.
- [x] Восстановить runtime, account/profile, DEV config, regression tests и quality gate в faceit-dev.
- Инвентаризировать все текущие маршруты, кнопки, вкладки и действия: работает / частично / placeholder / лишнее.
- Утвердить компактную карту навигации внутри profile shell; не сохранять старую и новую навигацию параллельно.
- Подключить к одному shell существующие Players, Statistics, Matches/Series, Maps, Teams, Records, Seasons, Track и Settings.
- Сделать каждый видимый control рабочим; placeholders скрыть до готовности.
- Проверить desktop/tablet/mobile и переходы profile ↔ global sections.
- Подтвердить CI, DEV deployment SHA и browser QA перед переносом данных/новыми миграциями.


## 3. Общая аналитика
- Глобальная статистика и сравнение игроков.
- Список матчей и детальная страница матча.
- Track: общий раздел и персональное представление в профиле.
- Records/Achievements: общие рекорды и персональные достижения с прозрачными правилами.

## 4. Сезоны и соревнования
- Архив сезонов, standings и личная история.
- Внутренние турниры/лиги, связанные с матчами.
- Общие сущности данных для глобального раздела и профиля.
- Определить правила исторических рейтингов до реализации.

## 5. CS2 .dem importer — исследовать
- Проверить парсер на реальных CS2 demos.
- Проверить SteamID mapping, reconnects, overtime, bots, duplicate uploads и incomplete demos.
- Сделать dry-run preview до записи.
- Idempotency по hash/идентификатору демо.
- Разделить точно извлекаемые метрики и неподтверждённые.
- Запись в базу разрешать только после QA.

## 6. Финальный hardening
- Regression suite, browser smoke, responsive QA.
- Проверка persistence, realtime и ошибок.
- Проверка Cloudflare deployment SHA и DEV URL.
- Release notes и обновлённая документация.
- Production вне scope без отдельного разрешения.

Этап считается завершённым только после реализации, тестов и проверки критериев.


## Передача контекста / FACEIT research
- [x] Зафиксировать историю перехода от screenshot-only к исследованию настоящих FACEIT HTML/CSS.
- [x] Создать FACEIT_REFERENCE.md с найденными материалами, наблюдениями, workflow и handoff prompt.
- [ ] Проверить, есть ли исходные FACEIT HTML/CSS в GitHub; если нет — запросить у пользователя повторную загрузку.
- [ ] После получения исходников сохранить разрешённые reference материалы и конкретную карту selectors/fonts/DOM.

## Статус восстановления runtime — 2026-11-11

- Runtime восстановлен в `faceit-dev` отдельным commit `c8ee8cd8776bd4fc113d88a1531b5596db8fb45e`; 71 отобранный файл из snapshot `3b68040`.
- Восстановлены entrypoint, app/profile/account, CSS, Supabase DEV config/adapter, ELO, fallback data, assets, tests, migrations и quality gate.
- Quality gate для runtime recovery прошёл; после унификации shell commit `390a580d` прошёл `npm run check`: 83 теста, 0 ошибок. Workflow: https://github.com/nonspam/cs2-5x5/actions/runs/43091902336.
- DEV URL/deployed SHA/browser QA остаются непроверенными: workers.dev endpoint не открылся в веб-инструменте.

Следующий порядок:
1. Получить результат `npm run check` / GitHub Actions на новом HEAD.
2. Подтвердить Cloudflare deployed SHA и пройти browser QA desktop/mobile.
3. Провести полный аудит controls и маршрутов: рабочие / частичные / placeholders / удалить.
4. Завершить переход всех разделов на единый profile shell и проверить back/forward.
5. Подключить/проверить старые функции и сверить единые расчёты/данные.
6. После acceptance отдельно развивать Track, полноценные сезоны, ELO/calibration и seasonal rollover.
7. Production остаётся вне scope без отдельного разрешения.

Read-only findings до восстановления: docs/ENGINE_MIGRATION_AUDIT_2026-11-11.md.
