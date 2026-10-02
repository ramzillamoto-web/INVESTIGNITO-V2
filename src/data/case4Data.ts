import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import case4Image from '../assets/images/case_4_scene_1789368236364.jpg';

// Official Evidence Dossiers for Case 4 (Placeholder / Work in Progress)
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
      'Exactly 300 names are recorded in the Blackwood Spire Guild Registry for the midnight gala.',
      'Forensic chemical swabs on the gear lever reveal traces of volatile clockmaker cleaning spirit.'
    ],
    keyObservation: 'The culprit is definitively recorded within the 6-page Blackwood Spire Guild Registry.',
    stamp: 'VERIFIED DISPATCH'
  },
  {
    id: 'dossier-4-4',
    category: 'Manor Wing Dispatch',
    title: 'Scotland Yard Case 4 Directive',
    author: 'Commissioner Raymond Sterling',
    timestamp: '02:40 AM • Bureau Command',
    summary:
      'Full case records and clockwork forensic reports have been cataloged. The 7 sequential clues isolate the saboteur from the 300 guild members.',
    details: [
      'Complete evidence dossier confirmed by Scotland Yard forensics.',
      'Registry pages 1 through 6 encompass the full roster of clockmakers, apprentices, and benefactors.',
      'Case #4 interactive tooling and warrant filing are fully active.'
    ],
    keyObservation: 'Follow the 7 sequential clues in exact order to eliminate innocent guild members and isolate the saboteur from the 300 registered clockmakers.',
    stamp: 'SCOTLAND YARD SEALED'
  }
];

// Sequential Clues for Case 4
export const CASE_4_CLUES: Clue[] = [
  {
    id: 401,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #1: Heavy Escapement Cog Stature',
    clueText:
      'Forensic leverage measurements on the jammed gear prove: The saboteur’s name contains 6 or more letters. Cross out all names with 5 or fewer letters.',
    logicRule: 'Name Length >= 6 (Cross if <= 5)',
    evidenceType: 'forensic'
  },
  {
    id: 402,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #2: Machine Grease Chemical Scrap',
    clueText:
      'A chemical swab of the clock oil reveals no trace of sulfur: The saboteur’s name contains NO letter "E" (case-insensitive). Cross out any name containing "E" or "e".',
    logicRule: 'Name contains NO "E" / "e" (Cross if has E)',
    evidenceType: 'physical'
  },
  {
    id: 403,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #3: Spire Catwalk Stride Monogram',
    clueText:
      'Chalk marks on the upper catwalk indicate: The perpetrator’s name begins with "K", "B", or "M". Cross out all names starting with any other letter.',
    logicRule: 'Name starts with K, B, or M',
    evidenceType: 'forensic'
  },
  {
    id: 404,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #4: East Spire Quadrant Registry',
    clueText:
      'The watchman confirmed the intruder fled down the East spiral staircase, restricted to EVEN-NUMBERED REGISTRY PAGES (2, 4, 6). Cross out odd-numbered pages.',
    logicRule: 'Registry Page is EVEN (2, 4, 6)',
    evidenceType: 'timeline'
  },
  {
    id: 405,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #5: Belltower Sounding Resonance',
    clueText:
      'The thirteenth chime echo analysis confirms: The culprit’s name ends in a CONSONANT. Cross out names ending in a vowel or Y.',
    logicRule: 'Name ends with Consonant (Cross if vowel/Y)',
    evidenceType: 'timeline'
  },
  {
    id: 406,
    number: 6,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #6: Archibald’s Engraved Pocket Watch',
    clueText:
      'Blackwood’s pocket timepiece had scratched initials inside the rear bezel: The saboteur is seated in Guild Wing #4 (PAGE 4). Circle candidates on Page 4.',
    logicRule: 'Candidate located on Page 4 of Registry',
    evidenceType: 'physical'
  },
  {
    id: 407,
    number: 7,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #7: Official Scotland Yard Warrant',
    clueText:
      'Final Step: Submit the isolated culprit’s name and page number into the Official Warrant box to close the Case #4 investigation.',
    logicRule: 'Warrant Submission: Culprit Name & Registry Page Match',
    evidenceType: 'registry'
  }
];

import { CASE_1_NAMES_POOL, CASE_2_NAMES_POOL } from './namesPool';

