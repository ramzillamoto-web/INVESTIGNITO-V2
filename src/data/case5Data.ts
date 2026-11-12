import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import case5Image from '../assets/images/case_5_scene.jpg';
import { CASE_5_LEDGER_NAMES } from './case5Names';

// Official Evidence Dossiers for Case 5
export const CASE_5_DOSSIERS: EvidenceDossier[] = [
  {
    id: 'dossier-5-1',
    category: 'Forensic Report',
    title: 'Constabulary Inspection: The Grand Clock Room',
    author: 'Chief Inspector Vance Aldridge, Scotland Yard',
    timestamp: '04:10 AM • The Frozen Hour',
    summary:
      'Lady Imogen Ravenmoor was discovered deceased in the central clock room. Every timepiece throughout the entire hotel stopped dead at precisely 3:17 AM.',
    details: [
      'Victim identity confirmed: Lady Imogen Ravenmoor, proprietor and patron of Ravenmoor Hotel.',
      'Time of death established between 3:15 AM and 3:20 AM, perfectly coinciding with the 3:17 mechanical arrest of the clock tower.',
      'The master pendulum weights were caught on a brass stop-latch, arresting all secondary slave clocks through the pneumatics.',
      'Torrential flash floods have severed the Northbridge Causeway; no guest or staff member could have fled the grounds.'
    ],
    keyObservation: 'The killer sabotaged the master clockwork escapement at 3:17 AM to forge an unbreakable alibi before the storm lifted.',
    stamp: 'SCOTLAND YARD SEALED'
  },
  {
    id: 'dossier-5-2',
    category: 'Witness Statement',
    title: 'Night Concierge Deposition: Donald Mercer',
    author: 'Donald Mercer, Head Night Concierge',
    timestamp: '04:45 AM • Front Foyer',
    summary:
      'The front desk was locked at midnight when the river breached the lower cellars. Exactly 900 guests are logged in the 15-page hotel register.',
    details: [
      '“The wind shrieked through the chimney flues, and suddenly the rhythmic ticking of the great grandfather clock in the foyer went silent.”',
      '“I glanced at the brass dial — 3:17. I hurried to the clock room corridor and found the oak door unlocked from the inside.”',
      '“The guest ledger remained securely bolted to the mahogany lectern. All 900 resident guests are listed within its 15 pages.”'
    ],
    keyObservation: 'The perpetrator was a registered guest who had intimate knowledge of the hotel’s synchronized timepiece system.',
    stamp: 'SWORN STATEMENT'
  },
  {
    id: 'dossier-5-3',
    category: 'Butler Log',
    title: 'Estate Gatekeeper Flooding & Perimeter Log',
    author: 'Sergeant Thomas Holloway, East Gatehouse',
    timestamp: '05:20 AM • Gatehouse Watch',
    summary:
      'All perimeter gates were chained and secured. Mudslides and overflowing ravine torrents prevent any egress or external approach.',
    details: [
      'Perimeter sweeps confirm the high stone walls and wrought-iron spikes were entirely undisturbed.',
      'The culprit is guaranteed to be one of the 900 souls recorded within the 15 pages of the official guest register.',
      'Faint traces of black machine-graphite and damp wool were identified upon the brass door handle of the clock room.'
    ],
    keyObservation: 'The killer never departed the estate and remains hidden among the 900 registered guests.',
    stamp: 'VERIFIED DISPATCH'
  },
  {
    id: 'dossier-5-4',
    category: 'Manor Wing Dispatch',
    title: 'Scotland Yard Grandmaster Directive',
    author: 'Commissioner Raymond Sterling',
    timestamp: '05:50 AM • Bureau Telegraph',
    summary:
      'Special grandmaster investigative protocol activated. Apply the 7 sequential clues across all 15 pages of the guest ledger to unmask the murderer.',
    details: [
      'Ledger pages 1 through 15 contain exactly 60 guests per page (15 rows by 4 columns = 900 names).',
      'Cross out the innocent using the 7 rigorous deduction rules.',
      'Once only the killer remains, submit the official Scotland Yard warrant with the culprit’s name and ledger page.'
    ],
    keyObservation: 'Follow the 7 sequential clues strictly to eliminate innocent guests and isolate the killer of Lady Imogen Ravenmoor.',
    stamp: 'CLASSIFIED PRELIMINARY'
  }
];

