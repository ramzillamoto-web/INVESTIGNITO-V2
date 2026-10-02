import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Fingerprint,
  Users,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  Camera,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { CaseData, CaseProgress } from '../types';
import { InvestignitoLogo } from './InvestignitoLogo';

interface LandingViewProps {
  cases: CaseData[];
  allProgress: Record<string, CaseProgress>;
  onSelectCase: (caseItem: CaseData) => void;
  unlockedCaseBanner?: string | null;
  onDismissUnlockBanner?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  cases,
  allProgress,
  onSelectCase,
  unlockedCaseBanner,
  onDismissUnlockBanner,
}) => {
  // Map of caseId -> boolean to track expanded "See Details" independently for each case
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [lockedModalCase, setLockedModalCase] = useState<CaseData | null>(null);

  const toggleDetails = (caseId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const isCase2Solved = allProgress['case-2']?.status === 'solved';

  return (
    <div
      id="landing-page-container"
      className="w-full min-h-[calc(100vh-61px)] flex flex-col justify-between bg-[#0e0e11] text-[#f5f5f5]"
    >
      {/* Red Top Accent Stripe */}
      <div className="w-full h-1.5 bg-red-600 shadow-sm shadow-red-600/50" />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center space-y-8 sm:space-y-12">
        
        {/* Case Just Unlocked Banner Notification */}
        {unlockedCaseBanner && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-neutral-900 border-2 border-emerald-500/80 p-4 sm:p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in relative">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <Unlock className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-emerald-400 block">
                  NEW CLASSIFIED DOSSIER ACCESSIBLE
                </span>
                <h3 className="text-base sm:text-lg font-black text-white font-display uppercase tracking-tight">
                  {unlockedCaseBanner === 'case-4'
                    ? 'Case 4: The Pendulum Over Blackwood Spire is now Unlocked!'
                    : 'Case 3: Jan Never Left the Station is now Unlocked!'}
                </h3>
                <p className="text-xs text-neutral-300 font-medium">
                  {unlockedCaseBanner === 'case-4'
                    ? 'Your Level 4 clearance is granted. You can now investigate the Blackwood Spire clocktower sabotage.'
                    : 'Your clearance has been updated. You can now investigate the Hollow Wick 11:40 Night Express murder.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  const targetCase = cases.find((c) => c.id === unlockedCaseBanner) || cases.find((c) => c.id === 'case-3');
                  if (targetCase) onSelectCase(targetCase);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Solve {unlockedCaseBanner === 'case-4' ? 'Case 4' : 'Case 3'} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {onDismissUnlockBanner && (
                <button
                  type="button"
                  onClick={onDismissUnlockBanner}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Bureau Header */}
        <div className="text-center mb-2 flex flex-col items-center">
          <div className="mb-3 sm:mb-5 flex flex-col items-center group cursor-default">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center p-2.5 sm:p-3 shadow-2xl mb-2 sm:mb-3 group-hover:border-neutral-700 transition-colors">
              <InvestignitoLogo size={52} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded bg-neutral-900 border border-neutral-700 text-red-500 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider sm:tracking-widest">
              <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              <span>INVESTIGNITO • WEEKLY CASE PUZZLES</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-[#f5f5f5] font-display uppercase max-w-4xl mx-auto leading-tight sm:leading-none mb-3 sm:mb-4">
            INSPECT THE CLUES.<br />
            <span className="text-red-600">NAME THE KILLER.</span>
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-base font-medium text-neutral-300 max-w-2xl mx-auto tracking-tight leading-relaxed px-2">
            Step into weekly unsolved master investigations. Inspect sequential clues, cross out innocent suspects across the registry pages, and isolate the perpetrator.
          </p>
        </div>

        {/* Case Cards List */}
        <div className="space-y-12">
          {cases.map((caseItem) => {
            const progress = allProgress[caseItem.id] || { status: 'unsolved' };
            const showDetails = !!expandedDetails[caseItem.id];
            const isCase2 = caseItem.id === 'case-2';
            const isCase3 = caseItem.id === 'case-3';
            const isCase4 = caseItem.id === 'case-4';
            const isCase3Solved = allProgress['case-3']?.status === 'solved';
            // Case 4 is locked even if Case 3 is solved; players are told it will come soon
            const isLocked = (isCase3 && !isCase2Solved) || isCase4;
            const sceneImage = caseItem.imageUrl || (isCase2 ? '/images/case-2-scene.jpg' : isCase3 ? '/images/case-3-scene.jpg' : '/images/case-1-scene.jpg');

            return (
              <div
                key={caseItem.id}
                id={`featured-case-card-${caseItem.id}`}
                className={`relative bg-[#17171a] border-y-4 sm:border-2 sm:border-y-4 rounded-none sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 ${
                  isLocked
                    ? 'border-neutral-800 opacity-90 hover:border-neutral-700'
                    : 'border-red-600 sm:border-neutral-800 sm:border-y-red-600 hover:border-neutral-700'
                }`}
              >
                <div className="p-4 sm:p-6 lg:p-7">
                  {/* Strict Horizontal Flex Row Container on Desktop */}
                  <div className="flex flex-col md:flex-row md:items-stretch gap-5 lg:gap-7">
                    
                    {/* Left Column: Fixed 300px container holding square crime scene image on far left */}
                    <div className="w-full md:w-[300px] shrink-0 flex flex-col justify-start">
                      <div className="relative w-full aspect-square rounded-xl bg-neutral-950 p-2 border-2 border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between group">
                        
                        {/* Atmospheric Glow */}
                        <div
                          className={`absolute -inset-1 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none ${
                            isCase2
                              ? 'bg-gradient-to-tr from-amber-600/30 to-red-600/30'
                              : isCase3
                              ? isLocked
                                ? 'bg-gradient-to-tr from-neutral-700/20 to-neutral-900/40'
                                : 'bg-gradient-to-tr from-emerald-600/30 to-red-600/30'
                              : isCase4
                              ? 'bg-gradient-to-tr from-amber-600/20 to-neutral-900/40'
                              : 'bg-gradient-to-tr from-red-600/40 to-red-900/40'
                          }`}
                        />

                        {/* Top Crime Scene Header Overlay */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-neutral-800 text-[10px] font-mono font-black uppercase text-neutral-200">
                            {isCase4 ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                                <span>COMING SOON • {caseItem.code.toUpperCase()}</span>
                              </>
                            ) : isLocked ? (
                              <>
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span>RESTRICTED • {caseItem.code.toUpperCase()}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                                <Camera className="w-3 h-3 text-red-500" />
                                <span>CRIME SCENE • {caseItem.code.toUpperCase()}</span>
                              </>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-neutral-800 text-[9px] font-mono text-neutral-400">
                            {isCase4 ? 'COMING SOON' : isLocked ? 'CLASSIFIED' : 'FORENSIC PHOTO'}
                          </span>
                        </div>

                        {/* Forensic Corner Target Brackets */}
                        <div className={`absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 ${isLocked ? 'border-amber-600' : 'border-red-500'} z-20 pointer-events-none`} />
                        <div className={`absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 ${isLocked ? 'border-amber-600' : 'border-red-500'} z-20 pointer-events-none`} />
                        <div className={`absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 ${isLocked ? 'border-amber-600' : 'border-red-500'} z-20 pointer-events-none`} />
                        <div className={`absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 ${isLocked ? 'border-amber-600' : 'border-red-500'} z-20 pointer-events-none`} />

                        {/* Square Image Container with full object-cover filling frame */}
                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                          <img
                            src={sceneImage}
                            alt={`${caseItem.title} Crime Scene`}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                              isLocked ? 'filter grayscale contrast-125 brightness-75' : ''
                            }`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                          {/* Lock Overlay on Image */}
                          {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] text-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-neutral-900/90 border border-amber-500/60 flex items-center justify-center text-amber-400 mb-2 shadow-lg">
                                {isCase4 ? <Clock className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
                              </div>
                              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300 bg-black/80 px-2.5 py-1 rounded border border-neutral-800">
                                {isCase4 ? 'COMING SOON!' : 'COMPLETE CASE 2'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Scene Bar Overlay */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-auto">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-300">
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span className="font-bold truncate max-w-[150px] sm:max-w-[180px]">
                              {caseItem.scene}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded bg-black/85 text-neutral-400 border border-neutral-800 text-[9px] font-mono">
                            {caseItem.timeOfCrime?.split('(')[0]?.trim() || 'Night'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: flex-grow: 1 content area adjacent to image */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Top Header Metadata Tags Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-2.5">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                              {caseItem.code.toUpperCase()} CASE FILE
                            </span>
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-bold text-neutral-300 bg-neutral-900 border border-neutral-800">
                              {caseItem.totalPages} PAGES • {caseItem.suspects.length} NAMES
                            </span>
                            {isLocked ? (
                              <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-amber-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-amber-950/80 border border-amber-800/80 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-400" />
                                {isCase4 ? 'LOCKED (COMING SOON)' : 'LOCKED (SOLVE CASE 2)'}
                              </span>
                            ) : progress.status === 'unsolved' ? (
                              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-neutral-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-neutral-900 border border-neutral-800">
                                (UNSOLVED)
                              </span>
                            ) : progress.status === 'in_progress' ? (
                              <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-red-600 animate-pulse">
                                (IN PROGRESS)
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-emerald-600">
                                (SOLVED)
                              </span>
                            )}
                          </div>

                          {caseItem.id === 'case-1' && (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold text-neutral-300">
                              <span className="flex items-center gap-1 sm:gap-1.5 bg-neutral-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-neutral-800">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                                {caseItem.estimatedTime}
                              </span>
                              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-neutral-950 text-neutral-200 border border-neutral-800">
                                {caseItem.difficulty.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white font-display uppercase tracking-tight mb-1 sm:mb-1.5 leading-tight">
                          {caseItem.title}
                        </h2>

                        {/* Tagline + See Details button on same horizontal row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <p className="text-[11px] sm:text-sm font-bold text-red-500 uppercase tracking-wider sm:tracking-widest">
                            {caseItem.tagline}
                          </p>
                          <button
                            id={`btn-landing-see-details-${caseItem.id}`}
                            type="button"
                            onClick={() => toggleDetails(caseItem.id)}
                            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer select-none touch-manipulation active:scale-[0.98] ${
                              showDetails
                                ? 'bg-neutral-800 border-red-500 text-red-400 shadow-md ring-1 ring-red-500/50'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-600'
                            }`}
                          >
                            <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                            <span>{showDetails ? 'Hide Details' : 'See Details'}</span>
                            {showDetails ? (
                              <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            ) : (
                              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Expandable Case Description & Briefing */}
                        {showDetails && (
                          <div
                            id={`featured-case-description-panel-${caseItem.id}`}
                            className="text-xs sm:text-sm text-neutral-200 leading-relaxed mb-3 sm:mb-4 bg-[#0a0a0a] p-3 sm:p-5 rounded-xl border border-neutral-800 animate-fade-in"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-400 block">
                                OFFICIAL BRIEFING & ATMOSPHERE:
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleDetails(caseItem.id)}
                                className="text-[10px] font-mono font-bold uppercase text-neutral-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>Close</span>
                                <ChevronUp className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="font-medium text-neutral-300 leading-relaxed text-xs sm:text-sm">
                              "{caseItem.briefing}"
                            </p>
                          </div>
                        )}

                        {/* Structured Metadata Info Boxes (3 Columns) */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-xs font-mono text-neutral-300 mb-3 sm:mb-4">
                          <div className="p-2 sm:p-3 rounded-lg bg-[#0e0e11] border border-neutral-800">
                            <span className="text-neutral-500 block uppercase font-bold text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest">
                              VICTIM
                            </span>
                            <span className="text-white font-black text-[11px] sm:text-sm truncate block mt-0.5">
                              {caseItem.victim}
                            </span>
                          </div>
                          <div className="p-2 sm:p-3 rounded-lg bg-[#0e0e11] border border-neutral-800">
                            <span className="text-neutral-500 block uppercase font-bold text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest">
                              CRIME SCENE
                            </span>
                            <span className="text-white font-black text-[11px] sm:text-sm truncate block mt-0.5">
                              {caseItem.scene}
                            </span>
                          </div>
                          <div className="p-2 sm:p-3 rounded-lg bg-[#0e0e11] border border-neutral-800">
                            <span className="text-neutral-500 block uppercase font-bold text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest">
                              LEDGER
                            </span>
                            <span className="text-white font-black text-[11px] sm:text-sm truncate block mt-0.5">
                              {caseItem.suspects.length} Names
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Guest & Clue Count Info Left + Bottom Right CTA Button */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-2.5 sm:pt-3 border-t border-neutral-800/80">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase font-bold text-neutral-400">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                          <span>
                            {caseItem.suspects.length} {isCase3 ? 'PASSENGERS' : isCase4 ? 'GUILD MEMBERS' : 'GUESTS'} • {caseItem.clues.length} CLUES • {caseItem.totalPages} PAGES
                          </span>
                        </div>

                        {isLocked ? (
                          <button
                            id={`landing-solve-the-case-btn-${caseItem.id}`}
                            type="button"
                            onClick={() => setLockedModalCase(caseItem)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer border border-amber-600/50 hover:border-amber-500 shadow-md touch-manipulation shrink-0"
                          >
                            {isCase4 ? <Clock className="w-4 h-4 text-amber-400 animate-pulse" /> : <Lock className="w-4 h-4 text-amber-400" />}
                            <span>{isCase4 ? 'Locked • Case #4 Coming Soon' : 'Locked • Solve Case 2 First'}</span>
                          </button>
                        ) : (
                          <button
                            id={`landing-solve-the-case-btn-${caseItem.id}`}
                            type="button"
                            onClick={() => onSelectCase(caseItem)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 bg-red-600 hover:bg-red-500 text-white font-black px-6 sm:px-10 py-2.5 sm:py-3 rounded-xl text-xs sm:text-base font-mono uppercase tracking-wider sm:tracking-widest transition-all duration-200 cursor-pointer shadow-lg shadow-red-950/50 border border-red-400 hover:scale-[1.02] active:scale-[0.98] touch-manipulation shrink-0"
                          >
                            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            <span>Solve {caseItem.code}</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Locked Case Modal Alert */}
      {lockedModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-neutral-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-600 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-xl">
              {lockedModalCase.id === 'case-4' ? <Clock className="w-7 h-7 animate-pulse" /> : <Lock className="w-7 h-7" />}
            </div>
            <div className="text-center space-y-2 mb-6">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
                {lockedModalCase.id === 'case-4' ? 'CLASSIFIED DOSSIER • COMING SOON' : 'CLASSIFIED DOSSIER RESTRICTED'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white">
                {lockedModalCase.id === 'case-4' ? 'Case #4 Coming Soon' : `${lockedModalCase.title} is Locked`}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                {lockedModalCase.id === 'case-4' ? (
                  <>
                    <strong>Case #4: The Pendulum Over Blackwood Spire</strong> will come soon! Even if you have finished Case 3, our Scotland Yard archives and the Clockmakers Guild dossiers are currently undergoing evidence sealing. It will arrive in the upcoming case release!
                  </>
                ) : (
                  <>
                    To access the 11:40 Hollow Wick train seating ledger and investigate Vaughan’s murder in Case 3, you must first apprehend the culprit in <strong>Case 2: The Solstice Masquerade</strong>.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setLockedModalCase(null)}
                className={`py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-700 cursor-pointer ${lockedModalCase.id === 'case-4' && allProgress['case-3']?.status === 'solved' ? 'w-full' : 'w-full sm:w-1/2'}`}
              >
                {lockedModalCase.id === 'case-4' && allProgress['case-3']?.status === 'solved' ? 'Understood' : 'Close'}
              </button>
              {!(lockedModalCase.id === 'case-4' && allProgress['case-3']?.status === 'solved') && (
                <button
                  type="button"
                  onClick={() => {
                    const targetCaseId = lockedModalCase.id === 'case-4' ? 'case-3' : 'case-2';
                    setLockedModalCase(null);
                    const targetCase = cases.find((c) => c.id === targetCaseId) || cases[0];
                    if (targetCase) onSelectCase(targetCase);
                  }}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{lockedModalCase.id === 'case-4' ? 'Play Case 3' : 'Play Case 2'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Red Bottom Accent Stripe */}
      <div className="w-full h-1.5 bg-red-600 shadow-sm shadow-red-600/50" />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#060608] py-6 px-4 text-center font-mono text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <InvestignitoLogo size={18} />
            <span className="font-bold text-neutral-400">INVESTIGNITO - Weekly Case Puzzles</span>
          </div>
          <span>Confidential Detective Case Records • All Rights Reserved</span>
        </div>
      </footer>
    </div>
  );
};

