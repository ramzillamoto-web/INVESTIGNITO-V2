# CASE 4 — THE PENDULUM OVER BLACKWOOD SPIRE

**Case ID:** `case-004` · **Difficulty:** Mastermind · **Names:** 900 · **Pages:** 15 (4 columns × 15 rows)
**Estimated time:** 1–2 hours

## CARD TEXT

**Tagline:** A locked clocktower vault, thirteen midnight chimes, and 900 guild names
**Footer:** 900 GUILD MEMBERS • 7 CLUES • 15 PAGES
**Stats:** Suspects 900 Names · Clues 7 Clues · Est. Time 1–2 hours

**Briefing:**
"At the stroke of midnight, the bells of Blackwood Spire tolled thirteen times before grinding to a halt. Master horologist Archibald Blackwood was discovered fallen within the pendulum vault. The heavy brass gears had been jammed with an engraved cog tooth, and the registry ledger of 900 guild members holds the identity of the sabotaging conspirator. Use the 7 sequential clues, cross out innocent clockmakers across the 15 pages, and submit the warrant for the culprit!"

## CLUES

|#|Clue|Removes|Left|
|-|-|-|-|
|#1|NAME CONTAINS AN "R"|469|431|
|#2|NAME CONTAINS NO "E"|245|186|
|#3|NAME HAS A DOUBLE LETTER (SAME LETTER TWICE IN A ROW)|167|19|
|#4|NAME IS IN COLUMN 2 OR 3|7|12|
|#5|ROW NUMBER = NUMBER OF LETTERS IN NAME|3|9|
|#6|THE NAME DIRECTLY ABOVE STARTS WITH THE SAME LETTER (ROW 1 = CROSS, CROSSED NAMES COUNT)|3|6|
|#7|NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 15 PAGES, CROSSED NAMES INCLUDED)|5|**1**|

Warrant: submit culprit name + registry page.

## ANSWER

**Woodrow — Page 11**, Row 7, Column 3. Wanda is directly above him.
Woodrow appears once in the ledger. Portal hash: SHA-256 of `woodrow|11`.

## DECOYS (each fails only one clue)

|Fails only|Names (page, row, col)|
|-|-|
|#1|Allison (5,7,3) · Abby (13,4,2)|
|#2|Terrie (5,6,2) · Darrel (8,6,3)|
|#3|Rosalinda (3,9,2) · Armando (6,7,3)|
|#4|Norris (4,6,4) · Rosanna (10,7,1)|
|#5|Willard (2,3,3) · Rocco (4,8,3) · Carissa (5,11,2)|
|#6|Garry (7,5,2) · Murray (7,6,3) · Cassandra (7,9,3)|
|#7|Carroll (3,7,3) · Mallory (4,7,2) · Darryl (8,6,2) · Brianna (12,7,2) · Arron (15,5,2) — each appears twice|

## VERIFICATION

* Exactly one answer. All 5,040 clue orders give the same result.
* Every clue is needed. 20 names fail only one clue.
* 552 different first names across 900 slots; some repeat 2–4 times, which #7 relies on.
* Likely misreadings never produce one wrong answer:

|Misreading|Result|
|-|-|
|#3 read as "any repeated letter"|3 survivors|
|#4 read as columns 1 and 4|2 survivors|
|#5 read as page number|0 survivors|
|#6 read as name below|0 survivors|
|#6 read as name to the left|0 survivors|
|#6 read as above name ends with same letter|0 survivors|
|#7 read as once per page|6 survivors|
|#7 read as once among names not crossed|6 survivors|

## WHERE THE TIME GOES

|Step|Work|Time|
|-|-|-|
|#1|Check 900 names, cross \~470|25–40 min|
|#2|Check 431 names|10–15 min|
|#3|Check 186 names|5–8 min|
|#4–#6|19 names, look up rows and neighbours|5–10 min|
|#7|Search all 900 names for each of 6 finalists|20–35 min|

**Total: about 1–1.5 hours, up to 2 for slower players.**

## DEV NOTES

* Use the new name list in `case-004.json` / `case-004-pages.txt`.
* Show row numbers 1–15 down the left of every page.
* Keep the 4-column grid fixed on phones; #4, #5 and #6 depend on position.
* Crossed names must stay readable.
* No name search, and don't show how many names are left.

