# CS2 Analytics V54

## UX / UI changes
- Player profile form windows now show only AVG and K/D.
- Era cards now show only AVG and K/D.
- Recent detailed maps are single-line KDA + MVP rows with blue interface styling; no map score.
- Active map history is numbered by active map sequence: 61 → 51, automatically 62 → 52 after a new active map.
- Matches / games table now labels active maps as ИГРА 61 … ИГРА 1 and remains newest-first.
- Map scores use green for positive and red for negative results.
- Team Builder gets a top quick-player selector with search, so players no longer need to be reached from the bottom roster.
- Home hero background restored with the local Nuke artwork.
- Home promo mark restored as CS2 ANALYTICS; CS2 sizing tightened.

## Validation
- Core QA: PASS.
- Team probability QA: PASS.
- Legacy cleanup QA: PASS.
- V54 UX static QA: PASS.
- JavaScript syntax: PASS.
- Full dataset QA updated to the current 14/67/33 baseline and PASS.
- Chromium headless visual capture was attempted, but the environment did not complete the capture; no visual PASS is claimed from that attempt.
