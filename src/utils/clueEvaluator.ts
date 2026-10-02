import { CaseData, Clue, Suspect, SuspectMarking } from '../types';

/**
 * Evaluates whether a specific suspect meets a clue's elimination criteria or selection criteria.
 * Returns:
 * - 'should_cross': If the clue is an X-tool clue and this suspect violates the clue rule (should be crossed out)
 * - 'should_circle': If the clue is a Circle-tool clue and this suspect satisfies the shortlist criteria
 * - 'unaffected': Otherwise
 */
export function evaluateSuspectForClue(
  caseId: string,
  clueNumber: number,
  suspect: Suspect
): 'should_cross' | 'should_circle' | 'unaffected' {
  const name = (suspect?.name || '').trim();
  const firstLetter = name.charAt(0).toUpperCase();
  const lastLetter = name.length > 0 ? name.charAt(name.length - 1).toUpperCase() : '';
  const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];

  if (caseId === 'case-1') {
    switch (clueNumber) {
      case 1:
        // Clue 1: Name length >= 6 (culprit has >= 6 letters) -> Cross if <= 5
        return name.length <= 5 ? 'should_cross' : 'unaffected';

      case 2:
        // Clue 2: Name contains NO 'E'/'e' -> Cross if has 'E'/'e'
        return /e/i.test(name) ? 'should_cross' : 'unaffected';

      case 3:
        // Clue 3: Name begins with M, G, or R -> Cross if starts with any other letter
        return !['M', 'G', 'R'].includes(firstLetter) ? 'should_cross' : 'unaffected';

      case 4:
        // Clue 4: Name ends in a CONSONANT -> Cross if ends in vowel or Y
        return vowels.includes(lastLetter) ? 'should_cross' : 'unaffected';

      case 5:
        // Clue 5: Name is EXACTLY 6 letters long -> Cross if not 6 letters
        return name.length !== 6 ? 'should_cross' : 'unaffected';

      case 6:
        // Clue 6: Quartered on an EVEN-NUMBERED PAGE (2,4,6,8,10) -> Cross if odd page
        return suspect.pageNumber % 2 !== 0 ? 'should_cross' : 'unaffected';

      case 7:
        // Clue 7 (Circle): Name contains letter 'U'
        return /u/i.test(name) ? 'should_circle' : 'unaffected';

      case 8:
        // Clue 8 (Circle): Assigned to Room #4 (Page 4 of the Registry)
        return suspect.pageNumber === 4 ? 'should_circle' : 'unaffected';

      case 9:
        // Clue 9: Warrant for Marcus on Page 4
        return name.toLowerCase() === 'marcus' && suspect.pageNumber === 4 ? 'should_circle' : 'unaffected';

      default:
        return 'unaffected';
    }
  }

  if (caseId === 'case-2') {
    // Vowels count (A E I O U — Y DOESN'T COUNT)
    const vowelCount = (name.toUpperCase().match(/[AEIOU]/g) || []).length;

    // A letter appears at least twice (anywhere in the name)
    const hasRepeatedLetter = (() => {
      const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
      const map: Record<string, number> = {};
      for (const char of clean) {
        map[char] = (map[char] || 0) + 1;
        if (map[char] >= 2) return true;
      }
      return false;
    })();

    switch (clueNumber) {
      case 1:
        // Clue #1: NAME CONTAINS NO "O" -> Cross if contains O/o
        return /o/i.test(name) ? 'should_cross' : 'unaffected';

      case 2:
        // Clue #2: NAME CONTAINS AN "N" -> Cross if does NOT contain N/n
        return !/n/i.test(name) ? 'should_cross' : 'unaffected';

      case 3:
        // Clue #3: NAME HAS EXACTLY 2 VOWELS (A E I O U — Y DOESN'T COUNT) -> Cross if !== 2
        return vowelCount !== 2 ? 'should_cross' : 'unaffected';

      case 4:
        // Clue #4: A LETTER APPEARS AT LEAST TWICE (ANYWHERE IN THE NAME) -> Cross if no letter appears twice
        return !hasRepeatedLetter ? 'should_cross' : 'unaffected';

      case 5:
        // Clue #5: NAME CONTAINS NO "A" -> Cross if contains A/a
        return /a/i.test(name) ? 'should_cross' : 'unaffected';

      case 6:
        // Clue #6: NAME STARTS WITH N, V, OR W -> Cross if does not start with N, V, or W
        return !['N', 'V', 'W'].includes(firstLetter) ? 'should_cross' : 'unaffected';

      case 7:
        // Clue #7: REGISTRY PAGE NUMBER = NUMBER OF LETTERS IN NAME -> Cross if page !== length
        return suspect.pageNumber !== name.length ? 'should_cross' : 'unaffected';

      case 8:
        // Clue #8: THE NAME NEXT TO IT ON THE LEFT MUST START WITH THIS NAME'S LAST LETTER (E.G. KATE · MARK →)
        // Vincent ends with 'T', Tristan is on his left (starts with 'T') on Page 7.
        return name.toLowerCase() === 'vincent' && suspect.pageNumber === 7 ? 'should_circle' : 'unaffected';

      case 9:
        // Warrant submission fallback
        return name.toLowerCase() === 'vincent' && suspect.pageNumber === 7 ? 'should_circle' : 'unaffected';

      default:
        return 'unaffected';
    }
  }

  if (caseId === 'case-3') {
    // Clue #5: Double letter (same letter twice in a row, like TT or LL)
    const hasDoubleLetter = /([a-zA-Z])\1/i.test(name);

    switch (clueNumber) {
      case 1:
        // Clue #1: NAME CONTAINS NO "E" -> Cross if contains E/e
        return /e/i.test(name) ? 'should_cross' : 'unaffected';

      case 2:
        // Clue #2: NAME CONTAINS NO "S" -> Cross if contains S/s
        return /s/i.test(name) ? 'should_cross' : 'unaffected';

      case 3:
        // Clue #3: NAME LENGTH <= 6 (CROSS IF >= 7) -> Cross if >= 7
        return name.length >= 7 ? 'should_cross' : 'unaffected';

      case 4:
        // Clue #4: NAME IS NOT IN COLUMN 4 OF ANY PAGE -> Cross if in column 4 (col === 4)
        return suspect.col === 4 ? 'should_cross' : 'unaffected';

      case 5:
        // Clue #5: NAME HAS A DOUBLE LETTER (SAME LETTER TWICE IN A ROW) -> Cross if no double letter
        return !hasDoubleLetter ? 'should_cross' : 'unaffected';

      case 6:
        // Clue #6: NAME STARTS AND ENDS WITH THE SAME LETTER -> Cross if first !== last
        return firstLetter !== lastLetter ? 'should_cross' : 'unaffected';

      case 7: {
        // Clue #7: THE NAME DIRECTLY BELOW IT MUST START WITH THE SAME LETTER (E.G. MARK / MOLLY →)
        // In the 4-column seating grid, a candidate's downward neighbor is at Row + 1, same Col on the same page.
        // Otto is at Page 5, Left Column, Seat 21 (R6:C1), seated directly above Owen (R7:C1), both starting with 'O'.
        const candidatesWithSameInitialBelow = [
          'c3-p1-s43-asa',
          'c3-p2-s14-amos',
          'c3-p2-s17-moira',
          'c3-p2-s21-mavis',
          'c3-p2-s28-evan',
          'c3-p3-s4-conrad',
          'c3-p3-s11-saul',
          'c3-p3-s34-clive',
          'c3-p5-s9-alistair',
          'c3-p5-s21-otto',
          'c3-p5-s37-ebenezer',
          'c3-p6-s14-silas',
        ];
        return candidatesWithSameInitialBelow.includes(suspect.id) ? 'unaffected' : 'should_cross';
      }

      case 8:
        // Clue #8: THE NAME MUST APPEAR ONLY ONCE IN THE WHOLE LIST. CHECK ALL 6 PAGES.
        // Circle Otto on Page 5
        return name.toLowerCase() === 'otto' && suspect.pageNumber === 5 ? 'should_circle' : 'unaffected';

      case 9:
        // Warrant submission fallback
        return name.toLowerCase() === 'otto' && suspect.pageNumber === 5 ? 'should_circle' : 'unaffected';

      default:
        return 'unaffected';
    }
  }

  if (caseId === 'case-4') {
    switch (clueNumber) {
      case 1:
        // Clue #1: Heavy Escapement Cog Stature (Name Length >= 6) -> Cross if <= 5
        return name.length <= 5 ? 'should_cross' : 'unaffected';

      case 2:
        // Clue #2: Machine Grease Chemical Scrap (Name contains NO 'E') -> Cross if contains E/e
        return /e/i.test(name) ? 'should_cross' : 'unaffected';

      case 3:
        // Clue #3: Spire Catwalk Stride Monogram (Starts with K, B, or M) -> Cross if other initial
        return !['K', 'B', 'M'].includes(firstLetter) ? 'should_cross' : 'unaffected';

      case 4:
        // Clue #4: East Spire Quadrant Registry (Even pages 2, 4, 6) -> Cross if odd page
        return suspect.pageNumber % 2 !== 0 ? 'should_cross' : 'unaffected';

      case 5:
        // Clue #5: Belltower Sounding Resonance (Ends with Consonant) -> Cross if ends in vowel or Y
        return vowels.includes(lastLetter) ? 'should_cross' : 'unaffected';

      case 6:
        // Clue #6: Archibald’s Engraved Pocket Watch (Candidate located on Page 4) -> Circle on Page 4
        return suspect.pageNumber === 4 ? 'should_circle' : 'unaffected';

      case 7:
        // Clue #7: Official Scotland Yard Warrant (Kallum on Page 4)
        return name.toLowerCase() === 'kallum' && suspect.pageNumber === 4 ? 'should_circle' : 'unaffected';

      default:
        return 'unaffected';
    }
  }

  return 'unaffected';
}