// Generate 300 distinct suspects across 6 pages with airtight deductive funnel for Case 4
function generateCase4Suspects(): Suspect[] {
  const pool = Array.from(new Set([...CASE_1_NAMES_POOL, ...CASE_2_NAMES_POOL]))
    .filter((n) => n !== 'Kallum' && n !== 'Marcus' && n !== 'Vincent' && n !== 'Otto');

  const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
  const passesC1235 = (name: string) => {
    if (name.length < 6) return false;
    if (/e/i.test(name)) return false;
    const first = name.charAt(0).toUpperCase();
    if (!['K', 'B', 'M'].includes(first)) return false;
    const last = name.charAt(name.length - 1).toUpperCase();
    if (vowels.includes(last)) return false;
    return true;
  };

  const passing = pool.filter((n) => passesC1235(n));
  const failing = pool.filter((n) => !passesC1235(n));

  const suspects: Suspect[] = [];
  let passIdx = 0;
  let failIdx = 0;

  for (let page = 1; page <= 6; page++) {
    for (let slot = 1; slot <= 50; slot++) {
      const isLeft = slot <= 25;
      const row = Math.floor((slot - 1) / 4) + 1;
      const col = ((slot - 1) % 4) + 1;

      let name = '';
      if (page === 4 && slot === 22) {
        name = 'Kallum';
      } else if (page === 4) {
        name = failing[failIdx++];
      } else if (page === 2 && (slot === 10 || slot === 30)) {
        name = passing[passIdx++];
      } else if (page === 6 && (slot === 15 || slot === 40)) {
        name = passing[passIdx++];
      } else if ((page === 1 || page === 3 || page === 5) && (slot === 12 || slot === 25 || slot === 38)) {
        name = passing[passIdx++];
      } else {
        name = failing[failIdx++];
      }

      const id = `c4-p${page}-s${slot}-${name.toLowerCase()}`;
      const isKiller = name === 'Kallum' && page === 4;

      suspects.push({
        id,
        name,
        firstName: name,
        lastName: '',
        pageNumber: page,
        row,
        col,
        role: isKiller
          ? 'Master Apprentice • East Spire Catwalk'
          : `Guild Member #${slot} • ${isLeft ? 'West Gallery' : 'East Gallery'}`,
        traits: [`Page ${page} - Seat ${slot}`, isLeft ? 'Left Ledger' : 'Right Ledger'],
        isGuest: isKiller || slot === 1,
        alibi: isKiller
          ? 'Claimed he was attending the lower bell crank during the stroke of midnight.'
          : undefined,
      });
    }
  }

  return suspects;
}

export const CASE_4_SUSPECTS: Suspect[] = generateCase4Suspects();

export const CASE_4_DATA: CaseData = {
  id: 'case-4',
  code: 'Case 4',
  title: 'The Pendulum Over Blackwood Spire',
  tagline: 'A locked clocktower vault, thirteen midnight chimes, and 300 Guild names under sabotage.',
  difficulty: 'Mastermind',
  estimatedTime: '20-25 mins',
  dateAdded: 'Mastermind Case',
  victim: 'Archibald Blackwood (Grand Horologist & Guildmaster)',
  setting:
    'The Mechanical Clocktower of Blackwood Spire. Exactly 300 horological guild members and city dignitaries are inscribed across a 6-page registry.',
  scene: 'Grand Pendulum Chamber & Gearwork Gallery',
  timeOfCrime: '12:00 Midnight (The Unscheduled 13th Chime)',
  briefing:
    'At the stroke of midnight, the bells of Blackwood Spire tolled thirteen times before grinding to a halt. Master horologist Archibald Blackwood was discovered fallen within the pendulum vault. The heavy brass gears had been jammed with an engraved cog tooth, and the registry ledger of 300 attendees holds the identity of the sabotaging conspirator. Use the 7 sequential clues, cross out innocent clockmakers across the 6 pages, and submit the warrant for the culprit!',
  dossiers: CASE_4_DOSSIERS,
  clues: CASE_4_CLUES,
  totalPages: 6,
  namesPerPage: 50,
  suspects: CASE_4_SUSPECTS,
  solution: {
    killerName: 'Kallum',
    killerPage: 4,
    row: 6,
    col: 2,
    motive: 'Sabotaged the master pendulum gear to seize the Blackwood Horological Guild patents.',
    gridLocation: 'Page 4, Left Ledger, Seat 22 (R6:C2)'
  },
  solutionBrief:
    'Kallum wedged a custom-ground brass tooth into the deadbeat escapement at 11:59 PM to induce an escapement jump, causing the 13th chime and sabotaging Archibald Blackwood.',
  imageUrl: case4Image
};
