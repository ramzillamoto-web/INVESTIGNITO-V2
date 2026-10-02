import React from 'react';
import { Play, CheckCircle2, Clock, FileSpreadsheet, AlertCircle, ArrowRight, ShieldAlert, Lock } from 'lucide-react';
import { CaseData, CaseProgress } from '../types';
import { formatTime, getInitialProgress } from '../utils/storage';

interface CaseListViewProps {
  cases: CaseData[];
  allProgress: Record<string, CaseProgress>;
  onSelectCase: (caseItem: CaseData) => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  cases,
  allProgress,
  onSelectCase,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Archive Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-black">
                WEEKLY ACTIVE CASES
              </span>
              <span className="text-xs text-neutral-500 font-mono font-bold">• UPDATED WEEKLY</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tighter text-white leading-tight">
              Investigation Roster
            </h1>
          </div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-lg">
            TOTAL PUZZLES: <span className="text-white font-black">{cases.length}</span> | SOLVED:{' '}
            <span className="text-emerald-400 font-black">
              {(Object.values(allProgress) as CaseProgress[]).filter((p) => p.status === 'solved').length}
            </span>
          </div>
        </div>
        <p className="text-sm sm:text-base font-medium text-neutral-400 mt-3 tracking-tight max-w-2xl">
          Select a case to inspect evidence, interview suspects, and identify the culprit. Progress and crossings are automatically saved.
        </p>
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cases.map((caseItem) => {
          const progress = allProgress[caseItem.id] || getInitialProgress(caseItem.id);

          const isInProgress = progress.status === 'in_progress';
          const isSolved = progress.status === 'solved';
          const isNotStarted = progress.status === 'unsolved';
          const hasCooldown =
            progress.cooldownUntil && progress.cooldownUntil > Date.now();

          // Count crossings and circles
          const markings = progress.markings || {};
          const crossedCount = Object.values(markings).filter((m) => m === 'cross').length;
          const circledCount = Object.values(markings).filter((m) => m === 'circle').length;

          return (
            <div
              key={caseItem.id}
              id={`case-card-${caseItem.id}`}
              onClick={() => onSelectCase(caseItem)}
              className={`group relative rounded-xl border-2 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                isInProgress
                  ? 'bg-neutral-900 border-red-600 shadow-xl shadow-red-950/60'
                  : isSolved
                  ? 'bg-neutral-900 border-emerald-600 shadow-xl'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {/* Top Accent Line */}
              <div
                className={`h-2 w-full ${
                  caseItem.id === 'case-4'
                    ? 'bg-amber-600/60'
                    : isInProgress
                    ? 'bg-red-600'
                    : isSolved
                    ? 'bg-emerald-500'
                    : 'bg-neutral-700 group-hover:bg-red-600 transition-colors'
                }`}
              />

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Status & Code Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-black uppercase tracking-widest bg-neutral-800 border border-neutral-700 text-white">
                      {caseItem.code}
                    </span>

                    {caseItem.id === 'case-4' ? (
                      <span
                        id={`status-coming-soon-${caseItem.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-black uppercase tracking-widest bg-amber-500/20 border border-amber-500/50 text-amber-400"
                      >
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        COMING SOON
                      </span>
                    ) : (
                      <>
                        {/* Requirement: IF they are doing a puzzle it must say in red - IN PROGRESS - with a timer */}
                        {isInProgress && (
                          <span
                            id={`status-in-progress-${caseItem.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-black uppercase tracking-widest bg-red-600 text-white animate-pulse"
                          >
                            <span className="w-2 h-2 rounded-full bg-white" />
                            IN PROGRESS - {formatTime(progress.elapsedSeconds)}
                          </span>
                        )}

                        {isSolved && (
                          <span
                            id={`status-solved-${caseItem.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-black uppercase tracking-widest bg-emerald-600 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            SOLVED - {formatTime(progress.solveTimeSeconds ?? progress.elapsedSeconds)}
                          </span>
                        )}

                        {isNotStarted && (
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded">
                            NOT STARTED
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-black font-display uppercase tracking-tight text-white group-hover:text-red-400 transition-colors mb-2 leading-tight">
                    {caseItem.title}
                  </h3>
                  <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-5">
                    {caseItem.tagline}
                  </p>
                </div>

                {/* Case Info / Metadata */}
                <div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3.5 border border-neutral-800 mb-5 space-y-2 text-xs font-mono font-bold">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="uppercase text-[10px] tracking-wider text-neutral-500">VICTIM:</span>
                      <span className="text-white truncate max-w-[140px]">
                        {caseItem.victim.split('(')[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="uppercase text-[10px] tracking-wider text-neutral-500">SUSPECTS:</span>
                      <span className="text-neutral-200">
                        {caseItem.suspects.length} ({caseItem.totalPages} PAGES)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="uppercase text-[10px] tracking-wider text-neutral-500">CLUES:</span>
                      <span className="text-amber-400">{caseItem.clues.length} DEDUCTIONS</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="uppercase text-[10px] tracking-wider text-neutral-500">DIFFICULTY:</span>
                      <span className="text-red-400">{caseItem.difficulty.toUpperCase()}</span>
                    </div>

                    {/* Progress tracking indicator if player made marks */}
                    {(crossedCount > 0 || circledCount > 0) && (
                      <div className="pt-2 mt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500 uppercase tracking-wider">YOUR LEDGER:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-black">✕ {crossedCount} RULED OUT</span>
                          <span className="text-amber-400 font-black">○ {circledCount} CIRCLED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5-minute cooldown warning if active */}
                  {hasCooldown && (
                    <div className="mb-3 p-2.5 rounded bg-red-950/80 border border-red-600 text-xs text-red-200 flex items-center gap-2 font-mono font-bold">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>5-MIN COOLDOWN ACTIVE</span>
                    </div>
                  )}

                  {/* Card Bottom CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs font-mono font-bold">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      {caseItem.estimatedTime}
                    </span>

                    <button
                      id={`select-case-${caseItem.id}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
                        caseItem.id === 'case-4'
                          ? 'bg-neutral-800 text-amber-400 border border-amber-600/50 hover:bg-neutral-700'
                          : isInProgress
                          ? 'bg-red-600 text-white hover:bg-red-500 shadow-md'
                          : isSolved
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-white text-black hover:bg-neutral-200 group-hover:bg-red-600 group-hover:text-white'
                      }`}
                    >
                      {caseItem.id === 'case-4' ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Coming Soon</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {isInProgress ? 'Resume Case' : isSolved ? 'Review Solved' : 'Open Case'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
