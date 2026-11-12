import { CaseData, EvidenceDossier, Clue, Suspect } from '../types';
import case3Image from '../assets/images/case_3_scene_1788244598271.jpg';

// Official Railway & Constabulary Evidence Dossiers for Case 3
export const CASE_3_DOSSIERS: EvidenceDossier[] = [
  {
    id: 'dossier-3-1',
    category: 'Forensic Report',
    title: 'Constabulary Inspection: Rear Carriage Compartment 4',
    author: 'Inspector Thomas Callow, Ashwood Railway Police',
    timestamp: '01:10 AM • Midnight Service Arrival',
    summary: 'Vaughan was discovered deceased in the rear compartment of the 11:40 service from Hollow Wick. A partially burnt return ticket was recovered from his inner overcoat pocket.',
    details: [
      'Victim identity confirmed: Vaughan, ticket holder for seat #21 on Page 1 of the Hollow Wick ledger.',
      'Time of death estimated at approximately 12:20 AM, during the transit between Marsden Junction and the Ashwood approaches.',
      'A second ticket stub was recovered from the victim’s inner coat pocket, singed and charred at the corner from a sulfur match.',
      'Forensic analysis of the burnt stub proves conclusively that there was NO letter "E" in the purchaser’s name.'
    ],
    keyObservation: 'The burnt ticket stub was kept as evidence or collateral against the murderer, who struck to reclaim it before the Ashwood stop.',
    stamp: 'RAILWAY CONSTABULARY SEALED'
  },
  {
    id: 'dossier-3-2',
    category: 'Witness Statement',
    title: 'Interrogation Transcript: Night Guard Arthur Preece',
    author: 'Arthur Preece, Head Guard on the 11:40 Night Express',
    timestamp: '01:30 AM • Ashwood Guard Office',
    summary: 'The guard verified ticket collections at Marsden Junction and recalled specific traits of the passenger in question.',
    details: [
      '“I inspected tickets as we steamed through the Marsden junction cutting. The passenger had a short name—five letters at the most.”',
      '“Our passenger was leaning over the seat behind to speak in hushed tones—and I noticed both their names started with the exact same letter.”',
      '“When we pulled into Ashwood at 12:52, the rear compartment door swung open and one passenger slipped into the station shadow.”'
    ],
    keyObservation: 'The guard confirms the killer’s name has 5 or fewer letters, and the person sitting directly behind in the ledger shares the same initial letter.',
    stamp: 'SWORN TRANSCRIPT'
  },
  {
    id: 'dossier-3-3',
    category: 'Butler Log',
    title: 'Marsden Signal Box Telegraph Log',
    author: 'Chief Signalman George Briggs, Marsden Junction Box 3',
    timestamp: '02:05 AM • Telegraph Dispatch',
    summary: 'Ashwood wired Hollow Wick before dawn. The telegraph wire was impaired by rain, transmitting only two distinct open vowel sounds.',
    details: [
      '“Ashwood wired Hollow Wick at 01:45 AM requesting passenger records. The Morse wire was crackling badly.”',
      '“Only the clear vowel resonance carried across the line: exactly two vowels were recorded in the passenger name.”',
      '“I also observed a face at the corridor window while the express slowed past the signal lamps—someone yelled a name beginning with A down the platform.”'
    ],
    keyObservation: 'The suspect’s name contains exactly two vowels (a, e, i, o, u; Y excluded) and features the letter "A".',
    stamp: 'TELEGRAPH LOG VERIFIED'
  },
  {
    id: 'dossier-3-4',
    category: 'Witness Statement',
    title: 'Station Master Statement: The "Jan" Mystery',
    author: 'Horace Vance, Hollow Wick Station Master',
    timestamp: '02:30 AM • Hollow Wick Foyer',
    summary: 'Town gossip has wrongly accused Jan, but her ticket was never used and her coat was left untouched on the platform bench.',
    details: [
      '“The town constable jumped to conclusions when Jan’s name appeared on page 6 of the ledger.”',
      '“Jan never boarded the train—her coat remained draped over the oak bench on platform 2 until morning.”',
      '“The ticket clerk had a meticulous habit: he ruled an ink line beneath any name ending in an open vowel sound. This ticket had a ruled underline.”'
    ],
    keyObservation: 'Jan is innocent. The true murderer’s name ends in a vowel and purchased a return ticket.',
    stamp: 'STATION MASTER WITNESS'
  },
  {
    id: 'dossier-3-5',
    category: 'Manor Wing Dispatch',
    title: 'Hollow Wick Ticket Ledger Distribution',
    author: 'Constabulary Dispatch Office, Ashwood',
    timestamp: '02:50 AM • Master Ticket Archive',
    summary: 'The 300 passengers on the 11:40 service are registered in exact seating order across 6 ledger pages (50 per page).',
    details: [
      'Page 1: Forward Carriage Compartments 1–2 (Seats 1–50)',
      'Page 2: Forward-Mid Carriage Compartments 3–4 (Seats 51–100)',
      'Page 3: Mid-Train Saloon & Corridor Berths (Seats 101–150)',
      'Page 4: Rear-Mid Compartments 5–6 (Seats 151–200)',
      'Page 5: Rear Carriage Forward Berths (Seats 201–250)',
      'Page 6: Rear Carriage Guard Compartments & Jan’s Berth (Seats 251–300)'
    ],
    keyObservation: 'Follow the 8 sequential clues in exact order to eliminate innocent passengers and isolate the killer from the 300 ticket holders.',
    stamp: 'MASTER LEDGER VERIFIED'
  }
];

