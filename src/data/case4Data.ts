import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import case4Image from '../assets/images/case_4_scene_1789368236364.jpg';
import { CASE_4_LEDGER_NAMES } from './case4Names';

// Official Evidence Dossiers for Case 4
export const CASE_4_DOSSIERS: EvidenceDossier[] = [
  {
    id: 'dossier-4-1',
    category: 'Forensic Report',
    title: 'Constabulary Inspection: Spire Gearwork Gallery',
    author: 'Chief Inspector Vance Aldridge, Scotland Yard',
    timestamp: '01:15 AM • The 13th Toll Alarm',
    summary:
      'Archibald Blackwood was discovered unconscious upon the iron grating below the escapement arbor. The heavy pendulum rod was severed by an iron wedge.',
    details: [
      'Victim identity confirmed: Archibald Blackwood, Master Horologist and founder of the Blackwood Spire works.',
      'Estimated time of assault: 12:00 Midnight, precisely synchronized with the bell tower chiming sequence.',
      'A forged brass cog stamped with guild initials was discovered wedged between the deadbeat escapement wheels.',
      'Footprints in the machine grease indicate a suspect wearing specialized oil-resistant brassmith boots.'
    ],
    keyObservation: 'The killer sabotaged the master escapement wheel to create the anomalous thirteenth bell toll before fleeing into the upper catwalks.',
    stamp: 'CLASSIFIED PRELIMINARY'
  },
  {
    id: 'dossier-4-2',
    category: 'Witness Statement',
    title: 'Tower Bellringer Testimony: Corwin Gable',
    author: 'Corwin Gable, Blackwood Spire Night Bellringer',
    timestamp: '01:45 AM • Bell Loft Station',
    summary:
      'The bellringer reported strange reverberations through the bell ropes and observed a shadowy figure near the east gallery minutes before the bells froze.',
    details: [
      '“The clock struck twelve as expected, but the escapement skipped its catch and struck a violent thirteenth time.”',
      '“I ran down the spiral stone stairs and saw the lantern flickering in the guild archives. Someone sprinted past the gear chamber.”',
      '“The person was carrying a heavy velvet satchel containing the master schematics.”'
    ],
    keyObservation: 'The suspect had intricate knowledge of the clockwork mechanism and possessed an internal key to the guild archives.',
    stamp: 'SWORN RECORD'
  },
  {
    id: 'dossier-4-3',
    category: 'Butler Log',
    title: 'Night Gatekeeper Telegraph Dispatch',
    author: 'Sergeant Donald Finch, South Courtyard Watch',
    timestamp: '02:10 AM • Perimeter Telegraph',
    summary:
      'All four courtyard gates were locked at 11:30 PM. The suspect was among the registered guild members and guests listed in the official night ledger.',
    details: [
      'The courtyard gates showed no signs of forced entry; the perpetrator never scaled the perimeter iron spikes.',
      'Exactly 900 names are recorded in the Blackwood Spire Guild Registry for the midnight gala.',
      'Forensic chemical swabs on the gear lever reveal traces of volatile clockmaker cleaning spirit.'
    ],
    keyObservation: 'The culprit is definitively recorded within the 15-page Blackwood Spire Guild Registry.',
    stamp: 'VERIFIED DISPATCH'
  },
  {
    id: 'dossier-4-4',
    category: 'Manor Wing Dispatch',
    title: 'Scotland Yard Case 4 Directive',
    author: 'Commissioner Raymond Sterling',
    timestamp: '02:40 AM • Bureau Command',
    summary:
      'Full case records and clockwork forensic reports have been cataloged. The 7 sequential clues isolate the saboteur from the 900 guild members.',
    details: [
      'Complete evidence dossier confirmed by Scotland Yard forensics.',
      'Registry pages 1 through 15 encompass the full roster of clockmakers, apprentices, and benefactors.',
      'Case #4 interactive tooling and warrant filing are fully active.'
    ],
    keyObservation: 'Follow the 7 sequential clues in exact order to eliminate innocent guild members and isolate the saboteur from the 900 registered clockmakers.',
    stamp: 'SCOTLAND YARD SEALED'
  }
];

