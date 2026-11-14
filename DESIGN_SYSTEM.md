# Design system — FACEIT-inspired CS2 Analytics

## Цель и решение
Владелец выбрал единый FACEIT-inspired интерфейс для всего сайта, а не отдельный новый профиль рядом со старым интерфейсом. Общий shell должен постепенно объединить главную, игроков, профили, матчи, статистику, сезоны, Track, рекорды и настройки.

FACEIT profile OBASRAL и переданные screenshot/HTML/CSS — визуальный референс. Чужие данные, статистику и идентичность не переносить.

## Визуальные принципы
- Постоянная левая навигация и единые active/hover/focus состояния.
- Общие фон, шрифтовая шкала, интервалы, границы, поверхности и акцент.
- Повторяемые карточки, таблицы, графики, tabs, filters и метаданные.
- Плотная, но читаемая статистика.
- Сначала desktop reference, затем tablet/mobile.
- Уникальные разделы без прямого FACEIT аналога строить из тех же компонентов и визуального ритма.
- Декоративный макет не заменяет реальную страницу и её действия.

## Правила реализации
1. Перед CSS-правкой найти DOM и действующий cascade.
2. Предпочитать scoped styles с понятным root class.
3. Избегать широких global selectors без необходимости.
4. Не оставлять конкурирующие CSS rules без понимания порядка.
5. Сохранять handlers, data bindings, permissions и persistence.
6. Сверять screenshot при одинаковом viewport.
7. Проверять overflow, клики, focus, empty/error states и mobile.
8. Не заявлять pixel-perfect без реального сравнения рендера.

## Приёмка страницы
- Есть ли точный FACEIT аналог и screenshot?
- Что уникально для CS2 Analytics?
- Какие данные и действия должны сохраниться?
- Какие общие компоненты переиспользуются?
- Совпадают ли иерархия и spacing?
- Работают ли фильтры, переходы и пустые состояния?
- Проверены ли desktop и mobile?
- Обновлены ли документы и QA evidence?

## Источники
Исходные FACEIT HTML/CSS выгрузки передавались в предыдущем чате и не являются гарантированно доступными файлами репозитория. Если их не окажется в новом чате, попросить пользователя прикрепить повторно.


## FACEIT research — ключевой метод
Не пытаться воспроизвести сложный интерфейс только по screenshot, если доступны исходные материалы. В предыдущей работе screenshot-only подход не давал нужного результата. Перелом наступил после изучения HTML + CSS реальной FACEIT profile page: это раскрыло типографику, selectors, avatar/cover, hero, gradients и stat tiles. Подробная история и handoff: [FACEIT_REFERENCE.md](FACEIT_REFERENCE.md).

Семейства, замеченные в выгрузке: Geist Variable, Geist Mono, Play, Coiny, Goldman. Это не готовая карта назначения шрифтов — проверить конкретные declarations и computed styles при повторном доступе к исходникам. Исходные большие HTML/CSS файлы пока не подтверждены в GitHub; если отсутствуют, попросить пользователя загрузить их повторно.


## CSS readiness checkpoint — 2026-11-12

The current stylesheet is a prototype layered onto a dense legacy cascade. Static measurements, shell selector map, risks and the staged implementation plan are documented in [the CSS readiness audit](docs/FACEIT_V2_CSS_READINESS_AUDIT_2026-11-12.md). Planning estimate: about 80% of technical preparation is complete before the owner-directed CSS pass; final approved visual implementation is only about 5–10% complete. Do not start broad restyling until the original FACEIT HTML/CSS reference extracts are available and the DEV browser baseline is captured.


## FACEIT reference archive received — 2026-11-12

The owner has now supplied a RAR5 archive with four UTF-8 page captures: player history, match room overview/statistics, seasons, and Track Stats. The archive has been inspected and mapped by screen. See [the reference archive inventory](docs/FACEIT_REFERENCE_ARCHIVE_INVENTORY_2026-11-12.md).

These are HTML/page snapshots with embedded or appended CSS material, not four clean standalone stylesheets. The Track capture also contains extension-injected CSS, which must be excluded from the app's visual layer. The previous note that the original reference files were not available in the current conversation is superseded by this upload.

Implementation order: shared profile shell + player history; seasons; match room; Track Stats. Keep CSS scoped to the appropriate page/component roots, preserve existing app data and handlers, and do not claim pixel-perfect fidelity before fixed-viewport browser comparison.


## Owner feedback pass 02 — 2026-11-12

