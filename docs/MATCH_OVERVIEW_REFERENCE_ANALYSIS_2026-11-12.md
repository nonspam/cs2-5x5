# Match Overview — разбор FACEIT HTML/CSS референса

Дата: 2026-11-12  
Ветка реализации: `faceit-dev`  
Источник: вложение пользователя `матч внутри,обозр и стата(1).txt`

## Состояние исходника

Файл прочитан из вложения текущего чата: 1,198,716 символов текста (около 1.23 MB), 27,024 строки. Внутри:
- HTML-фрагмент страницы и DOM-дерево;
- 10 встроенных `<style>` блоков;
- отдельный CSS-фрагмент;
- 182 media rules;
- 1,600 inline `style=` атрибутов.

Важно: в CSS-фрагменте нет правил для большинства runtime-generated styled-components классов из DOM (например, `dQjJRW`, `jMxZgL`, `eIvLRN`, `gaGmSc`). Поэтому DOM-иерархия и некоторые inline размеры подтверждены, но нельзя честно заявлять, что весь точный computed CSS FACEIT восстановлен из этого файла. При дальнейшем сравнении не выдавать приблизительные стили за исходные пиксельные значения.

## Нативная структура Match Room

1. **Локальная навигация:** заголовок «Комната матча», вкладки «Обзор» и «Статистика», справа действия комнаты.
2. **Метаданные матча:** тип/формат, регион, карта, дата, серверный регион/флаг. В CS2 Analytics часть этих полей отсутствует — показывать только то, что действительно хранится.
3. **Score card:** две стороны матча, уровень/рейтинг, статус победителя, имя состава, аватар, счёт; между сторонами — VS.
4. **Основная сетка из трёх колонок:** ростер первой команды, центральная колонка матча, ростер второй команды.
5. **Ростер:** заголовок «Игроки», компактные карточки участников, аватар, ник, ELO/уровень и дополнительные метрики.
6. **Центральная колонка:** в исходной комнате присутствуют сервер, карта, veto/demo и дополнительные блоки.

### Нативный FACEIT vs расширение браузера

В DOM присутствуют и элементы, добавленные сторонним расширением: `fc-strip`, `fc-note`, `faceit-lobby-stats`, `fc-plate`, `fc-team-panel`, блоки прогноза и win probability. Это не следует считать нативной частью FACEIT. Значения вроде RWS, ADR/HS%, last-5-games, forecast, dead weight и team win-rate в данном snapshot принадлежат расширению. Их CSS не найден в переданном FACEIT stylesheet.

Не переносить эти значения в CS2 Analytics как реальные данные матча и не подменять ими отсутствующие поля.

## Подтверждённые визуальные опоры

- Основной шрифт stylesheet: семейство Geist; встречаются также Geist Mono, Play, Coiny и Goldman. Само присутствие семейства не доказывает его использование каждым элементом.
- Глобальная максимальная ширина контента: `--f-width-content-max: 1480px`.
- Базовые spacing tokens: 2, 4, 8, 12, 16, 20, 24, 32, 40, 56 и 80 px.
- Базовая палитра поверхностей: `#060606`, `#121212`, `#1d1d1d`, `#242424`, `#2e2e2e`.
- Основной акцент FACEIT: `#ff4b00`; outcome success использует зелёную палитру.
- В DOM явно указан rank icon 38×38 px; avatar components имеют size 40; skill-level icon в player row — 32×32 px.
- В stylesheet встречаются responsive media breakpoints 540, 768, 1080, 1320 и 1620 px, а также отдельные правила для узких экранов. Это breakpoints stylesheet в целом, не доказательство breakpoint именно Match Room.

## Сопоставление с CS2 Analytics

Текущий runtime — vanilla JS SPA; детали матча открываются через `openMatchDetail(id)` в modal/drilldown, а не отдельным URL route.

Для Overview используются только доступные данные приложения:
- `m.format`, дата и длительность;
- серия карт, названия карт и подтверждённые счёты;
- roster groups и существующие player records;
- текущий CS2EloV3 rating/level;
- существующие career summary и match aggregate stats.

У приложения нет подтверждённых team names, FACEIT server, veto history, demo URL или forecast source. Поэтому в score card используются нейтральные обозначения «Состав 1/2», средний ELO подписан как **текущий**, а неподдерживаемые server/veto/probability данные не рисуются. Не использовать имена команд/серверы/статистику из примера FACEIT как данные нашего продукта.

## Implementation map

| FACEIT area | CS2 Analytics implementation |
|---|---|
| Local nav + tabs | `.match-room-nav`, `.match-room-tabs`; существующие handlers `setMatchTab` сохранены |
| Breadcrumb/meta | `.match-room-breadcrumbs`, `.match-room-top-meta`; только формат, карта и дата из записи |
| Score card | `.match-room-result`, `.match-room-side`, `.match-room-rank-mark`; score из series_score, средний текущий ELO из существующих player ratings |
| Left/right rosters | `.match-room-team`, `.match-room-roster-heading`, существующие `.match-player-card-ref` |
| Center | существующие `.match-room-center`, `.match-room-info`, `.match-room-map-list` |
| Statistics | Оставлена существующая отдельная вкладка; визуальный этап Statistics не выполнялся |

Средний ELO — арифметическое среднее текущих rating известных игроков в каждом составе, округлённое до целого. Это не исторический ELO на дату матча; UI прямо маркирует его как текущий. Если rating недоступен, выводится «—».

## Выполненные изменения в faceit-dev

- `app_v57.js`: локальная навигация Match Room, FACEIT-подобный score card, нейтральные названия составов, ростер-заголовки и текущий средний ELO.
- `style_v57.css`: локально scoped Match Room surfaces, типографика, размеры, трёхколоночная сетка и responsive переходы.
- `tests/faceit-v2-shell.test.cjs`: contract assertions для иерархии Overview и отсутствия неподтверждённых server/forecast/demo значений.

Statistics renderer не редактировался. DB, SQL, RLS, grants, migrations, production и deployment не затрагивались. Browser QA не выполнялся.
