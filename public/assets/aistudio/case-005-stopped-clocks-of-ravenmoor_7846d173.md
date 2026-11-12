# CASE 5 — THE STOPPED CLOCKS OF RAVENMOOR

**Case ID:** `case-005` · **Difficulty:** Grandmaster · **Names:** 900 · **Pages:** 15 (4 columns × 15 rows)
**Estimated time:** 6–8 hours

## CARD TEXT

**Tagline:** A storm-bound hotel, every clock stopped at 3:17, and 900 names in the register
**Footer:** 900 GUESTS • 7 CLUES • 15 PAGES
**Stats:** Suspects 900 Names · Clues 7 Clues · Est. Time 6–8 hours

**Briefing:**
"The storm cut the Ravenmoor Hotel off from the world at midnight. By morning, Lady Imogen Ravenmoor lay dead in the clock room — and every clock in the building had stopped at exactly 3:17. No one could have left through the flooded roads. The hotel register lists 900 names across 15 pages, and one of them stopped the clocks. Use the 7 clues, cross out the innocent across all 15 pages, and submit the warrant for the killer!"

## CLUES

| # | Clue | Removes (in order) | Left | Removes if done first |
|---|---|---|---|---|
| #1 | NAME CONTAINS AT LEAST ONE LETTER FROM THE WORD "CLOCK" (C, L, O OR K) | 206 | 694 | 206 |
| #2 | NAME HAS 5 TO 8 LETTERS | 144 | 550 | 177 |
| #3 | THE LAST LETTER OF THE NAME APPEARS NOWHERE ELSE IN THE NAME (E.G. MARK ✓ · ANNA ✗) | 122 | 428 | 197 |
| #4 | NAME HAS MORE CONSONANTS THAN VOWELS (VOWELS = A E I O U) | 101 | 327 | 195 |
| #5 | THE NAME DIRECTLY BELOW CONTAINS AN "E" (ROW 15 = CROSS · CROSSED NAMES COUNT) | 116 | 211 | 287 |
| #6 | ANOTHER NAME ON THE SAME PAGE STARTS WITH THE SAME LETTER (CROSSED NAMES COUNT) | 98 | 113 | 212 |
| #7 | NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 15 PAGES · CROSSED NAMES COUNT) | 112 | **1** | 205 |

Warrant: submit killer's name + registry page.

**No easy clues:** every clue takes real checking. No clue wipes a whole column or page. No clue removes more than about a third of the list on its own. Whatever order a player uses, the last clue still leaves 51–113 names to check.

## ANSWER

**Clement — Page 12**, Row 6, Column 3. Keith is directly below him.
Clement appears once in the ledger. Portal hash: SHA-256 of `clement|12`.
The victim (Imogen) and the hotel name (Ravenmoor) don't appear in the ledger.

## DECOYS

491 names fail only one clue.

| Fails only | Count | Examples |
|---|---|---|
| #1 | 61 | Amber, Sandi, Merna |
| #2 | 51 | Charlotte, Kathaleen, Kip |
| #3 | 62 | Cheyenne, Kymberly, Rachele |
| #4 | 61 | Lidia, Livia, Coralie |
| #5 | 50 | Linda, Lacey, Lenard |
| #6 | 94 | Glenna, Norah, Quincy |
| #7 | 112 | Charles, Melissa (each appears 2–3 times) |

## VERIFICATION

- Exactly one answer. All 5,040 clue orders give the same result.
- Checked again from `case-005-pages.txt` by a separate script.
- Likely misreadings never produce one wrong answer:

| Misreading | Result |
|---|---|
| #1 counted only C or K | Clement (same answer) |
| #1 needs all of C, L, O, K | 0 survivors |
| #2 read as 6–7 letters | Clement (same answer) |
| #2 read as 4–8 letters | 13 survivors |
| #3 read as first letter | 59 survivors |
| #4 counting Y as a vowel | Clement (same answer) |
| #4 read as "at least as many" | 37 survivors |
| #5 read as name above | 5 survivors |
| #5 read as this name contains E | 30 survivors |
| #6 read as same row or same column | Clement (same answer) |
| #6 read as no other name shares the letter | 94 survivors |
| #7 read as once per page | 110 survivors |
| #7 read as once among names not crossed | 25 survivors |

## WHERE THE TIME GOES

| Step | Work | Time |
|---|---|---|
| #1 | Check 900 names for C/L/O/K | ~60 min |
| #2 | Count letters in 694 names | ~35 min |
| #3 | Check last letter in 550 names | ~35 min |
| #4 | Count consonants and vowels in 428 names | ~45 min |
| #5 | Look below 327 names | ~25 min |
| #6 | Scan the page for 211 names | ~90 min |
| #7 | Search all 900 names for each of 113 finalists | ~2.5–3 hrs |

**Total: about 7.5 hours in the listed order.** The fastest possible order still takes about 7.5 hours. So 6–8 hours is a fair label. Confirm with timed playtests.

## DEV NOTES

- Use `case-005.json` / `case-005-pages.txt`.
- Show row numbers 1–15 down the left of every page.
- Keep the 4-column grid fixed on phones.
- Crossed names must stay readable; #5, #6 and #7 all count them.
- No name search, and don't show how many names are left.
- Players will need to stop and come back, so marking state must save on every tap.
