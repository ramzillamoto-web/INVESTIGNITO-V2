import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import { CASE_2_NAMES_POOL } from './namesPool';
import case2Image from '../assets/images/case_2_scene_1787986930670.jpg';

// Official Forensic Evidence Dossiers & Staff Witness Transcripts for Case 2
export const CASE_2_DOSSIERS: EvidenceDossier[] = [
  {
    id: 'dossier-2-1',
    category: 'Forensic Report',
    title: 'Crime Scene Examination: Walled Yew Garden & Fountain',
    author: 'Chief Inspector Donald Vance, Berkshire Constabulary',
    timestamp: '01:15 AM • Solstice Midnight Masquerade',
    summary: 'Lord Alistair Sterling vanished after stepping into the walled rose garden at midnight. A crushed pocket watch and chloroform residue were discovered.',
    details: [
      'Physical evidence recovered at the marble sundial: Lord Alistair’s silver pocket watch, smashed and frozen at exactly 12:08 AM.',
      'A bloodstained silk cravat and faint residue of medical-grade chloroform were found beside the hemlock archway.',
      'Deep drag impressions in the garden loam lead directly toward the sealed subterranean drainage culvert leading to the river wharf.',
      'The iron garden gate was locked from the outside at 12:15 AM with an antique brass mortise key.'
    ],
    keyObservation: 'The abductor planned the extraction methodically and possessed access keys to the estate’s private botanical enclosures.',
    stamp: 'FORENSIC CRIME SCENE SEALED'
  },
  {
    id: 'dossier-2-2',
    category: 'Witness Statement',
    title: 'Interrogation Transcript: Lady Evelyn Vance',
    author: 'Lady Evelyn Vance, Gala Hostess & Society Patron',
    timestamp: '01:40 AM • Ashgrove Grand Salon',
    summary: 'Observed Lord Alistair receive an emerald-sealed parchment from a masked guest dressed in raven plumage minutes before midnight.',
    details: [
      '“Alistair was speaking with diplomats near the champagne tower when a tall guest wearing a black raven mask handed him a sealed envelope.”',
      '“He paled immediately upon reading it, muttered something about an old debt from the Bengal trading voyage, and slipped out the French doors into the mist.”',
      '“No one enters the private walled garden without registering at the carriage gatehouse—the master folio contains all 600 names.”'
    ],
    keyObservation: 'The abductor is confirmed to be one of the 600 masquerade attendees registered in the 10-page gatekeeper folio.',
    stamp: 'SWORN STATEMENT'
  },
  {
    id: 'dossier-2-3',
    category: 'Butler Log',
    title: 'Gatekeeper Log & Carriage Gate Registry',
    author: 'Barnaby Finch, Master Groundskeeper (28 Years at Ashgrove)',
    timestamp: '02:00 AM • West Gatehouse',
    summary: 'Verified that 600 guests were checked in and distributed across the 10 folio sections prior to the carriage gate lockdown at 11:30 PM.',
    details: [
      '10:00 PM: 600 masked attendees verified against estate guestbooks across 10 registry ledger pages (60 names per page).',
      '11:30 PM: Carriage perimeter sealed. Heavy fog settled over the Thames basin.',
      '12:08 AM: Distant scuffle reported near the sunken arbor. Footprints confirm a clandestine departure toward the old dry dock.',
      'Crucial Note: The abductor was assigned lodging quarters in the West Pavilion suites.'
    ],
    keyObservation: 'The culprit cannot have fled outside the perimeter without passing through the master registry records.',
    stamp: 'REGISTRY AUTHENTICATED'
  },
  {
    id: 'dossier-2-4',
    category: 'Witness Statement',
    title: 'Recovered Evidence: The Torn Garden Note',
    author: 'Sergeant Miller, Evidence Officer',
    timestamp: '02:15 AM • Evidence Locker',
    summary: 'A torn parchment fragment retrieved from the garden mud beside the marble fountain with cryptic instructions.',
    details: [
      '“...meet me by the marble sundial before the midnight chimes cease. The Bengal indenture papers must be settled tonight, or the truth will be published.”',
      'The wax seal fragments show a double-headed griffin crest and traces of dried lavender oil.',
      'The handwriting matches the formal register signatures on the odd-numbered guest pages.'
    ],
    keyObservation: 'The extortion and abduction were motivated by the buried Bengal shipping scandal and estate deeds.',
    stamp: 'RECOVERED PARCHMENT'
  },
  {
    id: 'dossier-2-5',
    category: 'Manor Wing Dispatch',
    title: 'Ashgrove Pavilion Map & Registry Division',
    author: 'Detective Inspector Donald Vance, Bureau of Deduction',
    timestamp: '02:30 AM • Incident Command',
    summary: 'Official division of the 600 guests across the 10 ledger pages of Ashgrove Manor.',
    details: [
      'Pages 1–2: Rose Courtyard & North Pavilion Suites (120 Guests)',
      'Pages 3–4: East Orangery & Labyrinth Galleries (120 Guests)',
      'Pages 5–6: Central Ballroom & Grand Terrace (120 Guests)',
      'Pages 7–8: West Pavilion & River View Chambers (120 Guests)',
      'Pages 9–10: South Garden Cottages & Carriage Mews (120 Guests)'
    ],
    keyObservation: 'Analyze the 8 sequential clues in strict order to eliminate innocent guests and isolate the single abductor.',
    stamp: 'BUREAU CLASSIFIED'
  }
];