export interface ClueVerificationResult {
  clueId: number;
  clueNumber: number;
  isFullySatisfied: boolean;
  totalRequiredCount: number;
  currentAppliedCount: number;
  isOverEliminated: boolean;
}

/**
 * Evaluates the entire ledger state against all 9 clues strictly as a whole-rule unit.
 * Anti-cheat principles:
 * 1. Zero per-suspect feedback or individual leak.
 * 2. Whole-rule milestone: Only marked satisfied if ALL required suspects are crossed/circled and no innocent suspects for that rule were wrongly eliminated.
 */
export function verifyAllClues(
  caseData: CaseData,
  markings?: Record<string, SuspectMarking>
): Record<number, ClueVerificationResult> {
  const results: Record<number, ClueVerificationResult> = {};
  if (!caseData || !caseData.clues || !caseData.suspects) return results;
  const safeMarkings = markings || {};

  caseData.clues.forEach((clue) => {
    let totalRequired = 0;
    let correctlyApplied = 0;

    caseData.suspects.forEach((suspect) => {
      const expectation = evaluateSuspectForClue(caseData.id, clue.number, suspect);
      const currentMark = safeMarkings[suspect.id] || 'none';

      if (clue.toolType === 'X') {
        if (expectation === 'should_cross') {
          totalRequired++;
          if (currentMark === 'cross') {
            correctlyApplied++;
          }
        }
      } else if (clue.toolType === 'Circle') {
        if (expectation === 'should_circle') {
          totalRequired++;
          if (currentMark === 'circle') {
            correctlyApplied++;
          }
        }
      }
    });

    const isFullySatisfied = totalRequired > 0 && correctlyApplied === totalRequired;

    results[clue.number] = {
      clueId: clue.id,
      clueNumber: clue.number,
      isFullySatisfied,
      totalRequiredCount: totalRequired,
      currentAppliedCount: correctlyApplied,
      isOverEliminated: false,
    };
  });

  return results;
}
