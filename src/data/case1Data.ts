import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import { CASE_1_NAMES_POOL } from './namesPool';
import case1Image from '../assets/images/case_1_scene_1787986913835.jpg';

// Official Forensic Evidence Dossiers & Staff Witness Transcripts (Lore & Atmosphere)
export const CASE_1_DOSSIERS: EvidenceDossier[] = [
  {
    id: 'dossier-1',
    category: 'Forensic Report',
    title: 'Crime Scene Examination: Conservatory East Wing',
    author: 'Dr. Julian Hallowell, County Medical Examiner',
    timestamp: '11:40 PM • Blizzard Night',
    summary: 'Victim Arthur Pendelton was struck once from behind with heavy brass pruning shears before the external telegraph lines were severed.',
    details: [
      'Physical signs indicate the victim was attacked near the glass orchid tables while attempting to reach the telegraph station.',
      'A single set of wet bootprints with diamond-grid rubber soles tracks from the conservatory back into the East Gallery corridor.',
      'External copper telegraph cables were cut cleanly with high-tension garden shears, ruling out weather damage or fallen branches.',
      'Estimated time of death: Between 10:45 PM and 11:15 PM during the peak snowfall.'
    ],
    keyObservation: 'The killer was familiar with estate tools and fled back inside toward the guest wings rather than venturing outside into the blizzard.',
    stamp: 'OFFICIAL CORONER VERIFIED'
  },
  {
    id: 'dossier-2',
    category: 'Witness Statement',
    title: 'Interrogation Transcript: Head Housekeeper',
    author: 'Mrs. Beatrice Gable, Head Housekeeper (32 Years at Thornbury)',
    timestamp: '11:55 PM • Servants’ Hall',
    summary: 'Reported hearing glass shatter in the conservatory around 11:00 PM and seeing a suspicious guest in formal gala attire hurry past the gallery.',
    details: [
      '“I was checking window latches in the East Wing gallery when the chandelier flickered and I heard a sharp crack of glass.”',
      '“A few moments later, someone in dark evening attire strode swiftly past the portrait corridor toward the grand staircase without looking back.”',
      '“Arthur had spoken to me before dinner—he was deeply agitated and told me he had caught someone using a falsified identity to access the estate archives.”',
      '“He kept the master 10-page leatherbound guest registry on his foyer lectern to verify credentials.”'
    ],
    keyObservation: 'The master registry contains all 600 names. Arthur was cross-referencing entries right before the murder.',
    stamp: 'POLICE TRANSCRIPT'
  },
  {
    id: 'dossier-3',
    category: 'Butler Log',
    title: 'Arthur Pendelton’s Final Logbook Entry',
    author: 'Arthur Pendelton, Chief Butler (Deceased)',
    timestamp: '09:15 PM • Recovered from Desk',
    summary: 'Handwritten journal notes describing the chaotic 600-guest arrival, estate security status, and suspicious activity in the library.',
    details: [
      '07:30 PM: Gates bolted as blizzard intensified. All 600 attendees registered across the 10 ledger sections.',
      '08:45 PM: Gala dinner commenced in the Grand Ballroom. Extra vintage retrieved from the east cellar.',
      '09:10 PM: Intercepted an uninvited guest examining the Renaissance art deeds and lockbox in the private gallery.',
      'Note: Suspect’s credentials do not match county guild records. Will verify their full ledger registration and telegraph the authorities as soon as the storm clears.'
    ],
    keyObservation: 'Arthur confirmed the culprit is definitely listed among the 600 names in the 10-page registry.',
    stamp: 'RECOVERED EVIDENCE'
  },
  {
    id: 'dossier-4',
    category: 'Witness Statement',
    title: 'Perimeter Statement: Chauffeur & Groundskeeper',
    author: 'Thomas Higgins, Groundskeeper & Chauffeur',
    timestamp: '12:10 AM • Estate Gatehouse',
    summary: 'Verifies that no outside intruder could have entered or left the estate grounds after 8:00 PM due to impassable 6-foot snowdrifts.',
    details: [
      '“The outer perimeter gate was padlocked by 7:30 PM under Lord Sterling’s direct order as the drifts piled up.”',
      '“I walked the south and west fence lines at midnight—the snow drifts are waist-deep and unbroken everywhere.”',
      '“Not a single track leads off the property. The murderer is guaranteed to be one of the 600 individuals currently inside the manor.”'
    ],
    keyObservation: 'Eliminates the possibility of an external intruder. The investigation must focus exclusively on the 600 ledger names.',
    stamp: 'PERIMETER SEALED'
  },
  {
    id: 'dossier-5',
    category: 'Manor Wing Dispatch',
    title: 'Manor Wing Architecture & Registry Distribution',
    author: 'Detective Inspector Ward, Bureau of Deduction',
    timestamp: '12:30 AM • Foyer Command',
    summary: 'Official breakdown of how the 10 ledger pages correspond to estate wings and rooms across Thornbury Manor.',
    details: [
      'Pages 1–2: Grand Ballroom & North Wing Suites (120 Guests)',
      'Pages 3–4: East Conservatory & Library Galleries (120 Guests)',
      'Pages 5–6: Central Salon & Mezzanine Chambers (120 Guests)',
      'Pages 7–8: West Drawing Rooms & Billiard Hall (120 Guests)',
      'Pages 9–10: South Annex & Winter Garden Lodgings (120 Guests)'
    ],
    keyObservation: 'Use the 9 sequential clues in strict order to eliminate innocent guests and isolate the single guilty party from the 600 registered names.',
    stamp: 'BUREAU CLASSIFIED'
  }
];