// Sequential Clues for Case 5 (all 7 clues use toolType 'X' and phase 'Phase 1: Elimination (Cross)')
export const CASE_5_CLUES: Clue[] = [
  {
    id: 501,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Letters from CLOCK',
    clueText: 'NAME CONTAINS AT LEAST ONE LETTER FROM THE WORD "CLOCK" (C, L, O OR K)',
    logicRule: 'Eliminate any name that does not contain at least one letter from C, L, O, or K',
    evidenceType: 'forensic'
  },
  {
    id: 502,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Name Length',
    clueText: 'NAME HAS 5 TO 8 LETTERS',
    logicRule: 'Eliminate any name with fewer than 5 or more than 8 letters',
    evidenceType: 'physical'
  },
  {
    id: 503,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Unique Last Letter',
    clueText: 'THE LAST LETTER OF THE NAME APPEARS NOWHERE ELSE IN THE NAME (E.G. MARK ✓ · ANNA ✗)',
    logicRule: 'Eliminate any name where the last letter appears earlier in the name',
    evidenceType: 'forensic'
  },
  {
    id: 504,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Consonants vs Vowels',
    clueText: 'NAME HAS MORE CONSONANTS THAN VOWELS (VOWELS = A E I O U)',
    logicRule: 'Eliminate any name where consonants do not strictly exceed vowels',
    evidenceType: 'timeline'
  },
  {
    id: 505,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Neighbour Below',
    clueText: 'THE NAME DIRECTLY BELOW CONTAINS AN "E" (ROW 15 = CROSS · CROSSED NAMES COUNT)',
    logicRule: 'Eliminate any name unless the name directly below contains the letter E (names in Row 15 are eliminated)',
    evidenceType: 'physical'
  },
  {
    id: 506,
    number: 6,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Page Letter Partner',
    clueText: 'ANOTHER NAME ON THE SAME PAGE STARTS WITH THE SAME LETTER (CROSSED NAMES COUNT)',
    logicRule: 'Eliminate any name that is the unique name on its page starting with that initial',
    evidenceType: 'timeline'
  },
  {
    id: 507,
    number: 7,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Ledger Uniqueness',
    clueText: 'NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 15 PAGES · CROSSED NAMES COUNT)',
    logicRule: 'Eliminate any name that appears more than once across all 15 pages of the ledger',
    evidenceType: 'registry'
  }
];

// Build 900 hotel guest suspects from CASE_5_LEDGER_NAMES (15 pages x 15 rows x 4 cols = 60 per page)
export const CASE_5_SUSPECTS: Suspect[] = CASE_5_LEDGER_NAMES.map((name, i) => {
  const pageNumber = Math.floor(i / 60) + 1;
  const row = Math.floor((i % 60) / 4) + 1;
  const col = (i % 4) + 1;
  const slot = (row - 1) * 4 + col;
  const id = `c5-p${pageNumber}-s${slot}-${name.toLowerCase()}`;
  return {
    id,
    name,
    firstName: name,
    lastName: '',
    pageNumber,
    row,
    col,
    role: 'Hotel Guest',
    traits: [`Page ${pageNumber}`],
    isGuest: true,
  };
});

export const CASE_5_DATA: CaseData = {
  id: 'case-5',
  code: 'Case 5',
  title: 'The Stopped Clocks of Ravenmoor',
  tagline: 'A storm-bound hotel, every clock stopped at 3:17, and 900 names in the register',
  difficulty: 'Grandmaster',
  estimatedTime: '6–8 hours',
  dateAdded: 'Grandmaster Case',
  victim: 'Lady Imogen Ravenmoor (Proprietress & Clock Enthusiast)',
  setting:
    'The Clock Room and Grand Parlours of Ravenmoor Hotel. Exactly 900 guests are inscribed across a 15-page register.',
  scene: 'Clock Room & East Conservatory Gallery',
  timeOfCrime: '3:17 AM (All Clocks Stopped)',
  briefing:
    'The storm cut the Ravenmoor Hotel off from the world at midnight. By morning, Lady Imogen Ravenmoor lay dead in the clock room — and every clock in the building had stopped at exactly 3:17. No one could have left through the flooded roads. The hotel register lists 900 names across 15 pages, and one of them stopped the clocks. Use the 7 clues, cross out the innocent across all 15 pages, and submit the warrant for the killer!',
  dossiers: CASE_5_DOSSIERS,
  clues: CASE_5_CLUES,
  totalPages: 15,
  namesPerPage: 60,
  suspects: CASE_5_SUSPECTS,
  solution: {
    killerName: 'Clement',
    killerPage: 12,
    row: 6,
    col: 3,
    motive:
      'Clement murdered Lady Imogen Ravenmoor in the clock room and mechanically froze every timepiece at 3:17 AM to forge an airtight alibi before the storm subsided.',
    gridLocation: 'Page 12, Row 6, Column 3 (R6:C3)'
  },
  solutionBrief:
    'Clement slipped into the Ravenmoor clock room at 3:17 AM, silenced Lady Imogen Ravenmoor, and mechanically arrested every pendulum and escapement in the building. He retreated to the guest lounge, counting on the synchronized frozen clocks to provide an alibi until the 7 clues unmasked his slot on Page 12 (Row 6, Col 3).',
  imageUrl: '/assets/aistudio/cfefe6b1-a745-42d1-a9c5-667a1aa1c913_5eb886b1.webp'
};