// The 8 Sequential Clues for Case 3
export const CASE_3_CLUES: Clue[] = [
  {
    id: 1,
    number: 1,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #1: The Burnt Stub',
    clueText: 'The ticket stub found in Vaughan’s coat pocket had no trace of the letter E: The culprit’s name CONTAINS NO "E" (case-insensitive). Cross out every name containing "E" or "e".',
    logicRule: 'NAME CONTAINS NO "E"',
    evidenceType: 'physical',
  },
  {
    id: 2,
    number: 2,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #2: Silent Whispers',
    clueText: 'No sibilant sounds were heard in the compartment: The culprit’s name CONTAINS NO "S" (case-insensitive). Cross out every name containing "S" or "s".',
    logicRule: 'NAME CONTAINS NO "S"',
    evidenceType: 'testimony',
  },
  {
    id: 3,
    number: 3,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #3: Short Name Length',
    clueText: 'The guard recalled a concise name on the ticket: NAME LENGTH <= 6 (CROSS IF >= 7). Cross out every name with 7 or more letters.',
    logicRule: 'NAME LENGTH <= 6 (CROSS IF >= 7)',
    evidenceType: 'timeline',
  },
  {
    id: 4,
    number: 4,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #4: Column 4 Elimination',
    clueText: 'The ticket inspector confirmed the suspect was not seated in the far column: The culprit’s NAME IS NOT IN COLUMN 4 OF ANY PAGE. Cross out every name in Column 4 of any page.',
    logicRule: 'NAME IS NOT IN COLUMN 4 OF ANY PAGE',
    evidenceType: 'registry',
  },
  {
    id: 5,
    number: 5,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #5: Double Letter',
    clueText: 'Handwriting analysis of the ticket ledger shows ink doubling: The culprit’s NAME HAS A DOUBLE LETTER (same letter twice in a row). Cross out any name without a consecutive double letter.',
    logicRule: 'NAME HAS A DOUBLE LETTER (SAME LETTER TWICE IN A ROW)',
    evidenceType: 'forensic',
  },
  {
    id: 6,
    number: 6,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #6: Matching First and Last Letter',
    clueText: 'The return ticket had identical stamps on both ends: The culprit’s NAME STARTS AND ENDS WITH THE SAME LETTER. Cross out every name whose first and last letters differ.',
    logicRule: 'NAME STARTS AND ENDS WITH THE SAME LETTER',
    evidenceType: 'physical',
  },
  {
    id: 7,
    number: 7,
    phase: 'Phase 1: Elimination (Cross)',
    toolType: 'X',
    title: 'Clue #7: Name Directly Below',
    clueText: 'The passenger in the adjacent berth leaned back: THE NAME DIRECTLY BELOW IT MUST START WITH THE SAME LETTER (e.g. MARK / MOLLY →). Cross out any candidate whose immediate downward neighbor starts with a different letter.',
    logicRule: 'THE NAME DIRECTLY BELOW IT MUST START WITH THE SAME LETTER (E.G. MARK / MOLLY →)',
    evidenceType: 'testimony',
  },
  {
    id: 8,
    number: 8,
    phase: 'Phase 2: Selection / Shortlisting (Circle)',
    toolType: 'Circle',
    title: 'Clue #8: Solitary Occurrence',
    clueText: 'THE NAME MUST APPEAR ONLY ONCE IN THE WHOLE LIST. CHECK ALL 6 PAGES, INCLUDING CROSSED-OUT NAMES (E.G. TWO ORSONS → CROSS BOTH). Circle the isolated culprit.',
    logicRule: 'THE NAME MUST APPEAR ONLY ONCE IN THE WHOLE LIST. CHECK ALL 6 PAGES, INCLUDING CROSSED-OUT NAMES (E.G. TWO ORSONS → CROSS BOTH)',
    evidenceType: 'registry',
  },
];