// Sequential Clues for Case 1
export const CASE_1_CLUES: Clue[] = [
  {
    id: 1,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #1: Conservatory Snow Bootprint',
    clueText: 'Forensic casts in the conservatory snow drift confirm: The killer’s name contains 6 or more letters. Cross out all names with 5 or fewer letters.',
    logicRule: 'Name Length >= 6 (Cross if <= 5)',
    evidenceType: 'forensic',
  },
  {
    id: 2,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #2: Clutched Telegraph Ledger Scrap',
    clueText: 'A torn paper fragment in Arthur Pendelton’s clutched hand reveals: The killer’s name contains NO letter "E" (case-insensitive). Cross out any name containing "E" or "e".',
    logicRule: 'Name contains NO "E" / "e" (Cross if has E)',
    evidenceType: 'physical',
  },
  {
    id: 3,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #3: Melted Signet Wax Monogram',
    clueText: 'Red signet wax residue on the greenhouse lock reveals: The killer’s name begins with "M", "G", or "R". Cross out all names starting with any other letter.',
    logicRule: 'Name starts with M, G, or R',
    evidenceType: 'forensic',
  },
  {
    id: 4,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #4: Stride Cadence & Consonant Cadence',
    clueText: 'Stride depth analysis across the frozen lawn shows: The killer’s name ends in a CONSONANT ("S", "D", "N", "L", "T", "M", "R", etc. — NOT A, E, I, O, U, Y). Cross out names ending in a vowel or Y.',
    logicRule: 'Name ends with Consonant (Cross if ends in vowel/Y)',
    evidenceType: 'timeline',
  },
  {
    id: 5,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #5: Mud-Stained Guestbook Stencil',
    clueText: 'Mud smears across the Thornbury registry ledger cover narrow entries: The killer’s name is EXACTLY 6 letters long. Cross out any name that does not have exactly 6 letters.',
    logicRule: 'Name Length === 6 letters',
    evidenceType: 'registry',
  },
  {
    id: 6,
    number: 6,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #6: East/West Wing Guest Quarters',
    clueText: 'The master room key chart reveals the killer was quartered on an EVEN-NUMBERED REGISTRY PAGE (Page 2, 4, 6, 8, or 10). Cross out all suspects on odd-numbered pages (1, 3, 5, 7, 9).',
    logicRule: 'Registry Page is EVEN (2, 4, 6, 8, 10)',
    evidenceType: 'timeline',
  },
  {
    id: 7,
    number: 7,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #7: Whispered Corridor Echo',
    clueText: 'A midnight parlor witness overheard a whispered name: The killer’s name contains the vowel "U". Circle surviving candidates containing the letter "U".',
    logicRule: 'Name contains letter U',
    evidenceType: 'testimony',
  },
  {
    id: 8,
    number: 8,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #8: Arthur’s Hidden Pocket Diary',
    clueText: 'Pendelton’s pocket diary specifically marks: The murderer was assigned to Guest Wing Room #4 (PAGE 4 of the Registry). Circle the surviving candidate on Page 4.',
    logicRule: 'Candidate is located on Page 4 of the Registry',
    evidenceType: 'physical',
  },
  {
    id: 9,
    number: 9,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #9: Official Warrant Filing',
    clueText: 'Final Step: Enter the isolated culprit’s name and their exact registry page number into the Official Warrant box below to close the case.',
    logicRule: 'Warrant Submission: Culprit Name & Registry Page Match',
    evidenceType: 'registry',
  },
];