// Sequential Clues for Case 2
export const CASE_2_CLUES: Clue[] = [
  {
    id: 1,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #1: The Missing O',
    clueText: 'Forensic notes and cipher analysis confirm: The culprit’s name contains NO letter "O" (case-insensitive). Cross out every name containing "O" or "o".',
    logicRule: 'NAME CONTAINS NO "O"',
    evidenceType: 'forensic',
  },
  {
    id: 2,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #2: The Consonant Mark',
    clueText: 'A partially recovered telegraph dispatch reveals: The culprit’s name contains an "N" (case-insensitive). Cross out every name that does NOT contain "N" or "n".',
    logicRule: 'NAME CONTAINS AN "N"',
    evidenceType: 'forensic',
  },
  {
    id: 3,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #3: Vowel Resonance',
    clueText: 'Audio testimony from the masked ballroom verifies: The culprit’s name has EXACTLY 2 VOWELS (A, E, I, O, U — Y does not count). Cross out every name that does not have exactly two vowels.',
    logicRule: 'NAME HAS EXACTLY 2 VOWELS (A E I O U — Y DOESN\'T COUNT)',
    evidenceType: 'testimony',
  },
  {
    id: 4,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #4: Repeated Letter',
    clueText: 'A torn monogram slip indicates a recurring letter pattern: A letter appears AT LEAST TWICE (anywhere in the name). Cross out any name where every letter is distinct.',
    logicRule: 'A LETTER APPEARS AT LEAST TWICE (ANYWHERE IN THE NAME)',
    evidenceType: 'physical',
  },
  {
    id: 5,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #5: No Letter A',
    clueText: 'Chemical analysis of the chloroform bottle residue confirms: The culprit’s name contains NO letter "A" (case-insensitive). Cross out every name containing "A" or "a".',
    logicRule: 'NAME CONTAINS NO "A"',
    evidenceType: 'forensic',
  },
  {
    id: 6,
    number: 6,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #6: Initial Consonants',
    clueText: 'The river gatehouse registry cipher narrows the initial: The culprit’s name STARTS WITH N, V, OR W. Cross out all names starting with any other letter.',
    logicRule: 'NAME STARTS WITH N, V, OR W',
    evidenceType: 'registry',
  },
  {
    id: 7,
    number: 7,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #7: Page Number & Letter Count',
    clueText: 'The estate ledger geometry aligns: The culprit’s REGISTRY PAGE NUMBER equals the exact NUMBER OF LETTERS IN THEIR NAME. Cross out every name whose letter count does not equal its page number.',
    logicRule: 'REGISTRY PAGE NUMBER = NUMBER OF LETTERS IN NAME',
    evidenceType: 'timeline',
  },
  {
    id: 8,
    number: 8,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #8: Left Neighbor Chain',
    clueText: 'The guest registry seating order reveals a linking chain: The name NEXT TO IT ON THE LEFT must START WITH this name\'s LAST LETTER (e.g. KATE · MARK →). Circle the culprit.',
    logicRule: 'THE NAME NEXT TO IT ON THE LEFT MUST START WITH THIS NAME\'S LAST LETTER (E.G. KATE · MARK →)',
    evidenceType: 'physical',
  },
];

