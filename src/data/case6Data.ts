import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import { CASE_6_LEDGER_NAMES } from './case6Names';

// Official Evidence Dossiers for Case 6
export const CASE_6_DOSSIERS: EvidenceDossier[] = [
  {
    id: 'dossier-6-1',
    category: 'Forensic Report',
    title: 'Bridge Crime Scene: Captain Edmund Vale',
    author: 'First Officer Donald Sterling & Ship Surgeon Dr. Charles Finch',
    timestamp: '04:25 AM • Ship’s Bridge',
    summary:
      'Captain Edmund Vale was discovered dead at the helm during the height of the storm. The compass housing was struck and the ship’s logbook torn from the pedestal.',
    details: [
      'Victim identity confirmed: Captain Edmund Vale, Master of the S.S. Halcyon.',
      'Time of death estimated at precisely 4:00 AM, coinciding with the bridge telegraph disconnect.',
      'Cause of death: Blunt trauma to the temple from a heavy brass navigational divider.',
      'The radio room was smashed from the inside, preventing distress calls across the Atlantic.',
      'No lifeboats were deployed. All 1,200 registered passengers remain aboard across 20 manifest pages.'
    ],
    keyObservation: 'The perpetrator was aboard the vessel, entered the bridge unnoticed during the storm, and sabotaged the course.',
    stamp: 'MARITIME INQUEST SEAL'
  },
  {
    id: 'dossier-6-2',
    category: 'Witness Statement',
    title: 'Purser Deposition: The Passenger Ledger',
    author: 'Arthur Vance, Chief Purser',
    timestamp: '04:50 AM • Purser’s Office',
    summary:
      'The passenger ledger holds exactly 1,200 souls across 20 pages. The perpetrator is unquestionably inscribed upon the manifest.',
    details: [
      '“The weather was so severe that all companionway hatches to the open deck were battened down at midnight.”',
      '“Not a single person could have boarded or left the liner since our departure from Southampton.”',
      '“Every passenger is accounted for in the 20-page registry ledger, sixty names to each page.”'
    ],
    keyObservation: 'The killer is listed under a verified passenger name somewhere within the 20 pages of the manifest.',
    stamp: 'SWORN MANIFEST'
  },
  {
    id: 'dossier-6-3',
    category: 'Butler Log',
    title: 'Watch Officer Companionway & Steerage Sweep',
    author: 'Second Officer Julian Cole',
    timestamp: '05:15 AM • Deck B Corridor',
    summary:
      'Security sweeps of all passenger quarters reveal soaked trench coats and grease marks matching the steering quadrant access latch.',
    details: [
      'The steering cable junction on Deck C had been tampered with right after Captain Vale was attacked.',
      'Footprints bearing heavy maritime salt residue lead back from the bridge directly to passenger berths.',
      'Eliminating innocent passengers using the 7 navigational clues is the only certain way to unmask the saboteur.'
    ],
    keyObservation: 'The saboteur intentionally altered the Halcyon’s heading before retreating into the passenger manifest.',
    stamp: 'OFFICER DISPATCH'
  },
  {
    id: 'dossier-6-4',
    category: 'Manor Wing Dispatch',
    title: 'Admiralty Grandmaster Directive',
    author: 'Admiralty High Board of Inquiry',
    timestamp: '05:40 AM • Emergency Directive',
    summary:
      'High-priority Grandmaster investigation. Cross-reference the 1,200 names across all 20 manifest pages with the 7 strict clues to locate the culprit.',
    details: [
      'Manifest pages 1 through 20 contain exactly 60 passengers per page (15 rows by 4 columns = 1,200 names).',
      'Cross out the innocent across all 20 pages using the 7 sequential deduction rules.',
      'Submit the official warrant containing the killer’s name and their exact registry page number.'
    ],
    keyObservation: 'Apply each of the 7 clues thoroughly to eliminate innocent passengers and apprehend the killer of Captain Edmund Vale.',
    stamp: 'ADMIRALTY CLASSIFIED'
  }
];