// Helper to generate a full 600 single-name dataset with mixed random lengths and non-alphabetical distribution
function generateCase1Names(): Suspect[] {
  // Deterministic PRNG with fixed seed
  let s = 12345;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const pool = Array.from(new Set(CASE_1_NAMES_POOL.map((name) => (name === 'Magnus' ? 'Milo' : name))))
    .filter((n) => n !== 'Marcus' && n !== 'Gunnar' && n !== 'Gustav');

  // Fisher-Yates shuffle with fixed seed to guarantee random non-alphabetical distribution & scattered lengths
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Position Gunnar on Page 1 (odd) and Gustav on Page 3 (odd) so only Marcus survives on Page 4
  pool.splice(15, 0, 'Gunnar');
  pool.splice(135, 0, 'Gustav');

  const suspects: Suspect[] = [];
  const used = new Set<string>();
  let poolIdx = 0;

  const rolesPool = [
    'Antiquities Appraiser', 'Visiting Diplomat', 'Opera Patron', 'Botanical Society Member',
    'Silk Merchant', 'Naval Officer', 'Cartographer', 'Bank Governor', 'Jewelry Appraiser',
    'Orchestra Conductor', 'Estate Barrister', 'Harbor Master', 'Retired Magistrate',
    'Portrait Painter', 'University Professor', 'Philanthropist', 'County Architect'
  ];

  for (let page = 1; page <= 10; page++) {
    for (let slot = 0; slot < 60; slot++) {
      const row = Math.floor(slot / 4) + 1; // 1 to 15 (4 per row)
      const col = (slot % 4) + 1; // 1 to 4 (4 per row)
      const id = `p${page}-r${row}-c${col}`;

      // Insert Marcus at Page 4, Row 9, Col 2 (The True Culprit)
      if (page === 4 && row === 9 && col === 2) {
        suspects.push({
          id,
          name: 'Marcus',
          firstName: 'Marcus',
          lastName: '',
          pageNumber: 4,
          row: 9,
          col: 2,
          role: 'Antiquities Appraiser',
          traits: ['Thornbury Wing 4', 'Slot 9-2'],
          isGuest: true,
          alibi: 'Claims he was in the East Library examining folio prints at the time of the murder.',
        });
        used.add('Marcus');
        continue;
      }

      let singleName = '';
      while (poolIdx < pool.length) {
        const candidate = pool[poolIdx++];
        if (!used.has(candidate) && candidate !== 'Marcus') {
          singleName = candidate;
          used.add(candidate);
          break;
        }
      }

      const role = rolesPool[(slot + page * 3) % rolesPool.length];

      suspects.push({
        id,
        name: singleName,
        firstName: singleName,
        lastName: '',
        pageNumber: page,
        row,
        col,
        role,
        traits: [`Thornbury Wing ${page}`, `Slot ${row}-${col}`],
        isGuest: false,
      });
    }
  }

  return suspects;
}

export const CASE_1_SUSPECTS: Suspect[] = generateCase1Names();

export const CASE_1_DATA: CaseData = {
  id: 'case-1',
  code: 'Case 1',
  title: 'Guests at Thornbury',
  tagline: 'snowed-in manor, one of them murdered the butler',
  difficulty: 'Tutorial / Novice',
  estimatedTime: '10-15 mins',
  dateAdded: 'Tutorial Case',
  victim: 'Arthur Pendelton (The Butler)',
  setting: 'Thornbury Manor during an inescapable winter blizzard. Exactly 600 guests are trapped inside. The long-serving butler, Arthur Pendelton, has been found murdered in the conservatory.',
  scene: 'Glass Conservatory, East Wing, Thornbury Manor',
  timeOfCrime: '10:45 PM - 11:15 PM (During the Blizzard Peak)',
  briefing:
    'Thornbury Manor is sealed shut by a roaring winter blizzard. Inside, 600 guests gather for a grand winter gala. Shortly before midnight, the long-serving butler, Arthur Pendelton, is discovered dead on the conservatory floor beside severed telegraph wires and brass pruning shears. One of the 600 guests in the manor ledger is the killer. Use the 9 clues, the X Tool to eliminate innocents, and the Circle Tool to isolate the murderer!',
  dossiers: CASE_1_DOSSIERS,
  clues: CASE_1_CLUES,
  totalPages: 10,
  namesPerPage: 60,
  suspects: CASE_1_SUSPECTS,
  solution: {
    killerName: 'Marcus',
    killerPage: 4,
    row: 9,
    col: 2,
    motive: 'Arthur discovered Marcus’s forged Renaissance estate provenance deeds and was preparing to telephone Scotland Yard before the blizzard severed the telegraph lines.',
    gridLocation: 'Page 4, Column 2, Row 9',
  },
  solutionBrief:
    'Marcus arrived uninvited under the guise of an antiquities appraiser, intending to steal and substitute Thornbury’s valuable Renaissance paintings. Butler Arthur Pendelton caught him in the East Gallery with forged provenance certificates. When Arthur headed to the conservatory telegraph station, Marcus followed, severed the wires, and silenced him with the conservatory pruning shears.',
  imageUrl: case1Image,
  videoUrl: 'https://streamable.com/ief8tb',
  videoEmbedUrl: 'https://streamable.com/e/ief8tb?autoplay=1&muted=1&loop=1',
};