// Helper to generate a full 600 single-name dataset with mixed random lengths and non-alphabetical distribution for Case 2
function generateCase2Names(): Suspect[] {
  // Deterministic PRNG with fixed seed
  let s = 54321;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const pool = Array.from(new Set(CASE_2_NAMES_POOL)).filter((n) => n !== 'Vincent');

  // Fisher-Yates shuffle with fixed seed to guarantee random non-alphabetical distribution & scattered lengths
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const suspects: Suspect[] = [];
  const used = new Set<string>();
  let poolIdx = 0;

  const rolesPool = [
    'Foreign Attache', 'Silk Merchant', 'Orangerie Curator', 'Naval Architect',
    'Banker & Investor', 'Royal Society Fellow', 'Portrait Draughtsman', 'Estate Solicitor',
    'Chamberlain Aide', 'Astronomer', 'Bookbinder', 'Private Physician',
    'Master Cartographer', 'Clockmaker Guildsman', 'Philanthropist', 'County Surveyor'
  ];

  for (let page = 1; page <= 10; page++) {
    for (let slot = 0; slot < 60; slot++) {
      const row = Math.floor(slot / 4) + 1; // 1 to 15 (4 per row)
      const col = (slot % 4) + 1; // 1 to 4 (4 per row)
      const id = `c2-p${page}-r${row}-c${col}`;

      // Insert Tristan at Page 7, Row 6, Col 3 (Left neighbor of Vincent, starts with 'T')
      if (page === 7 && row === 6 && col === 3) {
        suspects.push({
          id: 'c2-p7-r6-c3-tristan',
          name: 'Tristan',
          firstName: 'Tristan',
          lastName: '',
          pageNumber: 7,
          row: 6,
          col: 3,
          role: 'Naval Architect',
          traits: ['Pavilion Wing 7', 'Slot 6-3', 'Seated left of Vincent'],
          isGuest: false,
        });
        used.add('Tristan');
        continue;
      }

      // Insert Vincent at Page 7, Row 6, Col 4 (The True Culprit)
      if (page === 7 && row === 6 && col === 4) {
        suspects.push({
          id,
          name: 'Vincent',
          firstName: 'Vincent',
          lastName: '',
          pageNumber: 7,
          row: 6,
          col: 4,
          role: 'Foreign Attache & Envoy',
          traits: ['Pavilion Wing 7', 'Slot 6-4'],
          isGuest: true,
          alibi: 'Claims he was in the conservatory smoking lounge during the midnight toast.',
        });
        used.add('Vincent');
        continue;
      }

      let singleName = '';
      while (poolIdx < pool.length) {
        const candidate = pool[poolIdx++];
        if (!used.has(candidate) && candidate !== 'Vincent') {
          singleName = candidate;
          used.add(candidate);
          break;
        }
      }

      const role = rolesPool[(slot + page * 5) % rolesPool.length];

      suspects.push({
        id,
        name: singleName,
        firstName: singleName,
        lastName: '',
        pageNumber: page,
        row,
        col,
        role,
        traits: [`Pavilion Wing ${page}`, `Slot ${row}-${col}`],
        isGuest: false,
      });
    }
  }

  return suspects;
}

export const CASE_2_SUSPECTS: Suspect[] = generateCase2Names();

export const CASE_2_DATA: CaseData = {
  id: 'case-2',
  code: 'Case 2',
  title: 'The Solstice Masquerade',
  tagline: 'fog-shrouded river estate, Lord Alistair abducted at midnight',
  difficulty: 'Challenging',
  estimatedTime: '15-20 mins',
  dateAdded: 'Standard Case',
  victim: 'Lord Alistair Sterling (Abducted)',
  setting: 'Ashgrove Manor during the Solstice Masquerade ball. Exactly 600 masked attendees are registered in the master gatekeeper folio. Lord Alistair has been abducted from the walled garden.',
  scene: 'Walled Rose Garden & River Culvert, Ashgrove Manor',
  timeOfCrime: '12:08 AM (During the Midnight Toast)',
  briefing:
    'During the height of the Solstice Masquerade at Ashgrove Manor, Lord Alistair Sterling was lured into the walled garden and abducted. Chloroform residue and a smashed pocket watch were found by the marble sundial. Exactly 600 guests are logged in the 10-page gatekeeper folio. Use the 8 sequential clues to rule out innocent attendees and identify the abductor!',
  dossiers: CASE_2_DOSSIERS,
  clues: CASE_2_CLUES,
  totalPages: 10,
  namesPerPage: 60,
  suspects: CASE_2_SUSPECTS,
  solution: {
    killerName: 'Vincent',
    killerPage: 7,
    row: 6,
    col: 4,
    motive: 'Vincent orchestrated the abduction to reclaim unpaid Bengal shipping dividends and forged shipping manifests that Lord Alistair suppressed a decade ago.',
    gridLocation: 'Page 7, Column 4, Row 6',
  },
  solutionBrief:
    'Vincent used a forged invitation to attend the Solstice Masquerade masked in raven plumage. He handed Lord Alistair an emerald-sealed extortion note referencing the Bengal trading voyage, lured him into the secluded rose garden, administered chloroform, and transported him through the culvert to a waiting skiff.',
  imageUrl: case2Image,
  videoUrl: 'https://streamable.com/ief8tb',
  videoEmbedUrl: 'https://streamable.com/e/ief8tb?autoplay=1&muted=1&loop=1',
};
