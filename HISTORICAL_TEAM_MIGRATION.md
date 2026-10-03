# Historical team reconstruction

The curated player database intentionally does not contain every person who appeared in the original matches. Therefore old matches cannot always be reconstructed as complete 5×5 lobbies.

For matches without stored `team_a` / `team_b`, the migration chooses a deterministic source order:
1. first detailed map with the most known player IDs;
2. first five known players -> `team_a`;
3. next five known players -> `team_b`;
4. if fewer than ten known players exist, the missing slots remain empty;
5. no unknown player is fabricated.

The result is marked with `team_assignment_source: historical_source_order`.

This is a **historical reconstruction for consistent UI/stat calculations**, not a claim that the original teams are known with certainty. New matches still require an explicit 5×5 assignment.
