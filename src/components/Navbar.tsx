import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';
import { ViewMode, CaseData, CaseProgress } from '../types';
import { formatTime } from '../utils/storage';
import { InvestignitoLogo } from './InvestignitoLogo';
import { toggleFullScreen, isCurrentlyFullScreen } from '../utils/pwa';

interface NavbarProps {
  currentView: ViewMode;
  selectedCase: CaseData | null;
  caseProgress: CaseProgress | null;
  onNavigate: (view: ViewMode) => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  selectedCase,
  caseProgress,
  onNavigate,
  onOpenHelp,
}) => {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(isCurrentlyFullScreen());
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleToggleFs = async () => {
    await toggleFullScreen();
    setIsFullScreen(isCurrentlyFullScreen());
  };
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-[#0a0a0a]/95 backdrop-blur px-2.5 sm:px-6 py-2 sm:py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            onClick={() => onNavigate('how_to_play')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1 group-hover:border-neutral-600 transition-colors shadow-inner shrink-0">
              <InvestignitoLogo size={24} />
            </div>
            <div>
              <span className="font-display font-black text-sm sm:text-lg tracking-tight uppercase text-[#f5f5f5] block leading-none group-hover:text-white transition-colors">
                INVESTIGNITO
              </span>
              <span className="text-[8px] sm:text-[10px] uppercase font-mono tracking-widest text-red-500 font-bold block mt-0.5">
                WEEKLY CASE PUZZLES
              </span>
            </div>
          </div>

          {currentView === 'case_detail' && (
            <button
              onClick={() => onNavigate('how_to_play')}
              className="ml-1 sm:ml-2 flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-[10px] sm:text-xs font-mono font-bold uppercase transition-colors"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline sm:inline">All Cases</span>
            </button>
          )}
        </div>

        {/* Center: Case Title Breadcrumb */}
        {selectedCase && (
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-red-500 shrink-0">
              {selectedCase.code}
            </span>
            <span className="text-xs font-bold uppercase tracking-tight text-neutral-200 truncate max-w-[280px]">
              {selectedCase.title}
            </span>
          </div>
        )}

        {/* Right: Timer & Status & Quick Help */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {caseProgress && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Status Badge */}
              {caseProgress.status === 'in_progress' && (
                <span
                  id="nav-status-in-progress"
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest bg-red-600 text-white animate-pulse"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>
                  <span className="hidden xs:inline">IN PROGRESS</span>
                  <span className="xs:hidden">ACTIVE</span>
                </span>
              )}
              {caseProgress.status === 'solved' && (
                <span
                  id="nav-status-solved"
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest bg-emerald-600 text-white"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>
                  SOLVED
                </span>
              )}
              {caseProgress.status === 'unsolved' && (
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
                  UNSOLVED
                </span>
              )}

              {/* Live Top-Right Timer */}
              <div
                id="top-right-case-timer"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-neutral-900 border border-neutral-700 text-[#f5f5f5] font-mono text-[11px] sm:text-xs font-black shadow-inner"
                title="Investigation Stopwatch"
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                <span className="tracking-wider sm:tracking-widest">
                  {formatTime(
                    caseProgress.status === 'solved' && caseProgress.solveTimeSeconds !== null
                      ? caseProgress.solveTimeSeconds
                      : caseProgress.elapsedSeconds
                  )}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => onOpenHelp()}
            className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Field Rules</span>
            <span className="sm:hidden">Rules</span>
          </button>

          {/* Fullscreen Button - Hidden on mobile view */}
          <button
            onClick={handleToggleFs}
            className="hidden sm:flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:border-red-500 hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Mode (No Address Bar)'}
            aria-label="Full Screen Mode"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-amber-400">Exit Full</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                <span className="hidden lg:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