// Sequential Clues for Case 6
export const CASE_6_CLUES: Clue[] = [
  {
    id: 601,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Letters from SHIP',
    clueText: 'NAME CONTAINS AT LEAST ONE LETTER FROM THE WORD "SHIP" (S, H, I OR P)',
    logicRule: 'NAME CONTAINS AT LEAST ONE LETTER FROM THE WORD "SHIP" (S, H, I OR P)',
    evidenceType: 'forensic'
  },
  {
    id: 602,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Name Length',
    clueText: 'NAME HAS 4 TO 7 LETTERS',
    logicRule: 'NAME HAS 4 TO 7 LETTERS',
    evidenceType: 'physical'
  },
  {
    id: 603,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'First Letter Unique',
    clueText: 'THE FIRST LETTER OF THE NAME APPEARS NOWHERE ELSE IN THE NAME (E.G. MARK ✓ · ANNA ✗)',
    logicRule: 'THE FIRST LETTER OF THE NAME APPEARS NOWHERE ELSE IN THE NAME (E.G. MARK ✓ · ANNA ✗)',
    evidenceType: 'forensic'
  },
  {
    id: 604,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Different Vowels',
    clueText: 'NAME CONTAINS AT LEAST TWO DIFFERENT VOWELS (A E I O U) (E.G. MARIE ✓ · ANNA ✗)',
    logicRule: 'NAME CONTAINS AT LEAST TWO DIFFERENT VOWELS (A E I O U) (E.G. MARIE ✓ · ANNA ✗)',
    evidenceType: 'timeline'
  },
  {
    id: 605,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Neighbour Above',
    clueText: 'THE NAME DIRECTLY ABOVE CONTAINS AN "A" (ROW 1 = CROSS · CROSSED NAMES COUNT)',
    logicRule: 'THE NAME DIRECTLY ABOVE CONTAINS AN "A" (ROW 1 = CROSS · CROSSED NAMES COUNT)',
    evidenceType: 'physical'
  },
  {
    id: 606,
    number: 6,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Page Letter Partner',
    clueText: 'ANOTHER NAME ON THE SAME PAGE STARTS WITH THE SAME LETTER (CROSSED NAMES COUNT)',
    logicRule: 'ANOTHER NAME ON THE SAME PAGE STARTS WITH THE SAME LETTER (CROSSED NAMES COUNT)',
    evidenceType: 'timeline'
  },
  {
    id: 607,
    number: 7,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Manifest Uniqueness',
    clueText: 'NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 20 PAGES · CROSSED NAMES COUNT)',
    logicRule: 'NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 20 PAGES · CROSSED NAMES COUNT)',
    evidenceType: 'registry'
  }
];

// Build 1,200 passenger suspects from CASE_6_LEDGER_NAMES (20 pages x 15 rows x 4 cols = 60 per page)
export const CASE_6_SUSPECTS: Suspect[] = CASE_6_LEDGER_NAMES.map((name, i) => {
  const pageNumber = Math.floor(i / 60) + 1;
  const row = Math.floor((i % 60) / 4) + 1;
  const col = (i % 4) + 1;
  const slot = (row - 1) * 4 + col;
  const id = `c6-p${pageNumber}-s${slot}-${name.toLowerCase()}`;
  return {
    id,
    name,
    firstName: name,
    lastName: '',
    pageNumber,
    row,
    col,
    role: 'Halcyon Passenger',
    traits: [`Page ${pageNumber}`],
    isGuest: true,
  };
});

export const CASE_6_DATA: CaseData = {
  id: 'case-006',
  code: 'Case 6',
  title: 'The Last Voyage of the Halcyon',
  tagline: 'A liner lost in the storm, a captain dead on the bridge, and 1,200 names on the manifest',
  difficulty: 'Grandmaster+',
  estimatedTime: '10–11 hours',
  dateAdded: 'Grandmaster+ Case',
  victim: 'Captain Edmund Vale (Master of the S.S. Halcyon)',
  setting:
    'The Bridge and Navigation Suite of the S.S. Halcyon. Exactly 1,200 passengers are recorded across a 20-page manifest.',
  scene: 'Bridge & Chart Room, S.S. Halcyon',
  timeOfCrime: '4:00 AM (Peak of the Atlantic Storm)',
  briefing:
    'Three days out of Southampton, the Halcyon sailed straight into the worst storm in forty years. At 4:00 a.m. the bridge fell silent. Captain Edmund Vale was found dead at the helm, the ship\'s log torn from its binding and the radio smashed. No lifeboat had been lowered. No one could have left the ship. The passenger manifest holds 1,200 names across 20 pages, and one of them put the Halcyon off course. Use the 7 clues, cross out the innocent across all 20 pages, and submit the warrant for the killer!',
  dossiers: CASE_6_DOSSIERS,
  clues: CASE_6_CLUES,
  totalPages: 20,
  namesPerPage: 60,
  suspects: CASE_6_SUSPECTS,
  solution: {
    killerName: 'Phineas',
    killerPage: 14,
    row: 9,
    col: 2,
    motive:
      'Phineas murdered Captain Edmund Vale on the bridge at 4:00 AM, stole the navigational chart, and destroyed the wireless radio to steer the Halcyon off course into international waters.',
    gridLocation: 'Page 14, Row 9, Column 2 (R9:C2)'
  },
  solutionBrief:
    'Phineas struck Captain Edmund Vale at 4:00 AM on the bridge of the Halcyon during the violent Atlantic squall, ripped the ship’s log from its binding, and smashed the transmitter. He melted into the passenger quarters, confident the 1,200-name manifest across 20 pages would hide him forever until the 7 sequential clues unmasked his slot at Page 14 (Row 9, Col 2).',
  imageUrl: '/assets/aistudio/case_6_cover_d3217335.webp'
};
