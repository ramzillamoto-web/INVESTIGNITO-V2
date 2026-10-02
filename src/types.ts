export type SuspectMarking = 'none' | 'cross' | 'circle';
export type MarkingColor = 'pink' | 'red' | 'green' | 'yellow' | 'blue' | 'orange';

export interface Suspect {
  id: string;
  name: string; // Single name (e.g. Marcus, Vincent, Reginald)
  firstName?: string;
  lastName?: string;
  pageNumber: number; // 1 to 10
  row: number; // 1 to 15 (4 in a row)
  col: number; // 1 to 4 (4 in a row)
  role?: string;
  traits?: string[];
  isGuest?: boolean; // Whether one of the primary manor guests
  guestId?: string;
  alibi?: string;
}

export interface ManorGuest {
  id: string;
  name: string;
  role: string;
  bio: string;
  motive: string;
  pageNumber: number;
  isKiller?: boolean;
}

export interface EvidenceDossier {
  id: string;
  category: 'Forensic Report' | 'Witness Statement' | 'Butler Log' | 'Manor Wing Dispatch';
  title: string;
  author: string;
  timestamp: string;
  summary: string;
  details: string[];
  keyObservation: string;
  stamp?: string;
}

export interface Clue {
  id: number;
  number: number;
  phase: 'Phase 1: Elimination (Cross)' | 'Phase 2: Selection / Shortlisting (Circle)';
  toolType: 'X' | 'Circle';
  title: string;
  clueText: string;
  logicRule: string;
  targetYield?: string;
  evidenceType: 'forensic' | 'testimony' | 'timeline' | 'physical' | 'registry';
}

export interface CaseSolution {
  killerName: string;
  killerPage: number;
  row: number;
  col: number;
  motive: string;
  gridLocation: string;
}

export interface CaseData {
  id: string;
  code: string;
  title: string;
  tagline: string;
  difficulty: 'Tutorial / Novice' | 'Challenging' | 'Mastermind';
  estimatedTime: string;
  dateAdded: string;
  victim: string;
  setting: string;
  scene: string;
  timeOfCrime: string;
  briefing: string;
  dossiers: EvidenceDossier[];
  clues: Clue[];
  totalPages: number;
  namesPerPage: number;
  suspects: Suspect[];
  solution: CaseSolution;
  solutionBrief: string;
  imageUrl?: string;
  videoUrl?: string;
  videoEmbedUrl?: string;
}

export interface CaseProgress {
  caseId: string;
  status: 'unsolved' | 'in_progress' | 'solved';
  elapsedSeconds: number;
  startedAt: number | null;
  lastActiveAt: number | null;
  markings: Record<string, SuspectMarking>;
  markingColors?: Record<string, MarkingColor>;
  activeMarkColor?: MarkingColor;
  cooldownUntil: number | null; // epoch timestamp in ms for 5-minute lockout
  solvedAt: number | null;
  solvedDateFormatted?: string;
  solveTimeSeconds: number | null;
  incorrectAttempts: number;
  lastFailedSubmission?: {
    name: string;
    page: number;
    timestamp: number;
  };
  notes: string;
  checkedClues: number[]; // ids of clues user checked off as analyzed
  assistMode?: boolean; // toggle for automated non-cheat whole-rule milestone detection
}

export type ViewMode = 'case_detail' | 'how_to_play';
