# CASE 6 — THE LAST VOYAGE OF THE HALCYON

**Case ID:** `case-006` · **Difficulty:** Grandmaster+ · **Names:** 1,200 · **Pages:** 20 (4 columns × 15 rows)
**Estimated time:** 10–11 hours

## CARD TEXT

**Tagline:** A liner lost in the storm, a captain dead on the bridge, and 1,200 names on the manifest
**Footer:** 1,200 PASSENGERS • 7 CLUES • 20 PAGES
**Stats:** Suspects 1,200 Names · Clues 7 Clues · Est. Time 10–11 hours

**Briefing:**
"Three days out of Southampton, the Halcyon sailed straight into the worst storm in forty years. At 4:00 a.m. the bridge fell silent. Captain Edmund Vale was found dead at the helm, the ship's log torn from its binding and the radio smashed. No lifeboat had been lowered. No one could have left the ship. The passenger manifest holds 1,200 names across 20 pages, and one of them put the Halcyon off course. Use the 7 clues, cross out the innocent across all 20 pages, and submit the warrant for the killer!"

## CLUES

| # | Clue | Removes (in order) | Left | Removes if done first |
|---|---|---|---|---|
| #1 | NAME CONTAINS AT LEAST ONE LETTER FROM THE WORD "SHIP" (S, H, I OR P) | 258 | 942 | 258 |
| #2 | NAME HAS 4 TO 7 LETTERS | 186 | 756 | 198 |
| #3 | THE FIRST LETTER OF THE NAME APPEARS NOWHERE ELSE IN THE NAME (E.G. MARK ✓ · ANNA ✗) | 155 | 601 | 198 |
| #4 | NAME CONTAINS AT LEAST TWO DIFFERENT VOWELS (A E I O U) (E.G. MARIE ✓ · ANNA ✗) | 144 | 457 | 247 |
| #5 | THE NAME DIRECTLY ABOVE CONTAINS AN "A" (ROW 1 = CROSS · CROSSED NAMES COUNT) | 169 | 288 | 317 |
| #6 | ANOTHER NAME ON THE SAME PAGE STARTS WITH THE SAME LETTER (CROSSED NAMES COUNT) | 159 | 129 | 274 |
| #7 | NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 20 PAGES · CROSSED NAMES COUNT) | 128 | **1** | 224 |

Warrant: submit killer's name + registry page.

**No easy clues:** every clue needs each name checked. No clue wipes a column or page. No clue removes more than about a quarter of the list on its own. Whatever order a player uses, the last clue still leaves 97–151 names to check.

## ANSWER

**Phineas — Page 14**, Row 9, Column 2. Karri is directly above him.
Phineas appears once in the ledger. Portal hash: SHA-256 of `phineas|14`.
The victim (Edmund Vale) and the ship's name (Halcyon) don't appear in the ledger.

## HOW IT COMPARES TO CASE 5

| | Case 5 | Case 6 |
|---|---|---|
| Names | 900 | 1,200 |
| Pages | 15 | 20 |
| Names that fail only one clue | 491 | 813 |
| Names left before the last clue | 113 | 129 (each searched across 1,200, not 900) |
| Estimated time | ~7.5 hrs | ~10.5 hrs |

## DECOYS

813 names fail only one clue.

| Fails only | Count | Examples |
|---|---|---|
| #1 | 105 | Louanne, Lenard, Latoya |
| #2 | 98 | Clementine, Steffanie, Reinaldo |
| #3 | 96 | Concha, Susana, Leila |
| #4 | 96 | Chanda, Sara, Sindy |
| #5 | 140 | Daniel, Cordia, Marica |
| #6 | 150 | Elois, Noah, Kennith |
| #7 | 128 | Masako, Loria (each appears 2–3 times) |

## VERIFICATION

- Exactly one answer. All 5,040 clue orders give the same result.
- Checked again from `case-006-pages.txt` by a separate script.
- Likely misreadings never produce one wrong answer:

| Misreading | Result |
|---|---|
| #1 needs all of S, H, I, P | Phineas (same answer) |
| #1 counted only S or H | Phineas (same answer) |
| #2 read as 5–6 letters | 0 survivors |
| #2 read as 4–8 letters | 60 survivors |
| #3 read as last letter | 54 survivors |
| #4 counting Y as a vowel | 37 survivors |
| #4 read as two vowels total | 46 survivors |
| #5 read as name below / to the left / this name | 101 / 94 / 116 survivors |
| #6 read as same row or same column only | 0 survivors |
| #6 read as no other name shares the letter | 150 survivors |
| #7 read as once per page | 122 survivors |
| #7 read as once among names not crossed | 13 survivors |

## WHERE THE TIME GOES

| Step | Work | Time |
|---|---|---|
| #1 | Check 1,200 names for S/H/I/P | ~80 min |
| #2 | Count letters in 942 names | ~45 min |
| #3 | Check first letter in 756 names | ~50 min |
| #4 | Check vowels in 601 names | ~50 min |
| #5 | Look above 457 names | ~40 min |
| #6 | Scan the page for 288 names | ~2 hrs |
| #7 | Search all 1,200 names for each of 129 finalists | ~4–4.5 hrs |

**Total: about 10.5–11 hours in the listed order.** The fastest possible order still takes about 10.5 hours. That's roughly 3 hours more than Case 5. Confirm with timed playtests.

## DEV NOTES

- The app must support 20 pages for this case (Case 5 has 15).
- Use `case-006.json` / `case-006-pages.txt`.
- Show row numbers 1–15 down the left of every page.
- Show the full clue wording, including the brackets. The Case 4 support ticket came from the row-1 rule being missed.
- Keep the 4-column grid fixed on phones.
- Crossed names must stay readable.
- No name search, and don't show how many names are left.
- Progress must save on every tap; nobody finishes this in one sitting.
