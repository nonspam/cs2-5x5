# Match Center — контрольная точка проекта
Дата: 2026-11-12
Репозиторий: `nonspam/cs2-5x5`
Рабочая ветка: `faceit-dev`
Среда: DEV only

## Зачем сохранена эта точка
Зафиксировать актуальный результат после серии правок Match Center и адаптации обзора матча под референс FACEIT Match Room, загруженный владельцем в `design-references/inbox/image.png`. Это handoff для продолжения в новом чате: сначала прочитать этот файл, затем проверить HEAD и исходники.

## Что пройдено и сделано
1. Первая версия Match Center перестроила обзор: квадратный/карточный map hero, победитель слева, проигравший справа, названия команд из первого игрока ростера как временный proxy, убраны агрегированные team KPI, добавлена сетка карьерных показателей игроков, прямоугольные карты и цветовые состояния K/D/A и +/-.
2. После сообщения владельца о том, что матчи перестали открываться из профиля, найден и исправлен runtime bug: использовался несуществующий публичный метод `CS2EloV3.playerData(id)`; фактический экспорт — `CS2EloV3.player(id)`. Добавлен regression assertion.
3. Создан inbox для референсов `design-references/inbox/`; владелец загрузил `image.png`.
4. Обзор матча адаптирован под композицию референса: широкий верхний hero с форматом/датой/картой, командами/аватарами и счётом; ниже три колонки — ростер победителя слева, центральная информация/карты серии, ростер соперника справа. Карточки игроков уплотнены; layout имеет responsive перестройку на узких экранах.
5. Contract tests обновлены под текущую композицию и основные Match Center contracts.

## Текущие кодовые точки
- Базовая реализация Match Center: `d9f9b0a1073f511ace6a149194230481dfa3d4fb`.
- Исправление открытия матча из профиля: `2232bc2a4c0d7aeb6b4e892023d9d0a9451638f8`.
- Перестройка обзора под Match Room reference: `a22a1f6640d6578d42732893acc4b85fc1db6965`.
- Последний source/test commit перед этой документационной точкой: `6cd35f76c29007dfa27ee8d2ab322d4b8ca36d96`.
- Последний известный branch HEAD перед checkpoint commit: `840648bb1a641c00bacab4ddc1c9943dc2abe37c` (автоматический project journal commit).

Основные файлы: `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `CHAT_CONTEXT.md`.

## Что подтверждено
- GitHub Actions Quality Gate для source/test SHA `6cd35f76c29007dfa27ee8d2ab322d4b8ca36d96`: success, `npm run check`, 182 tests passed, 0 failed. Run: https://github.com/nonspam/cs2-5x5/actions/runs/43258651699.
- Project memory journal workflow для этого SHA: success, run https://github.com/nonspam/cs2-5x5/actions/runs/43258660047.
- Референс существует в DEV ветке: `design-references/inbox/image.png`.
- Исправленное имя ELO API подтверждено исходником и regression test.

## Что НЕ подтверждено / не реализовано
- Не выполнялись browser QA, реальная проверка в DEV браузере и deployment; не утверждать, что визуальная реализация уже принята владельцем или задеплоена.
- Не проверено повторно по сообщению владельца, что открытие матча после hotfix действительно работает у него.
- Veto history/picks/bans, win-rate по карте и вероятности победы не представлены текущим подтверждённым data contract — не выдумывать.
- KR, ADR, HS%, damage и entry-kill метрики отсутствуют в текущем runtime-потоке; показывать unavailable state, не подставлять нули и не выводить из K/D/A.
- Реального captain field не подтверждено; имя команды из первого игрока ростера — только proxy.
- MVP scoring и awards не реализованы; сначала нужен источник метрик и согласованная формула.

## Следующий шаг
Попросить владельца проверить обновлённый Match Center в DEV и прислать скриншоты/точечные замечания через `design-references/inbox/`. Затем сравнить реальный результат с `image.png` и исправлять только отмеченные им расхождения. Перед изменениями проверить актуальный `faceit-dev` HEAD и код; не откатывать исправления профиля/сезонов/Track, которые попали в последующие коммиты.

## Ограничения проекта
- Все изменения только в `faceit-dev`.
- Не менять `main`, production deployment или production Supabase.
- Не выполнять DB writes/schema/migrations/RLS/grants без отдельного разрешения.
- Не заявлять browser QA/deploy без фактической проверки.

## 2026-11-12 — Match Center reference pass 2
Владелец загрузил два новых эталона: `design-references/inbox/1.png` (MVP + четыре award rows) и `design-references/inbox/2.png` (компактная карточка игрока). Реализовано в `app_v57.js` и `style_v57.css`:
- Veto/map list теперь компактные прямоугольные строки: квадратная миниатюра, имя карты, счёт справа; старые большие map cards с подвалом MVP/coverage убраны из обзора.
- Игрок в Match Center: квадратный аватар, ник, текущий CS2EloV3 rating и level, ниже компактные карьерные метрики.
- В Statistics добавлен крупный MVP-блок и четыре award строки: kills выводится из подтверждённых aggregate K/D/A; damage, KAST и entry kills пока помечены как недоступные, так как источник их не содержит.
- MVP пока выбирается детерминированно по убийствам, при равенстве — по K/D; это временный явный критерий, не полноценная оценка влияния.
- Contract tests обновлены под новую структуру.
Quality Gate: commit `2855accc3f83fb9a4110293a4d63e6f2a9cca7e1`, run https://github.com/nonspam/cs2-5x5/actions/runs/43261367570, 183 passed / 0 failed.
Не выполнялись browser QA и deployment; визуальная приёмка владельцем ожидается. Не менять main/production/DB.
