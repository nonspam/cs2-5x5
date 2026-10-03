# CS2 Analytics — RADICAL UI V18 / MATCH WIZARD PRECISION

Based on V17. Focus: admin match creation UX and archived-player cleanup.

- BO1/BO3/BO5 are visible buttons with clear selected state; the old native select is removed from the wizard.
- Map selection shows a live ordered selected-map strip and numbered selected chips.
- Team selection uses two fixed 5-slot columns with player dropdowns, one player per slot, no cycling.
- Archived players can be restored; permanent delete is available only for archived players with no historical references, and the delete operation removes aliases too.
- Server and Supabase apply/delete support added for the new player-delete operation.
- No base data files were edited.