// Raw Page Data for Case 3 (300 Names Total • 6 Pages • 50 Per Page)
export const CASE_3_RAW_PAGES: { page: number; left: string[]; right: string[] }[] = [
  {
    page: 1,
    left: [
      'Stuart', 'Hugo', 'Martha', 'Patrick', 'Ignatius', 'Frances', 'Ruth', 'Esther',
      'Nigel', 'Bernadette', 'Bronwen', 'Arnold', 'Miles', 'Ivor', 'Freda', 'Tristram',
      'Amy', 'Reginald', 'Muriel', 'Zebedee', 'Vaughan', 'Lois', 'Ottilie', 'Florence', 'Sadie'
    ],
    right: [
      'Moses', 'Junia', 'Zillah', 'Dominic', 'Ralph', 'Eli', 'Ronald', 'Osric',
      'Clement', 'Gordon', 'Miriam', 'Iva', 'Polly', 'Dennis', 'Roger', 'Winifred',
      'Joshua', 'Asa', 'Greta', 'Ulric', 'Lucas', 'Agatha', 'Tamsin', 'Doris', 'Norah'
    ]
  },
  {
    page: 2,
    left: [
      'Cosmo', 'Timothy', 'Mortimer', 'Uriah', 'Otho', 'Nancy', 'Lavinia', 'Winston',
      'Josephine', 'Vita', 'Juno', 'Agnes', 'Ailsa', 'Amos', 'Lewis', 'Peregrine',
      'Moira', 'Alma', 'Augustin', 'Jacintha', 'Mavis', 'Orson', 'Marcia', 'Micah', 'Montague'
    ],
    right: [
      'Julia', 'Oscar', 'Evan', 'Bram', 'Charity', 'Nathaniel', 'Ernest', 'Solomon',
      'Sybil', 'Alba', 'Lettice', 'Bartholomew', 'Alberta', 'Maia', 'Baldwin', 'Percy',
      'Naomi', 'Theresa', 'Rufus', 'Hortense', 'Frank', 'Jacob', 'Delia', 'Ian', 'Keith'
    ]
  },
  {
    page: 3,
    left: [
      'Zachariah', 'Torin', 'Oswald', 'Conrad', 'Hester', 'Phyllis', 'Etta', 'Cora',
      'Mary', 'Vashti', 'Saul', 'Halcyon', 'Ruby', 'Henrietta', 'Sabina', 'Ned',
      'Sibyl', 'Ivy', 'Eliza', 'Wilhelmina', 'Oliver', 'Bessie', 'Mabel', 'Constance', 'Poppy'
    ],
    right: [
      'Ava', 'Trudy', 'Julian', 'Rollo', 'Toby', 'Cornelia', 'Priscilla', 'Sylvester',
      'Clive', 'Jessamy', 'Cedric', 'Lilian', 'Clarissa', 'Simon', 'Tania', 'Andrew',
      'Kitty', 'Everett', 'Ellen', 'Olive', 'Walter', 'Judith', 'Bella', 'Herbert', 'Bruno'
    ]
  },
  {
    page: 4,
    left: [
      'Fergus', 'Rebecca', 'Howard', 'May', 'Rosamund', 'Lancelot', 'Ulysses', 'Dorothea',
      'Patience', 'Ariadne', 'Gideon', 'Minerva', 'Fletcher', 'Sarah', 'Jemima', 'Robin',
      'Cornelius', 'Winnie', 'Humphrey', 'Alva', 'Violet', 'Olivia', 'Deborah', 'Basil', 'Felix'
    ],
    right: [
      'Bridget', 'Cecil', 'Iona', 'Jude', 'Jane', 'Elias', 'Millicent', 'Maggie',
      'Nina', 'Josiah', 'Isla', 'Blanche', 'Dorcas', 'Nan', 'Selwyn', 'Tabitha',
      'Rhoda', 'Thomas', 'Octavia', 'Odette', 'Blythe', 'Biddy', 'Malachi', 'Dunstan', 'Hilary'
    ]
  },
  {
    page: 5,
    left: [
      'Edgar', 'Wyatt', 'Opal', 'Cordelia', 'Willoughby', 'Boris', 'Egbert', 'Thaddeus',
      'Alistair', 'Tobias', 'Nicholas', 'Iris', 'Arthur', 'Neville', 'Edmund', 'Hilda',
      'Wilbur', 'Ezra', 'Lily', 'Annie', 'Otto', 'Lionel', 'Francis', 'Lucretia', 'Owen'
    ],
    right: [
      'Philip', 'Eustace', 'Aloysius', 'Harvey', 'Ursula', 'Jasper', 'Isadora', 'Louisa',
      'Peggy', 'Rita', 'Molly', 'Ebenezer', 'Marigold', 'Fanny', 'Randall', 'Edna',
      'Jerome', 'Cyprian', 'Aida', 'Zeke', 'Hugh', 'Bertram', 'Verity', 'Victoria', 'Lloyd'
    ]
  },
  {
    page: 6,
    left: [
      'Doron', 'Caleb', 'Orson', 'Murdoch', 'Justin', 'Virgil', 'Lazarus', 'Colin',
      'Milo', 'Enid', 'Zilpah', 'Rachel', 'Jeremiah', 'Silas', 'Cara', 'Susanna',
      'Rowland', 'Samson', 'Tryphena', 'Gloria', 'Nell', 'Victor', 'Gertrude', 'Veronica', 'Osbert'
    ],
    right: [
      'Mercy', 'Rex', 'Matthias', 'Nadia', 'Viola', 'Ina', 'Gareth', 'Sonia',
      'Pearl', 'Oberon', 'Seth', 'Lucy', 'Jan', 'Charlotte', 'Horace', 'Eunice',
      'Hetty', 'Doreen', 'Gregory', 'Aggie', 'Marjorie', 'Samuel', 'Evelyn', 'Frederick', 'Rosalind'
    ]
  }
];

