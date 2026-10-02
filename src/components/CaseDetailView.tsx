import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Play,
  RotateCcw,
  Info,
  XCircle,
  Circle,
  Eraser,
  HelpCircle,
  FileSpreadsheet,
  Skull,
  Compass,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  Camera,
  Eye,
  Lock,
  Unlock,
  Sparkles,
  Zap,
  ArrowRight,
  CheckSquare,
  Palette,
  Wrench,
  X,
} from 'lucide-react';
import { CaseData, CaseProgress, Suspect, SuspectMarking, MarkingColor, Clue } from '../types';
import { formatTime, COOLDOWN_DURATION_MS } from '../utils/storage';
import { RestartWarningModal } from './RestartWarningModal';
import { HeartbeatSuspenseModal } from './HeartbeatSuspenseModal';

export interface BrightColorOption {
  id: MarkingColor;
  name: string;
  hex: string;
}

export const BRIGHT_MARKING_COLORS: BrightColorOption[] = [
  { id: 'pink', name: 'Pink', hex: '#ff2d95' },
  { id: 'red', name: 'Red', hex: '#ff3b30' },
  { id: 'green', name: 'Green', hex: '#00e676' },
  { id: 'yellow', name: 'Yellow', hex: '#ffea00' },
  { id: 'blue', name: 'Blue', hex: '#00b0ff' },
  { id: 'orange', name: 'Orange', hex: '#ff9100' },
];

