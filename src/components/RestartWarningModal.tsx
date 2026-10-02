import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, RotateCcw, X, Eraser, Clock, FileText, ShieldAlert } from 'lucide-react';
import { CaseProgress } from '../types';
import { formatTime } from '../utils/storage';

interface RestartWarningModalProps {
  isOpen: boolean;
  caseTitle: string;
  progress: CaseProgress;
  totalSuspects: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const RestartWarningModal: React.FC<RestartWarningModalProps> = ({
  isOpen,
  caseTitle,
  progress,
  totalSuspects,
  onConfirm,
  onClose,
}) => {
  // Listen for Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markedCount = Object.keys(progress?.markings || {}).length;
  const elapsed =
    progress?.status === 'solved' && progress?.solveTimeSeconds !== null
      ? progress?.solveTimeSeconds || 0
      : progress?.elapsedSeconds || 0;

  return createPortal(
    <div
      id="restart-case-warning-modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="restart-modal-title"
    >
      <div
        className="bg-[#101012] border-2 border-red-600/80 rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative text-neutral-100 overflow-hidden ring-1 ring-red-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Crimson Warning Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-700 via-red-500 to-amber-500" />

        {/* Close 'X' button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-800"
          aria-label="Cancel and close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-400 flex items-center justify-center mb-3 shadow-lg shadow-red-950/60 ring-2 ring-red-500/20 animate-pulse">
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/80 mb-2">
            IRREVERSIBLE CASE RESTART
          </span>

          <h2
            id="restart-modal-title"
            className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white"
          >
            Restart Investigation?
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
            Case: <strong className="text-white">{caseTitle}</strong>
          </p>
        </div>

        {/* Warning Summary Notice */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 sm:p-4 mb-5 text-xs text-neutral-300 space-y-2.5">
          <p className="text-neutral-200 font-semibold text-xs sm:text-sm">
            Restarting will reset this entire case to its initial state from the beginning:
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-2.5 text-neutral-300">
              <Eraser className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Clear All Ledger Markings:</strong> Every crossed (✕) and circled (◯) suspect will be wiped clean across all registry pages.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-neutral-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Reset Stopwatch to 00:00:</strong> The elapsed investigation timer will reset back to zero.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-neutral-300">
              <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Erase Detective Notes:</strong> All custom scribbles and notes in the case notepad will be erased.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-neutral-300">
              <ShieldAlert className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Status Returned to Unsolved:</strong> The case status will be reset back to unsolved with a fresh start.
              </span>
            </div>
          </div>

          {(markedCount > 0 || elapsed > 0) && (
            <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/40 px-3 py-2 rounded-lg">
              <span>Current Progress:</span>
              <span className="text-amber-400 font-bold">
                {markedCount} markings • Time: {formatTime(elapsed)}
              </span>
            </div>
          )}
        </div>

        {/* Confirmation Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3">
          <button
            id="cancel-restart-btn"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-full sm:w-1/2 py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs sm:text-sm font-mono uppercase tracking-wider font-bold transition-all border border-neutral-700 cursor-pointer active:scale-98 text-center"
          >
            Keep Progress
          </button>

          <button
            id="confirm-restart-btn"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-1/2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-400 text-white text-xs sm:text-sm font-mono uppercase tracking-wider font-black transition-all shadow-lg shadow-red-950/80 ring-1 ring-red-400 flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yes, Restart Case</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