Applied on `faceit-dev`:
- The global player identity card (avatar, nickname, ELO, match count, profile button) is now only rendered by the Profile route. Other routes render the shared navigation and their page content without a persistent player card.
- The first navigation label is «Главное». Existing functional sections remain present; no section was removed without owner direction.
- Navigation controls are wider, transparent, and use a subtle outline instead of a solid filled active rectangle. Tablet collapses to an icon rail; mobile keeps a horizontal navigation strip.
- The oversized season-selection cards were replaced with compact outlined rows.
- The seasons archive now renders series scores through the shared `scoreMarkup` helper, so the leading side is green, trailing side is red, and a tie/unknown score remains neutral.
- The Profile route already has a separate «История матчей» tab with all matches and the existing per-match details; this behavior is covered by a regression test.

This pass is source-level and covered by [quality gate run 43128656306](https://github.com/nonspam/cs2-5x5/actions/runs/43128656306) (141 passed / 0 failed). It has not been visually browser-tested or deployed to Cloudflare. Continue with the supplied FACEIT references section by section and capture browser comparisons before accepting visual fidelity.


## Owner refinement — Match Room text navigation and restrained geometry (2026-11-14)
- Match Room top-level tabs are text-only. No oval/pill background, border, shadow or decorative halo; active state is an orange underline.
- Do not add oval/pill decoration elsewhere unless the owner explicitly requests it.
- Statistics team tables should not be enclosed in an additional tinted team card. Use restrained side identity (first roster blue, second roster yellow) in the team heading.
- Prefer compact information density: leader cards and TOP rows should use space for actual identity/metrics rather than empty width. Long player names must remain readable, not be silently truncated.
- TOP result colors: K/D > 1.00 green, K/D = 1.00 neutral white, K/D < 1.00 red; the K/D/A score string follows the same row result state.


## Match Room Statistics/TOP — second owner refinement (2026-11-14)
- Leader cards use a left identity group and right-aligned value/label group.
- Each Statistics player row is visually separated; team color is confined to the player/rank identity block with a distinct boundary. Do not reintroduce an enclosing team-wide card.
- TOP list is centered and compact (desktop max-width 980px); long names remain on one line rather than wrapping by character.
- TOP name, K/D/A and K/D use the same state derived from K/D: >1 green, =1 white, <1 red.
- MVP avatar must still render when the match stat row has no linked profile ID: use the display name's initial as fallback.


## Match Room Statistics — compact table and FACEIT rank badges (2026-11-14)
- Remove the leading ordinal column from the Statistics scoreboard; retain player, rank, K, D, A and K/D.
- Keep the Statistics team tables centered and constrained to a compact desktop width. Explicitly size player and rank columns to prevent excessive empty space.
- Tint only the player identity cell (team A blue/purple; team B green/teal). Rank cells are neutral and bounded by vertical separators; K/D/A metric cells remain neutral.
- Team B header/score uses green, not yellow.
- FACEIT level badge uses a circular dark center and growing colored arc. Level color mapping from supplied reference: 1 white, 2–3 green, 4–7 yellow, 8–9 orange, 10 red. Never infer missing levels.


## Match Room Statistics — losing-team amber and refined FACEIT badge (2026-11-14)
- Losing Team B identity treatment is amber/yellow: team label, score, player identity cells and left row accent. Do not use winner green for the losing team. Rank column remains neutral and is not tinted by team identity.
- FACEIT level badge uses compact inline SVG: dark center, neutral circular track, level-colored progress arc, smaller centered numeral. Arc length is proportional to level 1–10. Colors: 1 white, 2–3 green, 4–7 yellow, 8–9 orange, 10 red. Missing level stays unknown; never infer from rating.


## Match Room Statistics — neutral rank column and corrected FACEIT arc (2026-11-14)
- Team tint is restricted to the player-name column. Both the rank header and rank cells must remain neutral/default for either team; keep vertical separators. Never allow team tint to bleed into rank cells.
- FACEIT badge progress uses an SVG 270-degree arc from lower-left over the top to lower-right, with neutral track, colored progress and smaller centered numeral. Do not use the previous broken partial-circle dash geometry.


## Match Room Statistics — amber divider and readable FACEIT numeral (2026-11-14)
- Lower/losing Team B player identity stays amber. The right divider at the rank column's edge must also be amber (not leftover teal). Rank cell background remains neutral/default; team color is only on the player identity cell plus the narrow separator accents.
- FACEIT badge is 28px with a 12px centered numeral, retaining the 270-degree progress arc and level color mapping.