// Generate Suspect array for Case 3
function generateCase3Suspects(): Suspect[] {
  const suspects: Suspect[] = [];

  for (const pageData of CASE_3_RAW_PAGES) {
    const page = pageData.page;
    const combinedNames = [...pageData.left, ...pageData.right];

    combinedNames.forEach((name, slot) => {
      const isLeft = slot < 25;
      const seatNumber = slot + 1;
      const row = Math.floor(slot / 4) + 1; // 1 to 13
      const col = (slot % 4) + 1; // 1 to 4
      const id = `c3-p${page}-s${seatNumber}-${name.toLowerCase()}`;

      let isGuest = false;
      let role = `Seat #${seatNumber} • ${isLeft ? 'Left Aisle' : 'Right Aisle'}`;
      let traits = [`Page ${page} - Seat ${seatNumber}`, isLeft ? 'Left Ledger' : 'Right Ledger'];
      let alibi = undefined;

      if (name.toLowerCase() === 'otto' && page === 5) {
        isGuest = true;
        role = `Seat #${seatNumber} • Left Aisle`;
        traits = ['Page 5 - Seat 21 (R6:C1)', 'Left Ledger', 'Directly above Owen (R7:C1)'];
      } else if (name.toLowerCase() === 'alma') {
        isGuest = true;
        role = `Seat #${seatNumber} • Left Aisle`;
        traits = ['Page 2 - Seat 18', 'Left Ledger'];
        alibi = 'Claimed she remained seated reading throughout the journey to Ashwood.';
      } else if (name.toLowerCase() === 'jan') {
        isGuest = true;
        role = `Seat #${seatNumber} • Right Aisle`;
        traits = ['Page 6 - Seat 38', 'Coat left on Hollow Wick platform bench'];
        alibi = 'Never boarded the 11:40 train; ticket remained in clerk ledger.';
      } else if (name.toLowerCase() === 'vaughan') {
        isGuest = true;
        role = 'Seat #21 • Victim (Found in Rear Carriage)';
        traits = ['Page 1 - Seat 21', 'Holding burnt ticket stub'];
      } else if (name.toLowerCase() === 'augustin') {
        isGuest = true;
        role = `Seat #${seatNumber} • Left Aisle`;
        traits = ['Page 2 - Seat 19', 'Left Ledger'];
      }

      suspects.push({
        id,
        name,
        firstName: name,
        lastName: '',
        pageNumber: page,
        row,
        col,
        role,
        traits,
        isGuest,
        alibi
      });
    });
  }

  return suspects;
}