interface CaseDetailViewProps {
  caseItem: CaseData;
  progress: CaseProgress;
  isLocked?: boolean;
  onUpdateProgress: (updater: (prev: CaseProgress) => CaseProgress) => void;
  onSolveCase: (solveTimeSeconds: number) => void;
  onFailedSubmission: () => void;
  onOpenHelp: () => void;
  onResetCase: () => void;
  onSwitchToCase?: (caseId: string) => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseItem,
  progress,
  isLocked = false,
  onUpdateProgress,
  onSolveCase,
  onFailedSubmission,
  onOpenHelp,
  onResetCase,
  onSwitchToCase,
}) => {
  const [selectedTool, setSelectedTool] = useState<SuspectMarking>('cross');
  const [selectedColor, setSelectedColor] = useState<MarkingColor>(
    progress.activeMarkColor || 'pink'
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suspectNameInput, setSuspectNameInput] = useState<string>('');
  const [pageNumberInput, setPageNumberInput] = useState<number>(1);
  const [toolNotice, setToolNotice] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [highlightedClueRule, setHighlightedClueRule] = useState<number | null>(null);

  const activeColorConfig = useMemo(() => {
    return BRIGHT_MARKING_COLORS.find((c) => c.id === selectedColor) || BRIGHT_MARKING_COLORS[0];
  }, [selectedColor]);

  const handleSelectColor = (color: MarkingColor) => {
    setSelectedColor(color);
    onUpdateProgress((prev) => ({
      ...prev,
      activeMarkColor: color,
    }));
  };

  // If case is locked, show restricted clearance screen
  if (isLocked) {
    const isCase4Target = caseItem.id === 'case-4';
    const reqCaseId = 'case-3';
    const reqCaseTitle = 'Case 3: Jan Never Left the Station';

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in bg-[#0a0a0a] min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-950/80 border-2 border-amber-600 flex items-center justify-center text-amber-400 shadow-2xl mx-auto">
          {isCase4Target ? <Clock className="w-10 h-10 animate-pulse" /> : <Lock className="w-10 h-10" />}
        </div>
        <div className="space-y-3">
          <span className="px-3.5 py-1 rounded bg-amber-950/90 border border-amber-700 text-amber-300 font-mono text-xs font-black uppercase tracking-widest inline-block">
            {isCase4Target ? 'CLASSIFIED DOSSIER • CASE #4 COMING SOON' : 'RESTRICTED ACCESS • LEVEL 3 CLEARANCE REQUIRED'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight text-white">
            {isCase4Target ? 'Case #4 Coming Soon' : `${caseItem.title} is Locked`}
          </h1>
          <p className="text-neutral-300 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-medium">
            {isCase4Target ? (
              <>
                <strong>Case #4: The Pendulum Over Blackwood Spire</strong> will come soon! Our Scotland Yard archives and clockmaker guild registries are currently undergoing evidence sealing. Keep your instincts sharp—it will arrive in the next case release.
              </>
            ) : (
              <>
                Detective clearance for {caseItem.title} requires apprehending the culprit in <strong>{reqCaseTitle}</strong> first.
              </>
            )}
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {onSwitchToCase && (
            <button
              onClick={() => onSwitchToCase(isCase4Target ? 'case-3' : 'case-2')}
              className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-red-950/50"
            >
              <span>{isCase4Target ? 'Return to Case 3' : 'Investigate Case 2'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Expandable sections state - single atomic activeSection ensures strict mutual collapse across all cases
  const [activeSection, setActiveSection] = useState<'clues' | 'ledger' | null>(null);
  const [isToolsExpanded, setIsToolsExpanded] = useState<boolean>(false);
  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);
  const [showHeartbeatSuspense, setShowHeartbeatSuspense] = useState<boolean>(false);
  const [suspenseWarrantData, setSuspenseWarrantData] = useState<{
    name: string;
    page: number;
    isMatch: boolean;
  }>({ name: '', page: 1, isMatch: false });

  const handleConfirmRestart = () => {
    onResetCase();
    setCurrentPage(1);
    setSearchQuery('');
    setSuspectNameInput('');
    setPageNumberInput(1);
    setActiveSection(null);
    setIsToolsExpanded(false);
    setShowNotes(false);
    setHighlightedClueRule(null);
    setToolNotice('Case restarted. All markings, notes, and the stopwatch have been reset to start.');
    setTimeout(() => {
      setToolNotice(null);
    }, 4000);
  };

  // Reset page and mutual collapse state whenever active case changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setSuspectNameInput('');
    setPageNumberInput(1);
    setToolNotice(null);
    setActiveSection(null);
    setIsToolsExpanded(false);
  }, [caseItem.id]);

  const toggleSection = (sectionKey: 'clues' | 'ledger') => {
    setActiveSection((current) => {
      const next = current === sectionKey ? null : sectionKey;
      if (next !== 'ledger') {
        setIsToolsExpanded(false);
      }
      return next;
    });
  };

  // Mark in progress on any interaction
  const ensureInProgress = () => {
    if (progress.status === 'unsolved') {
      const now = Date.now();
      onUpdateProgress((prev) => ({
        ...prev,
        status: 'in_progress',
        startedAt: prev.startedAt || now,
        lastActiveAt: now,
      }));
    }
  };

  // Intense BEGIN Button Sequence State & Audio-Visual Impact
  const [isBeginningSequence, setIsBeginningSequence] = useState<boolean>(false);
  const [countdownStep, setCountdownStep] = useState<'3' | '2' | '1' | 'START!' | null>(null);

  const playCountdownTickAudio = (step: '3' | '2' | '1' | 'START!') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      if (step === 'START!') {
        // Grand detonating impact tone for START!
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.exponentialRampToValueAtTime(32, now + 0.7);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.85, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.75);

        // Bright high harmonic fanfare chime
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.setValueAtTime(1174.66, now + 0.12);
        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.linearRampToValueAtTime(0.45, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.5);
      } else {
        // Tense rhythmic countdown beep (higher pitch as it approaches 1)
        const pitchMap = { '3': 440, '2': 554.37, '1': 659.25 };
        const freq = pitchMap[step] || 440;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.55, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch {
      // Audio fallback
    }
  };

  const handleBeginCase = () => {
    if (isBeginningSequence || progress.status !== 'unsolved') return;
    setIsBeginningSequence(true);

    // Step 3 (0ms)
    setCountdownStep('3');
    playCountdownTickAudio('3');
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(50); } catch { /* ignore */ }
    }

    // Step 2 (700ms)
    setTimeout(() => {
      setCountdownStep('2');
      playCountdownTickAudio('2');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(65); } catch { /* ignore */ }
      }
    }, 700);

    // Step 1 (1400ms)
    setTimeout(() => {
      setCountdownStep('1');
      playCountdownTickAudio('1');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(80); } catch { /* ignore */ }
      }
    }, 1400);

    // Step START! (2100ms)
    setTimeout(() => {
      setCountdownStep('START!');
      playCountdownTickAudio('START!');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([100, 50, 150]); } catch { /* ignore */ }
      }
    }, 2100);

    // Finish & Launch into case (2750ms)
    setTimeout(() => {
      ensureInProgress();
      setIsBeginningSequence(false);
      setCountdownStep(null);
      setActiveSection('clues');
      setToolNotice('CASE FILE UNSEALED // INVESTIGATION STOPWATCH RUNNING');
      setTimeout(() => setToolNotice(null), 3500);
    }, 2750);
  };

  // Cooldown countdown
  const isCooldownActive = progress.cooldownUntil !== null && progress.cooldownUntil > Date.now();
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState<number>(() => {
    if (progress.cooldownUntil) {
      return Math.max(0, Math.ceil((progress.cooldownUntil - Date.now()) / 1000));
    }
    return 0;
  });

  useEffect(() => {
    if (!progress.cooldownUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((progress.cooldownUntil! - Date.now()) / 1000));
      setCooldownRemainingSeconds(remaining);
      if (remaining <= 0) {
        onUpdateProgress((prev) => ({ ...prev, cooldownUntil: null }));
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [progress.cooldownUntil, onUpdateProgress]);

  // Stopwatch interval when status === 'in_progress' and not in suspense
  useEffect(() => {
    if (progress.status !== 'in_progress' || showHeartbeatSuspense) return;
    const timer = setInterval(() => {
      onUpdateProgress((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
        lastActiveAt: Date.now(),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [progress.status, showHeartbeatSuspense, onUpdateProgress]);

  // Handle Mark Suspect
  const handleApplyMarking = (suspect: Suspect, forceTool?: SuspectMarking, forceColor?: MarkingColor) => {
    ensureInProgress();
    const tool = forceTool || selectedTool;
    const colorToUse = forceColor || selectedColor;
    const currentMark = (progress.markings && progress.markings[suspect.id]) || 'none';
    const currentColor = (progress.markingColors && progress.markingColors[suspect.id]) || (currentMark === 'circle' ? 'yellow' : 'pink');

    // Tool Rule constraint: A player CANNOT circle a crossed name!
    if (tool === 'circle' && currentMark === 'cross') {
      setToolNotice(`Cannot circle "${suspect.name}" while crossed out. Use the Eraser first!`);
      setTimeout(() => setToolNotice(null), 3500);
      return;
    }

    // Toggle & recolor behavior
    let nextMark: SuspectMarking = tool;
    let nextColor: MarkingColor | undefined = colorToUse;

    if (tool === 'none') {
      nextMark = 'none';
      nextColor = undefined;
    } else if (currentMark === tool) {
      if (currentColor === colorToUse) {
        nextMark = 'none';
        nextColor = undefined;
      } else {
        nextMark = tool;
        nextColor = colorToUse;
      }
    } else {
      nextMark = tool;
      nextColor = colorToUse;
    }

    onUpdateProgress((prev) => {
      const nextMarkings = { ...prev.markings };
      const nextColors = { ...(prev.markingColors || {}) };
      if (nextMark === 'none') {
        delete nextMarkings[suspect.id];
        delete nextColors[suspect.id];
      } else {
        nextMarkings[suspect.id] = nextMark;
        nextColors[suspect.id] = nextColor!;
      }
      return {
        ...prev,
        markings: nextMarkings,
        markingColors: nextColors,
        lastActiveAt: Date.now(),
      };
    });
  };

  // Submit Accusation Warrant - triggers 3-second fast heartbeat suspense animation
  const handleSubmitAccusation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldownActive || showHeartbeatSuspense) return;
    if (!suspectNameInput.trim()) return;

    ensureInProgress();
    const cleanInputName = suspectNameInput.trim().toLowerCase();
    const targetKillerName = caseItem.solution.killerName.toLowerCase();
    const targetKillerPage = caseItem.solution.killerPage;

    const isNameMatch = cleanInputName === targetKillerName;
    const isPageMatch = Number(pageNumberInput) === targetKillerPage;
    const isMatch = isNameMatch && isPageMatch;

    // Trigger 3-second fast heartbeat suspense animation before revealing result
    setSuspenseWarrantData({
      name: suspectNameInput.trim(),
      page: Number(pageNumberInput),
      isMatch,
    });
    setShowHeartbeatSuspense(true);
  };

  // Called after 3-second fast heartbeat animation finishes
  const handleSuspenseComplete = (isMatch: boolean) => {
    setShowHeartbeatSuspense(false);

    if (isMatch) {
      // Victory!
      const totalSolveSeconds = progress.elapsedSeconds;
      const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      onUpdateProgress((prev) => ({
        ...prev,
        status: 'solved',
        solvedAt: Date.now(),
        solvedDateFormatted: formattedDate,
        solveTimeSeconds: totalSolveSeconds,
      }));
      onSolveCase(totalSolveSeconds);
    } else {
      // Failed: 5-minute penalty
      const cooldownTimestamp = Date.now() + COOLDOWN_DURATION_MS;
      onUpdateProgress((prev) => ({
        ...prev,
        cooldownUntil: cooldownTimestamp,
        incorrectAttempts: prev.incorrectAttempts + 1,
        lastFailedSubmission: {
          name: suspenseWarrantData.name,
          page: suspenseWarrantData.page,
          timestamp: Date.now(),
        },
      }));
      onFailedSubmission();
    }
  };

  // Filter suspects for current page or search query
  const suspectsOnCurrentPage = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return caseItem.suspects.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.role && s.role.toLowerCase().includes(q)) ||
          s.traits?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return caseItem.suspects.filter((s) => s.pageNumber === currentPage);
  }, [caseItem.suspects, currentPage, searchQuery]);

  // Current page bulk selection calculations
  const totalOnCurrentPage = suspectsOnCurrentPage.length;
  const markedOnCurrentPageCount = useMemo(() => {
    const marks = progress.markings || {};
    return suspectsOnCurrentPage.filter(
      (s) => marks[s.id] && marks[s.id] !== 'none'
    ).length;
  }, [suspectsOnCurrentPage, progress.markings]);

  const isAllSelectedOnPage = totalOnCurrentPage > 0 && markedOnCurrentPageCount === totalOnCurrentPage;

  // Bulk Select All on current page
  const handleSelectAllOnPage = (toolOverride?: SuspectMarking, colorOverride?: MarkingColor) => {
    ensureInProgress();
    const toolToApply: SuspectMarking = toolOverride || (selectedTool === 'circle' ? 'circle' : 'cross');
    const colorToApply: MarkingColor = colorOverride || selectedColor;
    onUpdateProgress((prev) => {
      const nextMarkings = { ...prev.markings };
      const nextColors = { ...(prev.markingColors || {}) };
      suspectsOnCurrentPage.forEach((s) => {
        nextMarkings[s.id] = toolToApply;
        nextColors[s.id] = colorToApply;
      });
      return {
        ...prev,
        markings: nextMarkings,
        markingColors: nextColors,
        lastActiveAt: Date.now(),
      };
    });
  };

  // Bulk Unselect All on current page
  const handleUnselectAllOnPage = () => {
    ensureInProgress();
    onUpdateProgress((prev) => {
      const nextMarkings = { ...prev.markings };
      const nextColors = { ...(prev.markingColors || {}) };
      suspectsOnCurrentPage.forEach((s) => {
        delete nextMarkings[s.id];
        delete nextColors[s.id];
      });
      return {
        ...prev,
        markings: nextMarkings,
        markingColors: nextColors,
        lastActiveAt: Date.now(),
      };
    });
  };

  // Overall statistics
  const crossedTotal = Object.values(progress.markings || {}).filter((m) => m === 'cross').length;
  const circledTotal = Object.values(progress.markings || {}).filter((m) => m === 'circle').length;
  const remainingSurviving = caseItem.suspects.length - crossedTotal;

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 bg-[#0a0a0a] text-[#f5f5f5]">
      {/* 1. Case Premise & Atmosphere Banner */}
      <div className="bg-neutral-900 border-2 border-neutral-800 rounded-xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3 flex-1">
            {/* Top metadata tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest bg-red-600 text-white">
                {caseItem.code}
              </span>
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-bold uppercase text-neutral-300 bg-neutral-800 border border-neutral-700">
                {caseItem.totalPages} PAGES • {caseItem.suspects.length} SUSPECTS
              </span>
              {caseItem.id === 'case-1' && (
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-bold uppercase text-neutral-300 bg-neutral-800 border border-neutral-700">
                  {caseItem.difficulty.toUpperCase()}
                </span>
              )}

              {/* Status Badge */}
              {progress.status === 'unsolved' && (
                <span
                  id="case-status-badge-unsolved"
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest bg-neutral-800 text-neutral-300 border border-neutral-700"
                >
                  (UNSOLVED)
                </span>
              )}
              {progress.status === 'in_progress' && (
                <span
                  id="case-status-badge-in-progress"
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest bg-red-600 text-white animate-pulse shadow-md"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                  (IN PROGRESS)
                </span>
              )}
              {progress.status === 'solved' && (
                <span
                  id="case-status-badge-solved"
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest bg-emerald-600 text-white shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  (SOLVED)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-5xl font-black font-display uppercase tracking-tight text-white leading-tight">
              {caseItem.title}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-red-500 uppercase tracking-wide">
              {caseItem.tagline}
            </p>
          </div>

          {/* Quick controls: Restart Button, Stopwatch, Help */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Restart Case Button (swapped to toolbar position where Begin was) */}
            <button
              id="btn-restart-case"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowRestartModal(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 border border-amber-500/50 hover:border-amber-400 shadow-sm transition-all cursor-pointer select-none touch-manipulation active:scale-[0.98] shrink-0"
              title="Restart case from the beginning (with warning confirmation)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
              <span className="whitespace-nowrap">Restart Case</span>
            </button>

            {/* Stopwatch Widget */}
            <div
              id="case-main-timer-widget"
              className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-3 rounded-lg bg-[#0a0a0a] border border-neutral-700 font-mono shadow-inner shrink-0"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
              <div>
                <span className="text-[8px] sm:text-[10px] uppercase font-bold text-neutral-500 block leading-none tracking-wider sm:tracking-widest">
                  TIME
                </span>
                <span className="text-xs sm:text-base font-black text-white tracking-wider sm:tracking-widest">
                  {formatTime(
                    progress.status === 'solved' && progress.solveTimeSeconds !== null
                      ? progress.solveTimeSeconds
                      : progress.elapsedSeconds
                  )}
                </span>
              </div>
            </div>

            {/* Show Details Toggle Button */}
            <button
              id="btn-toggle-show-details"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowDetails(!showDetails);
              }}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer select-none touch-manipulation active:scale-[0.98] flex-1 sm:flex-initial ${
                showDetails
                  ? 'bg-neutral-800 border-red-500 text-red-400 shadow-md ring-1 ring-red-500/50'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:text-white hover:border-neutral-500'
              }`}
              title="Toggle case details & briefing"
              aria-expanded={showDetails}
            >
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
              <span>{showDetails ? 'Hide Details' : 'Details'}</span>
              {showDetails ? (
                <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              ) : (
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              )}
            </button>

            {/* Detective Notes Toggle Button */}
            <button
              id="btn-toggle-notes"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowNotes(!showNotes);
              }}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer select-none touch-manipulation active:scale-[0.98] flex-1 sm:flex-initial ${
                showNotes
                  ? 'bg-neutral-800 border-red-500 text-red-400 shadow-md ring-1 ring-red-500/50'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white hover:border-neutral-500'
              }`}
              title="Toggle detective scratchpad & notes"
              aria-expanded={showNotes}
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
              <span>{showNotes ? 'Hide Notes' : 'Notes'}</span>
              {showNotes ? (
                <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              ) : (
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Prominent Centered BEGIN Button (Magnetic Pulling Idle + 3..2..1.. START! Countdown) */}
        {progress.status === 'unsolved' && (
          <div
            className={`w-full flex flex-col items-center justify-center pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-neutral-800/80 text-center relative ${
              countdownStep === 'START!' ? 'animate-impact-shudder' : 'animate-fade-in'
            }`}
          >
            {/* Screen Flash Strobe on Final Detonation */}
            {countdownStep === 'START!' && (
              <div className="fixed inset-0 pointer-events-none z-50 bg-red-600/25 animate-begin-flash backdrop-blur-[0.5px]" />
            )}

            <div className="relative inline-flex items-center justify-center my-2">
              {/* Magnetic Pulling Idle Rings (gravitational pull effect when idle) */}
              {!isBeginningSequence && (
                <>
                  <div className="absolute inset-0 -m-3 sm:-m-4 rounded-3xl border border-red-500/40 animate-pull-ring-idle pointer-events-none" />
                  <div className="absolute inset-0 -m-6 sm:-m-8 rounded-3xl border border-red-400/20 animate-pull-ring-idle [animation-delay:1.1s] pointer-events-none" />
                </>
              )}

              {/* Countdown Pulse Rings on each number tick */}
              {isBeginningSequence && countdownStep && countdownStep !== 'START!' && (
                <div
                  key={`pulse-ring-${countdownStep}`}
                  className="absolute inset-0 rounded-2xl border-2 border-red-400/80 animate-countdown-ring pointer-events-none"
                />
              )}

              {/* Intense Shockwave Blast Rings (radiates on START!) */}
              {countdownStep === 'START!' && (
                <>
                  <div className="absolute inset-0 rounded-2xl border-4 border-red-500 bg-red-600/30 animate-begin-shockwave-1 pointer-events-none shadow-[0_0_50px_rgba(239,68,68,0.9)]" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 bg-amber-500/20 animate-begin-shockwave-2 pointer-events-none shadow-[0_0_60px_rgba(245,158,11,0.7)]" />
                </>
              )}

              <button
                id="start-the-case-btn"
                type="button"
                onClick={handleBeginCase}
                disabled={isBeginningSequence}
                className={`relative overflow-hidden flex items-center justify-center gap-3 sm:gap-4 font-black px-8 sm:px-16 py-3.5 sm:py-5 rounded-2xl text-base sm:text-xl uppercase tracking-widest transition-all duration-200 cursor-pointer touch-manipulation group border-2 min-w-[240px] sm:min-w-[320px] ${
                  countdownStep === 'START!'
                    ? 'animate-begin-recoil bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white border-amber-300 ring-8 ring-red-500 shadow-2xl shadow-red-500'
                    : isBeginningSequence
                    ? 'bg-neutral-900/90 text-white border-red-500 ring-4 ring-red-600/70 shadow-2xl shadow-red-950'
                    : 'animate-begin-pull bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white border-red-300 ring-4 ring-red-600/60 hover:ring-red-400 shadow-2xl shadow-red-600/60 active:scale-95'
                }`}
                title="Begin the case and start the investigation stopwatch"
              >
                {/* Dynamic light reflection sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                {isBeginningSequence ? (
                  <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                    {countdownStep === 'START!' ? (
                      <div key="step-start" className="flex items-center gap-2.5 sm:gap-3 animate-countdown-pop">
                        <Zap className="w-7 h-7 sm:w-9 sm:h-9 text-amber-200 animate-bounce shrink-0 fill-current" />
                        <span className="font-display font-black tracking-[0.25em] text-2xl sm:text-4xl text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]">
                          START!
                        </span>
                        <Unlock className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse shrink-0" />
                      </div>
                    ) : (
                      <div key={`step-${countdownStep}`} className="flex items-center gap-3 sm:gap-4 animate-countdown-pop">
                        <span className="text-xs sm:text-sm font-mono tracking-widest text-red-400 font-bold uppercase">
                          UNSEALING IN
                        </span>
                        <span className="font-display font-black text-3xl sm:text-5xl text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] px-2">
                          {countdownStep}
                        </span>
                        <div className="flex gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${countdownStep === '3' || countdownStep === '2' || countdownStep === '1' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]' : 'bg-neutral-700'}`} />
                          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${countdownStep === '2' || countdownStep === '1' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]' : 'bg-neutral-700'}`} />
                          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${countdownStep === '1' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 'bg-neutral-700'}`} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current stroke-none text-white group-hover:scale-110 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span className="font-display font-black tracking-[0.25em] text-lg sm:text-2xl text-white drop-shadow-md">
                      BEGIN
                    </span>
                    <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-mono tracking-widest bg-black/40 text-red-100 px-2 py-0.5 rounded border border-red-300/40">
                      UNSEAL CASE
                    </span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-3 tracking-wide flex items-center justify-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isBeginningSequence ? 'bg-amber-400 animate-ping' : 'bg-red-500 animate-ping'}`} />
              <span>
                {isBeginningSequence
                  ? 'Stand by: Unsealing suspect registry and clue timeline...'
                  : 'Click to unseal case evidence and start the investigation timer'}
              </span>
            </p>
          </div>
        )}

        {/* Detective Scratchpad (rendered in header so it opens immediately into view when Notes is clicked) */}
        {showNotes && (
          <div id="detective-scratchpad-section" className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-neutral-800 animate-fade-in">
            <div className="bg-[#0a0a0a] border-2 border-neutral-700 rounded-xl p-3 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest text-red-500 flex items-center gap-1.5 sm:gap-2">
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  DETECTIVE'S SCRATCHPAD & THEORIES
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] sm:text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider sm:tracking-widest">
                    AUTO-SAVED
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotes(false)}
                    className="text-[10px] font-mono font-bold text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
              <textarea
                id="detective-notes-input"
                value={progress.notes || ''}
                maxLength={8000}
                onChange={(e) => {
                  const val = e.target.value;
                  ensureInProgress();
                  onUpdateProgress((prev) => ({ ...prev, notes: val }));
                }}
                placeholder="Type observations, letter counts, double consonants, elimination theories, and clues here..."
                className="w-full h-28 sm:h-36 bg-black/60 border border-neutral-700 rounded-lg p-2.5 sm:p-4 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-red-500 resize-y placeholder:text-neutral-600"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Expandable Case Dossier Summary Bar & Briefing Narrative with Crime Scene Photo */}
        {showDetails && (
          <div id="case-details-expandable-section" className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-neutral-800 space-y-3 sm:space-y-4 animate-fade-in">
            {/* Case Dossier Summary Bar */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-xs font-mono">
              <div className="bg-[#0a0a0a] p-2 sm:p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">VICTIM</span>
                <span className="text-white font-black text-xs sm:text-sm truncate block mt-0.5">{caseItem.victim}</span>
              </div>
              <div className="bg-[#0a0a0a] p-2 sm:p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">SCENE</span>
                <span className="text-white font-black text-xs sm:text-sm truncate block mt-0.5">{caseItem.scene}</span>
              </div>
              <div className="bg-[#0a0a0a] p-2 sm:p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">TIME</span>
                <span className="text-white font-black text-xs sm:text-sm truncate block mt-0.5">{caseItem.timeOfCrime?.split('(')[0]?.trim() || 'Night'}</span>
              </div>
            </div>

            {/* Split layout: Briefing text + Square Video Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
              {/* Briefing Narrative */}
              <div className="lg:col-span-8 bg-[#0a0a0a] p-3 sm:p-5 rounded-lg border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                    <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-400 block">
                      CASE BRIEFING & ATMOSPHERE:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetails(false)}
                      className="text-[10px] font-mono font-bold uppercase text-neutral-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Close</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-medium text-neutral-200 leading-relaxed mb-3 sm:mb-4 text-xs sm:text-sm">"{caseItem.briefing}"</p>
                </div>

                <div className="p-2 sm:p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 font-mono text-[10px] sm:text-xs text-neutral-400 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                  <span>Examine the forensic crime scene photograph on the right for atmospheric scene reconstruction.</span>
                </div>
              </div>

              {/* Square Crime Scene Image in Case Detail */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                <div className="w-full max-w-[240px] sm:max-w-[320px] aspect-square relative group">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-red-600/30 via-transparent to-red-500/20 blur-md pointer-events-none" />
                  <div className="relative aspect-square w-full rounded-xl bg-neutral-950 p-1.5 sm:p-2 border-2 border-neutral-700 shadow-xl overflow-hidden flex flex-col justify-between">
                    
                    {/* Top Crime Scene Badge */}
                    <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-neutral-800 text-[8px] sm:text-[9px] font-mono font-black uppercase text-neutral-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                        <Camera className="w-2.5 h-2.5 text-red-500" />
                        <span>SCENE • {caseItem.code}</span>
                      </div>
                      <span className="p-0.5 sm:p-1 rounded bg-black/80 text-neutral-400 border border-neutral-800 text-[8px] sm:text-[9px] font-mono">
                        EVIDENCE
                      </span>
                    </div>

                    {/* Forensic corner brackets */}
                    <div className="absolute top-1 left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 border-t-2 border-l-2 border-red-500 z-20 pointer-events-none" />
                    <div className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 border-t-2 border-r-2 border-red-500 z-20 pointer-events-none" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 border-b-2 border-l-2 border-red-500 z-20 pointer-events-none" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 border-b-2 border-r-2 border-red-500 z-20 pointer-events-none" />

                    {/* Square Image View */}
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={
                          caseItem.imageUrl ||
                          (caseItem.id === 'case-2'
                            ? '/images/case-2-scene.jpg'
                            : caseItem.id === 'case-3'
                            ? '/images/case-3-scene.jpg'
                            : caseItem.id === 'case-4'
                            ? '/images/case-4-scene.jpg'
                            : '/images/case-1-scene.jpg')
                        }
                        alt={`${caseItem.title} Crime Scene`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* Bottom scene caption */}
                    <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-neutral-800 text-[8px] sm:text-[9px] font-mono text-neutral-300">
                        <Eye className="w-2.5 h-2.5 text-amber-400" />
                        <span className="font-bold truncate max-w-[120px] sm:max-w-[140px]">
                          {caseItem.scene}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Centered Expandable Navigation Buttons for the 2 Core Modules */}
      <div className="flex flex-col items-center justify-center my-4 sm:my-6">
        <div className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider sm:tracking-widest text-neutral-400 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <span>INVESTIGATION MODULES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          <span className="text-neutral-500 font-normal">CLICK TO EXPAND</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-3xl">
          {/* 1. Sequential Clue Engine Expandable Button - Solid Crimson Red */}
          <button
            id="btn-toggle-clues"
            type="button"
            aria-expanded={activeSection === 'clues'}
            onClick={(e) => {
              e.preventDefault();
              toggleSection('clues');
            }}
            className={`w-full p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-2 sm:gap-3 text-left cursor-pointer group select-none touch-manipulation active:scale-[0.99] ${
              activeSection === 'clues'
                ? 'bg-red-950/80 border-red-500 shadow-xl shadow-red-900/60 ring-2 ring-red-500/80 animate-pumping-red'
                : 'bg-red-950/30 border-red-800/80 hover:border-red-500 hover:bg-red-950/50 text-neutral-300 hover:text-white hover:shadow-lg hover:shadow-red-950/50 animate-pumping-red'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-none min-w-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-mono font-black shadow-md transition-all shrink-0 ${
                  activeSection === 'clues'
                    ? 'bg-red-600 text-white shadow-red-500/50 ring-2 ring-red-400'
                    : 'bg-red-900/80 text-red-200 group-hover:bg-red-600 group-hover:text-white'
                }`}
              >
                <ListOrdered className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black font-display uppercase tracking-tight text-white block truncate">
                  Sequential Clue Engine
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-200/80 block mt-0.5 truncate">
                  {caseItem.clues.length} Sequential Deductions • {caseItem.suspects.length} {caseItem.id === 'case-3' ? 'Passengers' : 'Suspects'}
                </span>
              </div>
            </div>
            <div className="text-red-400 group-hover:text-white pointer-events-none transition-transform duration-200 shrink-0">
              {activeSection === 'clues' ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
          </button>

          {/* 2. Registry Ledger Expandable Button - Solid Amber Gold */}
          <button
            id="btn-toggle-ledger"
            type="button"
            aria-expanded={activeSection === 'ledger'}
            onClick={(e) => {
              e.preventDefault();
              toggleSection('ledger');
            }}
            className={`w-full p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-2 sm:gap-3 text-left cursor-pointer group select-none touch-manipulation active:scale-[0.99] ${
              activeSection === 'ledger'
                ? 'bg-amber-950/80 border-amber-500 shadow-xl shadow-amber-900/60 ring-2 ring-amber-500/80 animate-pumping-gold'
                : 'bg-amber-950/30 border-amber-800/80 hover:border-amber-500 hover:bg-amber-950/50 text-neutral-300 hover:text-white hover:shadow-lg hover:shadow-amber-950/50 animate-pumping-gold'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-none min-w-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-mono font-black shadow-md transition-all shrink-0 ${
                  activeSection === 'ledger'
                    ? 'bg-amber-500 text-black shadow-amber-400/50 ring-2 ring-amber-300'
                    : 'bg-amber-900/80 text-amber-200 group-hover:bg-amber-500 group-hover:text-black'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black font-display uppercase tracking-tight text-white block truncate">
                  Registry Ledger
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-200/80 block mt-0.5 truncate">
                  Page {currentPage}/{caseItem.totalPages} • {remainingSurviving} Remaining
                </span>
              </div>
            </div>
            <div className="text-amber-400 group-hover:text-white pointer-events-none transition-transform duration-200 shrink-0">
              {activeSection === 'ledger' ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 1. SEQUENTIAL CLUE ENGINE (Expandable Panel) */}
      {activeSection === 'clues' && (
        <div id="panel-clues" className="bg-neutral-900 border-2 border-red-600/80 rounded-xl p-3 sm:p-5 lg:p-6 shadow-2xl animate-fade-in">
          <div
            onClick={() => toggleSection('clues')}
            className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-neutral-800 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black shadow-md">
                <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black font-display uppercase tracking-tight text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5 sm:gap-2">
                  Sequential Clue Engine
                  <span className="text-[10px] sm:text-xs font-mono text-red-400/80 font-normal">[Click to close]</span>
                </h2>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 uppercase tracking-wide">
                  {caseItem.clues.length} Sequential Deductions • All Clues
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 bg-[#0a0a0a] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-neutral-800">
                {caseItem.clues.length} DIRECTIVES
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('clues');
                }}
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-red-950/80 border border-red-800 text-red-400 hover:bg-red-900 hover:text-white text-[10px] sm:text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                aria-label="Collapse clues"
              >
                <span>Close</span>
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* All Clues Listed Sequentially in One Page (Direct Clue Directives) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {caseItem.clues.map((clue) => {
              return (
                <div
                  key={clue.id}
                  id={`clue-card-${clue.id}`}
                  className="p-3 sm:p-3.5 rounded-xl border-2 bg-[#0a0a0a] border-neutral-800 hover:border-neutral-700 text-neutral-200 transition-all shadow-sm flex items-center gap-2.5 sm:gap-3"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-red-950/90 border border-red-700 flex items-center justify-center text-red-400 font-mono font-black text-xs sm:text-sm shrink-0 shadow-sm">
                    #{clue.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-black font-mono tracking-tight text-white uppercase leading-snug">
                      {clue.logicRule}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Close Footer Button */}
          <div className="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="button"
              onClick={() => toggleSection('clues')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 hover:text-white text-[10px] sm:text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer shadow-md"
            >
              <span>Close Clue Engine</span>
              <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. REGISTRY LEDGER (Expandable Panel) */}
      {activeSection === 'ledger' && (
        <div id="panel-ledger" className="space-y-4 sm:space-y-6 animate-fade-in border-2 border-amber-600/60 rounded-2xl p-2.5 sm:p-5 bg-black/40 pb-6 sm:pb-8">
          {/* 60-Name Ledger Container */}
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-xl p-2.5 sm:p-5 lg:p-6 shadow-xl">
            {/* Sticky Header & Search & Tool Controls (Directly in the header as circled) */}
            <div className="sticky top-2 sm:top-3 z-30 bg-neutral-900/98 backdrop-blur-md pb-3 mb-3 sm:mb-4 border-b border-neutral-800 rounded-t-lg pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                <div
                  onClick={() => toggleSection('ledger')}
                  className="cursor-pointer select-none group"
                >
                  <h2 className="text-sm sm:text-lg font-black font-display uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5 sm:gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-500" />
                    Registry Ledger ({caseItem.namesPerPage} Names • {caseItem.namesPerPage === 50 ? '2 Aisle Sections' : '4 Cols × 15 Rows'})
                    <span className="text-[9px] sm:text-xs font-mono text-amber-400/80 font-normal">[Click to close]</span>
                  </h2>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 uppercase tracking-wide">
                    Click card to apply {selectedTool === 'none' ? 'ERASER' : `${selectedTool.toUpperCase()} TOOL`}
                  </span>
                </div>

                {/* Right side controls: Search Filter + Sticky Expanding Tool Button in the circled spot */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Filter name or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#0a0a0a] border border-neutral-700 rounded-lg pl-7 sm:pl-9 pr-2.5 sm:pr-3 py-1 sm:py-2 text-[10px] sm:text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 w-32 sm:w-44 md:w-52 font-mono"
                    />
                  </div>

                  {/* Collapsed TOOL Button (located to the right of the search filter as circled) */}
                  {!isToolsExpanded ? (
                    <button
                      id="btn-ledger-tool-expand"
                      type="button"
                      onClick={() => setIsToolsExpanded(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-neutral-950 border-2 text-white font-mono font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md select-none touch-manipulation"
                      style={{
                        borderColor: activeColorConfig.hex,
                        boxShadow: `0 0 14px ${activeColorConfig.hex}45`,
                      }}
                      title="Click to expand Tools (X Tool, Circle, Eraser, Bright Color Picker)"
                    >
                      <Wrench className="w-3.5 h-3.5" style={{ color: activeColorConfig.hex }} />
                      <span className="tracking-wider font-black">TOOL</span>

                      {/* Active Tool & Color badge */}
                      <span
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase"
                        style={{
                          backgroundColor: activeColorConfig.hex,
                          color: ['yellow', 'green', 'blue'].includes(selectedColor) ? '#000' : '#fff',
                        }}
                      >
                        <span>{selectedTool === 'cross' ? 'X OUT' : selectedTool === 'circle' ? 'CIRCLE' : 'ERASER'}</span>
                        <span>•</span>
                        <span>{activeColorConfig.name}</span>
                      </span>

                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Expanded Tools Palette (Opens right in this header spot when "TOOL" is clicked) */}
              {isToolsExpanded && (
                <div
                  id="ledger-tools-expanded-bar"
                  className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-neutral-950/98 border-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3 animate-fade-in shadow-xl"
                  style={{
                    borderColor: activeColorConfig.hex,
                    boxShadow: `0 0 20px ${activeColorConfig.hex}40`,
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Header Collapse Button */}
                    <button
                      id="btn-ledger-tool-collapse"
                      type="button"
                      onClick={() => setIsToolsExpanded(false)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer transition-colors"
                      title="Click to collapse Tool"
                    >
                      <Wrench className="w-3 h-3" style={{ color: activeColorConfig.hex }} />
                      <span>TOOL</span>
                      <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {/* Tool Selectors */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        id="tool-cross-btn"
                        onClick={() => setSelectedTool('cross')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          selectedTool === 'cross'
                            ? 'ring-2 ring-white/90 shadow-md scale-[1.02]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        }`}
                        style={{
                          backgroundColor: selectedTool === 'cross' ? activeColorConfig.hex : undefined,
                          borderColor: selectedTool === 'cross' ? activeColorConfig.hex : undefined,
                          color: selectedTool === 'cross' ? (['yellow', 'green', 'blue'].includes(selectedColor) ? '#000' : '#fff') : activeColorConfig.hex,
                        }}
                        title={`Cross out suspect (Eliminate in ${activeColorConfig.name})`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>X Tool</span>
                      </button>

                      <button
                        id="tool-circle-btn"
                        onClick={() => setSelectedTool('circle')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          selectedTool === 'circle'
                            ? 'ring-2 ring-white/90 shadow-md scale-[1.02]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        }`}
                        style={{
                          backgroundColor: selectedTool === 'circle' ? activeColorConfig.hex : undefined,
                          borderColor: selectedTool === 'circle' ? activeColorConfig.hex : undefined,
                          color: selectedTool === 'circle' ? (['yellow', 'green', 'blue'].includes(selectedColor) ? '#000' : '#fff') : activeColorConfig.hex,
                        }}
                        title={`Circle suspect (Candidate/Target in ${activeColorConfig.name})`}
                      >
                        <Circle className="w-3.5 h-3.5" />
                        <span>Circle</span>
                      </button>

                      <button
                        id="tool-eraser-btn"
                        onClick={() => setSelectedTool('none')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          selectedTool === 'none'
                            ? 'bg-white text-black shadow-md ring-2 ring-neutral-300 border-white scale-[1.02]'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                        }`}
                        title="Eraser (Clear markings)"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Eraser</span>
                      </button>
                    </div>

                    {/* 6 Bright Colors Picker */}
                    <div id="ledger-color-picker" className="flex items-center gap-1.5 border-l border-neutral-800 pl-2">
                      <span className="text-[10px] font-mono uppercase font-black text-neutral-400 flex items-center gap-1 hidden xs:flex">
                        <Palette className="w-3 h-3" style={{ color: activeColorConfig.hex }} />
                        <span>COLOR:</span>
                      </span>

                      <div className="flex items-center gap-1 p-0.5 bg-black/60 border border-neutral-800 rounded-xl">
                        {BRIGHT_MARKING_COLORS.map((c) => {
                          const isSelected = selectedColor === c.id;
                          const isLight = ['yellow', 'green', 'blue'].includes(c.id);
                          return (
                            <button
                              key={c.id}
                              id={`color-picker-btn-${c.id}`}
                              type="button"
                              onClick={() => handleSelectColor(c.id)}
                              className={`relative group flex items-center justify-center transition-all duration-150 rounded-full cursor-pointer touch-manipulation ${
                                isSelected
                                  ? 'w-5 h-5 sm:w-6 sm:h-6 ring-2 ring-white scale-110 shadow-lg'
                                  : 'w-4 h-4 sm:w-5 sm:h-5 opacity-75 hover:opacity-100 hover:scale-105'
                              }`}
                              style={{
                                backgroundColor: c.hex,
                                boxShadow: isSelected ? `0 0 10px ${c.hex}` : undefined,
                              }}
                              title={`Bright ${c.name}`}
                              aria-label={`Select ${c.name} color`}
                            >
                              {isSelected && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: isLight ? '#000' : '#fff' }}
                                />
                              )}
                              <span className="sr-only">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      <span
                        className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border border-white/20 hidden sm:inline-block"
                        style={{
                          backgroundColor: activeColorConfig.hex,
                          color: ['yellow', 'green', 'blue'].includes(selectedColor) ? '#000' : '#fff',
                        }}
                      >
                        {activeColorConfig.name}
                      </span>
                    </div>
                  </div>

                  {/* Counters & Minimize Icon */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-black uppercase">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-red-500">
                        ✕ {crossedTotal}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-400">
                        ○ {circledTotal}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                        {remainingSurviving} LEFT
                      </span>
                    </div>

                    <button
                      id="btn-ledger-tool-close-icon"
                      type="button"
                      onClick={() => setIsToolsExpanded(false)}
                      className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Collapse Tool"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tool Notice if present */}
              {toolNotice && (
                <div
                  id="tool-rule-notice"
                  className="mt-2 p-2 rounded-lg bg-red-950/95 border border-red-600 text-[10px] sm:text-xs font-mono font-bold text-red-200 flex items-center gap-2 shadow-lg animate-shake"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{toolNotice}</span>
                </div>
              )}
            </div>

            {/* 4 in a row on all screen sizes to save vertical and horizontal space */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2.5 lg:gap-3 mb-4 sm:mb-6">
              {suspectsOnCurrentPage.map((suspect) => {
                const mark = (progress.markings && progress.markings[suspect.id]) || 'none';
                const isCrossed = mark === 'cross';
                const isCircled = mark === 'circle';
                const cardColorId: MarkingColor =
                  (progress.markingColors && progress.markingColors[suspect.id]) ||
                  (isCircled ? 'yellow' : (progress.activeMarkColor || selectedColor || 'pink'));
                const cardColorConfig =
                  BRIGHT_MARKING_COLORS.find((c) => c.id === cardColorId) || BRIGHT_MARKING_COLORS[0];
                const isCardLightText = ['yellow', 'green', 'blue'].includes(cardColorId);

                return (
                  <div
                    key={suspect.id}
                    id={`suspect-card-${suspect.id}`}
                    onClick={() => handleApplyMarking(suspect)}
                    className={`relative p-1 sm:p-2.5 lg:p-3 rounded-md sm:rounded-lg border transition-all duration-150 cursor-pointer select-none group flex flex-col justify-between touch-manipulation active:scale-[0.98] min-w-0 ${
                      isCrossed
                        ? 'bg-[#0a0a0a]/90 border-neutral-800 opacity-60 hover:opacity-90'
                        : isCircled
                        ? 'bg-neutral-900 shadow-lg'
                        : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'
                    }`}
                    style={
                      isCircled
                        ? {
                            borderColor: cardColorConfig.hex,
                            boxShadow: `0 0 14px ${cardColorConfig.hex}50, inset 0 0 12px ${cardColorConfig.hex}15`,
                          }
                        : undefined
                    }
                  >
                    {/* Visual Overlays */}
                    {isCrossed && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div
                          className="w-full h-0.5 sm:h-1 rotate-6 transform"
                          style={{
                            backgroundColor: cardColorConfig.hex,
                            boxShadow: `0 0 8px ${cardColorConfig.hex}`,
                          }}
                        />
                        <span
                          className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[7px] sm:text-[9px] font-mono font-black px-1 sm:px-1.5 py-0.2 rounded shadow-md leading-tight"
                          style={{
                            backgroundColor: cardColorConfig.hex,
                            color: isCardLightText ? '#000' : '#fff',
                            boxShadow: `0 0 8px ${cardColorConfig.hex}80`,
                          }}
                        >
                          ✕ OUT
                        </span>
                      </div>
                    )}

                    {isCircled && (
                      <span
                        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[7px] sm:text-[9px] font-mono font-black px-1 sm:px-1.5 py-0.2 rounded-full shadow-md leading-tight"
                        style={{
                          backgroundColor: cardColorConfig.hex,
                          color: isCardLightText ? '#000' : '#fff',
                          boxShadow: `0 0 8px ${cardColorConfig.hex}80`,
                        }}
                      >
                        ○ TARGET
                      </span>
                    )}

                    <div className="relative z-0 min-w-0 w-full flex flex-col justify-between flex-1">
                      {/* Top Row: Coordinates & Status Badge */}
                      <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1 min-w-0">
                        <span className="text-[7px] sm:text-[8px] md:text-[9px] font-mono font-normal text-neutral-400">
                          R{suspect.row}:C{suspect.col}
                        </span>
                      </div>

                      {/* Pure Single Name - Thin, crisp, full width, no truncation */}
                      <div className="min-w-0 my-auto py-0.5">
                        <h3
                          className={`text-[9px] sm:text-[11px] md:text-xs lg:text-sm uppercase tracking-tight sm:tracking-normal whitespace-normal break-words leading-tight ${
                            isCrossed
                              ? 'line-through text-neutral-500 font-light'
                              : isCircled
                              ? 'font-bold'
                              : 'text-neutral-100 group-hover:text-red-400 font-light sm:font-normal'
                          }`}
                          style={isCircled ? { color: cardColorConfig.hex } : undefined}
                          title={suspect.name}
                        >
                          {suspect.name}
                        </h3>
                      </div>

                      {/* Role / Occupation (Exclusively on Desktop screens, removed on Mobile) */}
                      <p
                        className="hidden md:block text-[9px] lg:text-[10px] font-mono font-normal text-neutral-400 uppercase truncate mt-0.5 leading-tight"
                        title={suspect.role || 'Guest Registry Slot'}
                      >
                        {suspect.role || 'Guest Slot'}
                      </p>
                    </div>

                    {/* Quick Manual Buttons */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 pt-1 sm:mt-1.5 sm:pt-1.5 border-t border-neutral-800/80 flex items-center justify-end gap-0.5 sm:gap-1.5"
                    >
                      <button
                        onClick={() => handleApplyMarking(suspect, 'cross')}
                        className={`p-0.5 sm:p-1.5 rounded transition-colors touch-manipulation cursor-pointer border ${
                          isCrossed
                            ? 'shadow-sm'
                            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700'
                        }`}
                        style={
                          isCrossed
                            ? {
                                backgroundColor: cardColorConfig.hex,
                                borderColor: cardColorConfig.hex,
                                color: isCardLightText ? '#000' : '#fff',
                              }
                            : undefined
                        }
                        title={`Cross Out with ${activeColorConfig.name}`}
                        aria-label={`Rule out ${suspect.name}`}
                      >
                        <XCircle
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                          style={{ color: !isCrossed ? activeColorConfig.hex : undefined }}
                        />
                      </button>

                      <button
                        onClick={() => handleApplyMarking(suspect, 'circle')}
                        className={`p-0.5 sm:p-1.5 rounded transition-colors touch-manipulation cursor-pointer border ${
                          isCircled
                            ? 'shadow-sm'
                            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700'
                        }`}
                        style={
                          isCircled
                            ? {
                                backgroundColor: cardColorConfig.hex,
                                borderColor: cardColorConfig.hex,
                                color: isCardLightText ? '#000' : '#fff',
                              }
                            : undefined
                        }
                        title={`Circle with ${activeColorConfig.name}`}
                        aria-label={`Circle ${suspect.name}`}
                      >
                        <Circle
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                          style={{ color: !isCircled ? activeColorConfig.hex : undefined }}
                        />
                      </button>

                      <button
                        onClick={() => handleApplyMarking(suspect, 'none')}
                        className="p-0.5 sm:p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors touch-manipulation cursor-pointer"
                        title="Erase"
                        aria-label={`Erase markings on ${suspect.name}`}
                      >
                        <Eraser className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom of Registry Ledger: Select All / Unselect All on Current Page */}
            <div
              id="registry-ledger-bulk-selection-bar"
              className="pt-3 sm:pt-4 pb-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 font-mono"
            >
              {/* Left Side: Page Status Indicator */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs uppercase font-black text-neutral-300 tracking-wider">
                  Page {currentPage} Selection:
                </span>
                <span
                  id="page-selection-badge"
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border transition-colors ${
                    isAllSelectedOnPage
                      ? 'bg-neutral-900 border-neutral-700 text-white font-black'
                      : markedOnCurrentPageCount > 0
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {markedOnCurrentPageCount} / {totalOnCurrentPage} Selected
                </span>
              </div>

              {/* Right Side: Select All & Unselect All Action Buttons */}
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                <button
                  id="btn-select-all-current-page"
                  type="button"
                  onClick={() => handleSelectAllOnPage()}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg active:scale-95 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all border cursor-pointer shadow-md select-none touch-manipulation"
                  style={{
                    backgroundColor: activeColorConfig.hex,
                    borderColor: activeColorConfig.hex,
                    color: ['yellow', 'green', 'blue'].includes(selectedColor) ? '#000' : '#fff',
                    boxShadow: `0 0 10px ${activeColorConfig.hex}50`,
                  }}
                  title={`Select all ${totalOnCurrentPage} names on Page ${currentPage} with active tool (${selectedTool === 'circle' ? 'Circle ○' : 'Cross ✕'}) in bright ${activeColorConfig.name}`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select All ({activeColorConfig.name})</span>
                </button>

                <button
                  id="btn-unselect-all-current-page"
                  type="button"
                  disabled={markedOnCurrentPageCount === 0}
                  onClick={handleUnselectAllOnPage}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-neutral-200 hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border border-neutral-700 cursor-pointer select-none touch-manipulation"
                  title={`Unselect and clear all names on Page ${currentPage}`}
                >
                  <Eraser className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Unselect All</span>
                </button>
              </div>
            </div>

            {/* Pagination Controls Under The 60 Names */}
            <div
              id="suspect-page-number-footer"
              className="pt-3 sm:pt-5 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 font-mono"
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <span className="text-[10px] sm:text-xs uppercase font-black text-neutral-400 tracking-wider sm:tracking-widest">
                  PAGE:
                </span>
                <span
                  id="current-page-indicator"
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded bg-red-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest"
                >
                  PAGE {currentPage} OF {caseItem.totalPages} ({caseItem.namesPerPage} NAMES)
                </span>
              </div>

              {/* 10 Page Navigation Buttons */}
              <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
                <button
                  id="prev-page-btn"
                  disabled={currentPage <= 1 || searchQuery.length > 0}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 sm:p-2 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-neutral-700 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {Array.from({ length: caseItem.totalPages }, (_, i) => i + 1).map((pg) => {
                  const isCurrent = currentPage === pg && !searchQuery;
                  return (
                    <button
                      key={pg}
                      id={`page-btn-${pg}`}
                      disabled={searchQuery.length > 0}
                      onClick={() => setCurrentPage(pg)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-black transition-colors min-w-[24px] sm:min-w-[32px] ${
                        isCurrent
                          ? 'bg-white text-black'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  id="next-page-btn"
                  disabled={currentPage >= caseItem.totalPages || searchQuery.length > 0}
                  onClick={() => setCurrentPage((p) => Math.min(caseItem.totalPages, p + 1))}
                  className="p-1.5 sm:p-2 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-neutral-700 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Quick Close & Restart Ledger Footer Buttons */}
            <div className="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRestartModal(true);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md border border-amber-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
                <span>Restart Case</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSection('ledger')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white text-[10px] sm:text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer shadow-md"
              >
                <span>Close Registry Ledger</span>
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Official Warrant & Killer Accusation Section */}
      <div
        id="accusation-submission-section"
        className="bg-neutral-900 border-2 border-red-600 rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-600 animate-ping" />
          <h2 className="text-base sm:text-xl font-black font-display uppercase tracking-tight text-white">
            Official Warrant & Killer Accusation
          </h2>
        </div>
        <p className="text-[11px] sm:text-xs font-medium text-neutral-400 mb-4 sm:mb-6">
          Enter the identified killer’s exact full name and the registry ledger page number they appear on.
        </p>

        {/* 5-minute Cooldown Notice Banner if active */}
        {isCooldownActive && (
          <div
            id="cooldown-active-banner"
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-950 border border-red-600 text-xs font-mono text-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                <strong className="uppercase font-black text-white">Submission Locked:</strong> "the name did not match, try again in 5 minutes"
              </span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded border border-red-800 text-red-400 font-black text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              <span>{formatTime(cooldownRemainingSeconds)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitAccusation} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Killer's Single Name Input */}
            <div className="sm:col-span-2">
              <label
                htmlFor="killer-name-input"
                className="block text-[10px] sm:text-xs font-mono uppercase font-black tracking-wider sm:tracking-widest text-neutral-300 mb-1.5 sm:mb-2"
              >
                CULPRIT / SUSPECT NAME:
              </label>
              <input
                id="killer-name-input"
                type="text"
                required
                maxLength={64}
                disabled={isCooldownActive}
                placeholder="Enter suspect name..."
                value={suspectNameInput}
                onChange={(e) => setSuspectNameInput(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold"
              />
            </div>

            {/* Ledger Page Number Dropdown */}
            <div>
              <label
                htmlFor="killer-page-input"
                className="block text-[10px] sm:text-xs font-mono uppercase font-black tracking-wider sm:tracking-widest text-neutral-300 mb-1.5 sm:mb-2"
              >
                LEDGER PAGE NUMBER:
              </label>
              <select
                id="killer-page-input"
                disabled={isCooldownActive}
                value={pageNumberInput}
                onChange={(e) => setPageNumberInput(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold"
              >
                {Array.from({ length: caseItem.totalPages }, (_, i) => i + 1).map((pg) => (
                  <option key={pg} value={pg}>
                    Page {pg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accusation / Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-2.5 sm:pt-3 border-t border-neutral-800">
            <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-mono">
              {progress.incorrectAttempts > 0 && (
                <span className="text-red-500 uppercase tracking-wide font-bold">
                  FAILED ATTEMPTS LOGGED: {progress.incorrectAttempts}
                </span>
              )}
              <button
                id="btn-warrant-restart-case"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRestartModal(true);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold uppercase underline underline-offset-4 cursor-pointer flex items-center gap-1 transition-colors"
                title="Restart investigation from scratch"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restart Case</span>
              </button>
            </div>

            <button
              id="submit-accusation-btn"
              type="submit"
              disabled={isCooldownActive || showHeartbeatSuspense}
              className={`w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-mono font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-all duration-150 shadow-xl ${
                isCooldownActive || showHeartbeatSuspense
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/80 active:scale-98 cursor-pointer'
              }`}
            >
              {isCooldownActive
                ? `Locked (${formatTime(cooldownRemainingSeconds)})`
                : showHeartbeatSuspense
                ? 'VERIFYING WARRANT...'
                : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>



      {/* Restart Case Warning Confirmation Modal */}
      <RestartWarningModal
        isOpen={showRestartModal}
        caseTitle={caseItem.title}
        progress={progress}
        totalSuspects={caseItem.suspects.length}
        onConfirm={handleConfirmRestart}
        onClose={() => setShowRestartModal(false)}
      />

      {/* 3-Second Fast Heartbeat Suspense Jump-Scare Animation Modal */}
      <HeartbeatSuspenseModal
        isOpen={showHeartbeatSuspense}
        suspectName={suspenseWarrantData.name}
        pageNumber={suspenseWarrantData.page}
        isMatch={suspenseWarrantData.isMatch}
        onComplete={handleSuspenseComplete}
      />
    </div>
  );
};