// Sequential Clues for Case 4 (all 7 clues use toolType 'X' and phase 'Phase 1: Elimination (Cross)', no targetYield)
export const CASE_4_CLUES: Clue[] = [
  {
    id: 401,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Letter Check',
    clueText: 'NAME CONTAINS AN "R"',
    logicRule: 'Eliminate any name that does not contain the letter R',
    evidenceType: 'forensic'
  },
  {
    id: 402,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'No E',
    clueText: 'NAME CONTAINS NO "E"',
    logicRule: 'Eliminate any name that contains the letter E',
    evidenceType: 'physical'
  },
  {
    id: 403,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Double Letter',
    clueText: 'NAME HAS A DOUBLE LETTER (SAME LETTER TWICE IN A ROW)',
    logicRule: 'Eliminate any name without a double letter twice in a row',
    evidenceType: 'forensic'
  },
  {
    id: 404,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Column Rule',
    clueText: 'NAME IS IN COLUMN 2 OR 3',
    logicRule: 'Eliminate any name not positioned in Column 2 or Column 3',
    evidenceType: 'timeline'
  },
  {
    id: 405,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Row Rule',
    clueText: 'ROW NUMBER = NUMBER OF LETTERS IN NAME',
    logicRule: 'Eliminate any name where the row number does not equal the letter count',
    evidenceType: 'timeline'
  },
  {
    id: 406,
    number: 6,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Neighbour Rule',
    clueText: 'THE NAME DIRECTLY ABOVE STARTS WITH THE SAME LETTER (ROW 1 = CROSS, CROSSED NAMES COUNT)',
    logicRule: 'Eliminate any name unless the name directly above starts with the same letter (Row 1 eliminated)',
    evidenceType: 'physical'
  },
  {
    id: 407,
    number: 7,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Uniqueness Rule',
    clueText: 'NAME APPEARS ONLY ONCE IN THE WHOLE LEDGER (ALL 15 PAGES, CROSSED NAMES INCLUDED)',
    logicRule: 'Eliminate any name that appears more than once across the 15-page ledger',
    evidenceType: 'registry'
  }
];

// Build 900 guild member suspects from CASE_4_LEDGER_NAMES (15 pages x 15 rows x 4 cols = 60 per page)
export const CASE_4_SUSPECTS: Suspect[] = CASE_4_LEDGER_NAMES.map((name, i) => {
  const pageNumber = Math.floor(i / 60) + 1;
  const row = Math.floor((i % 60) / 4) + 1;
  const col = (i % 4) + 1;
  const slot = (row - 1) * 4 + col;
  const id = `c4-p${pageNumber}-s${slot}-${name.toLowerCase()}`;
  return {
    id,
    name,
    firstName: name,
    lastName: '',
    pageNumber,
    row,
    col,
    role: 'Guild Member',
    traits: [`Page ${pageNumber}`],
    isGuest: false,
  };
});

export const CASE_4_DATA: CaseData = {
  id: 'case-4',
  code: 'Case 4',
  title: 'The Pendulum Over Blackwood Spire',
  tagline: 'A locked clocktower vault, thirteen midnight chimes, and 900 guild names',
  difficulty: 'Mastermind',
  estimatedTime: '1-2 hours',
  dateAdded: 'Mastermind Case',
  victim: 'Archibald Blackwood (Grand Horologist & Guildmaster)',
  setting:
    'The Mechanical Clocktower of Blackwood Spire. Exactly 900 horological guild members and city dignitaries are inscribed across a 15-page registry.',
  scene: 'Grand Pendulum Chamber & Gearwork Gallery',
  timeOfCrime: '12:00 Midnight (The Unscheduled 13th Chime)',
  briefing:
    'At the stroke of midnight, the bells of Blackwood Spire tolled thirteen times before grinding to a halt. Master horologist Archibald Blackwood was discovered fallen within the pendulum vault. The heavy brass gears had been jammed with an engraved cog tooth, and the registry ledger of 900 guild members holds the identity of the sabotaging conspirator. Use the 7 sequential clues, cross out innocent clockmakers across the 15 pages, and submit the warrant for the culprit!',
  dossiers: CASE_4_DOSSIERS,
  clues: CASE_4_CLUES,
  totalPages: 15,
  namesPerPage: 60,
  suspects: CASE_4_SUSPECTS,
  solution: {
    killerName: 'Woodrow',
    killerPage: 11,
    row: 7,
    col: 3,
    motive: 'Sabotaged the master pendulum gear to seize the Blackwood Horological Guild patents.',
    gridLocation: 'Page 11, Row 7, Column 3 (R7:C3)'
  },
  solutionBrief:
    'Woodrow wedged a custom-ground brass tooth into the deadbeat escapement at 11:59 PM to induce an escapement jump, causing the 13th chime and sabotaging Archibald Blackwood.',
  imageUrl: case4Image
};