export const CASE_3_SUSPECTS: Suspect[] = generateCase3Suspects();

export const CASE_3_DATA: CaseData = {
  id: 'case-3',
  code: 'Case 3',
  title: 'Jan Never Left the Station',
  tagline: '11:40 last train from Hollow Wick, Vaughan murdered in rear carriage',
  difficulty: 'Challenging',
  estimatedTime: '15-20 mins',
  dateAdded: 'New Case',
  victim: 'Vaughan (Passenger & Ticket Holder)',
  setting: 'The 11:40 night train from Hollow Wick to Ashwood. Exactly 300 passengers are recorded across a 6-page ticket ledger in seating order.',
  scene: 'Rear Carriage & Ashwood Station Platform',
  timeOfCrime: '12:52 AM (Arrival at Ashwood)',
  briefing:
    'The 11:40 from Hollow Wick is the last service of the night. The list is the ticket ledger — everyone who bought a seat, written up in seating order, six pages of it. When the train reached Ashwood at 12:52 the guard found Vaughan dead in the rear carriage, his ticket still in his hand. There was a second ticket in his coat pocket, burnt at one corner, that wasn\'t his. The town has settled on Jan. She bought a seat on the 11:40, her coat was on the platform bench in the morning, and nobody has seen her since. Her name is on page 6. They\'re wrong, and the title says so. Jan never left the station — her ticket was sold and never used. Whoever killed Vaughan is somewhere else in that ledger, and the burnt ticket is the only thing that points at them.',
  dossiers: CASE_3_DOSSIERS,
  clues: CASE_3_CLUES,
  totalPages: 6,
  namesPerPage: 50,
  suspects: CASE_3_SUSPECTS,
  solution: {
    killerName: 'Otto',
    killerPage: 5,
    row: 6,
    col: 1,
    motive: 'Otto murdered Vaughan in the rear compartment to recover and destroy the incriminating second ticket stub and stolen railway treasury bonds before the train reached Ashwood.',
    gridLocation: 'Page 5, Left Column, Seat 21 (R6:C1)',
  },
  solutionBrief:
    'Otto boarded the 11:40 service from Hollow Wick. When Vaughan discovered the second ticket stub in the rear corridor, Otto struck him during transit through the dark cutting, leaving his seat in Row 6, Col 1 directly above Owen (Row 7, Col 1).',
  imageUrl: case3Image,
  videoUrl: 'https://streamable.com/ief8tb',
  videoEmbedUrl: 'https://streamable.com/e/ief8tb?autoplay=1&muted=1&loop=1',
};
