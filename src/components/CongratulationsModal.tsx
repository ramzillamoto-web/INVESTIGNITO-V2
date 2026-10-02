import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Clock, Lock, RotateCcw, MapPin, Calendar, Unlock, ArrowRight } from 'lucide-react';
import { CaseData, CaseProgress } from '../types';
import { formatTime } from '../utils/storage';

interface CongratulationsModalProps {
  isOpen: boolean;
  caseItem: CaseData;
  progress: CaseProgress;
  onClose: () => void;
  onGoToNextCase?: (caseId: string) => void;
  onReturnToArchive: () => void;
  onRestartCase?: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  caseItem,
  progress,
  onClose,
  onGoToNextCase,
  onReturnToArchive,
  onRestartCase,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#10b981', '#ffffff', '#f59e0b'],
        });
      } catch (e) {
        // ignore
      }

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const solveTime = progress.solveTimeSeconds ?? progress.elapsedSeconds;
  const crossedCount = Object.values(progress.markings || {}).filter((m) => m === 'cross').length;
  const killerName = caseItem.solution?.killerName || 'Marcus';
  const killerPage = caseItem.solution?.killerPage || 4;
  const gridLocation = caseItem.solution?.gridLocation || 'Page 4, Column 2, Row 12';
  const isCase2 = caseItem.id === 'case-2';
  const isCase3 = caseItem.id === 'case-3';
  const isCase4 = caseItem.id === 'case-4';

  return (
    <div
      id="congratulations-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-neutral-900 border-2 border-emerald-500 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
          <span className="text-xs font-mono font-black uppercase tracking-widest text-emerald-400 block mb-1">
            {isCase4 ? 'MASTER INVESTIGATION SOLVED • ALL CASES COMPLETE' : 'CASE CLOSED • CULPRIT APPREHENDED'}
          </span>
          <h2 className="text-3xl font-black font-display uppercase tracking-tight text-white">
            Congratulations, Detective!
          </h2>
          <p className="text-sm font-bold text-neutral-300 mt-2">
            You successfully unmasked <span className="text-emerald-400 font-black uppercase">{killerName}</span> on Page {killerPage}!
          </p>
        </div>

        {/* Case 3 Unlock Banner for Case 2 completion */}
        {isCase2 && (
          <div className="bg-gradient-to-r from-emerald-950/90 to-neutral-950 border-2 border-emerald-500/80 p-4 rounded-xl mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                <Unlock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 block">
                  NEW CASE FILE UNLOCKED
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                  Case 3: Jan Never Left the Station
                </h4>
              </div>
            </div>
            {onGoToNextCase && (
              <button
                id="modal-launch-case-3-btn"
                type="button"
                onClick={() => onGoToNextCase('case-3')}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch Case 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Case 4 Notice for Case 3 completion: Locked, coming soon */}
        {isCase3 && (
          <div className="bg-gradient-to-r from-neutral-900 via-amber-950/60 to-neutral-900 border-2 border-amber-500/80 p-4 rounded-xl mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
                  NEXT CASE • COMING SOON
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                  Case 4: The Pendulum Over Blackwood Spire
                </h4>
                <p className="text-[11px] text-neutral-300 font-medium mt-0.5">
                  Case #4 is locked and will come soon! Scotland Yard detectives are currently sealing the clocktower evidence.
                </p>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono font-black text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </div>
          </div>
        )}

        {/* Completion Metadata Badge */}
        {progress.solvedDateFormatted && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-mono text-neutral-400 bg-[#0a0a0a] py-1.5 px-3 rounded-lg border border-neutral-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed on {progress.solvedDateFormatted}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800 mb-6 text-center font-mono">
          <div>
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest block">TIME SPENT</span>
            <span className="text-base font-black text-white">{formatTime(solveTime)}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest block">RULED OUT</span>
            <span className="text-base font-black text-red-500">{crossedCount} SUSPECTS</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest block">GRID SLOT</span>
            <span className="text-xs font-black text-emerald-400 block truncate mt-0.5">
              R{caseItem.solution?.row}:C{caseItem.solution?.col} (P{caseItem.solution?.killerPage})
            </span>
          </div>
        </div>

        {/* Case Solution Brief */}
        <div className="bg-[#0a0a0a] p-4 sm:p-5 rounded-xl border border-neutral-800 mb-6 text-xs text-neutral-300 leading-relaxed font-medium space-y-2">
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-neutral-400 block mb-1">
            OFFICIAL CASE DEBRIEF & SCOTLAND YARD REPORT:
          </span>
          <p>"{caseItem.solutionBrief}"</p>
          <div className="pt-2 border-t border-neutral-800 flex items-center gap-1.5 text-neutral-400 text-[11px] font-mono">
            <MapPin className="w-3 h-3 text-red-500" />
            <span>Apprehended at: {gridLocation}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="modal-return-archive-btn"
              onClick={onReturnToArchive}
              className="w-full sm:w-1/2 py-3 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono uppercase tracking-widest font-black transition-colors border border-neutral-700"
            >
              Case Overview
            </button>
            <button
              id="modal-close-review-btn"
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-widest font-black transition-colors shadow-lg"
            >
              Review Evidence
            </button>
          </div>

          {onRestartCase && (
            <button
              id="modal-replay-case-btn"
              onClick={onRestartCase}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 text-xs font-mono uppercase tracking-wider font-black transition-all flex items-center justify-center gap-2 border border-amber-200 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
              <span>Restart & Play Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

