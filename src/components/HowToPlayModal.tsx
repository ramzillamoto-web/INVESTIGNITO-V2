import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { InvestignitoLogo } from './InvestignitoLogo';

export interface HowToPlayStep {
  id: number;
  badge: string;
  title: string;
  instruction: string;
  mediaUrl: string;
  altText: string;
  accent: 'red' | 'amber' | 'blue' | 'emerald';
  icon: React.ReactNode;
}

export const HOW_TO_PLAY_STEPS: HowToPlayStep[] = [
  {
    id: 1,
    badge: 'STAGE 1 • CLUE DOSSIER',
    title: 'Inspect The Sequential Clues',
    instruction:
      'Carefully inspect each forensic clue in order. Clues establish letter counts, vowel rules, seating coordinates, and forensic traits to eliminate innocent suspects one by one.',
    mediaUrl: '/assets/step1.gif',
    altText: 'Step 1: Read sequential deduction clues',
    accent: 'red',
    icon: <Search className="w-4 h-4 text-red-400" />,
  },
  {
    id: 2,
    badge: 'STAGE 2 • FORENSIC LEDGER',
    title: 'Cross Out Innocents & Mark Suspects',
    instruction:
      'Use the ✕ X Tool to strike out eliminated innocents, the ○ Circle Tool to ring primary persons of interest, and the ⌫ Eraser to correct any markings in the ledger.',
    mediaUrl: '/assets/step2.gif',
    altText: 'Step 2: Use interactive ledger tools (Cross, Circle, Eraser)',
    accent: 'amber',
    icon: <FileText className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 3,
    badge: 'STAGE 3 • CASE ARCHIVE',
    title: 'Navigate All 10 Ledger Pages',
    instruction:
      'Flip through ledger Pages 1–10 to inspect all 100 suspect profiles. Cross-reference row-column coordinates and verify each alibi before making your final determination.',
    mediaUrl: '/assets/step3.gif',
    altText: 'Step 3: Browse across 10 dossier ledger pages',
    accent: 'blue',
    icon: <Shield className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 4,
    badge: 'STAGE 4 • ARREST WARRANT',
    title: 'Issue Warrant & Solve The Mystery',
    instruction:
      'Once the perpetrator is isolated, file the Arrest Warrant with their Full Name and exact Page Number. Beware: incorrect accusations trigger a strict 5-minute penalty lockout!',
    mediaUrl: '/assets/step4.gif',
    altText: 'Step 4: File the arrest warrant with killer name and page',
    accent: 'emerald',
    icon: <AlertTriangle className="w-4 h-4 text-emerald-400" />,
  },
];

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const totalSteps = HOW_TO_PLAY_STEPS.length;
  const currentStep = HOW_TO_PLAY_STEPS[currentStepIndex];

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, [totalSteps]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    },
    [isOpen, onClose, handleNext, handlePrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Accent color utilities for badges and highlights
  const accentColors = {
    red: {
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
      bar: 'bg-red-500',
      ring: 'focus:ring-red-500/40',
      activeDot: 'bg-red-500 w-7',
    },
    amber: {
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      bar: 'bg-amber-500',
      ring: 'focus:ring-amber-500/40',
      activeDot: 'bg-amber-500 w-7',
    },
    blue: {
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      bar: 'bg-blue-500',
      ring: 'focus:ring-blue-500/40',
      activeDot: 'bg-blue-500 w-7',
    },
    emerald: {
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      bar: 'bg-emerald-500',
      ring: 'focus:ring-emerald-500/40',
      activeDot: 'bg-emerald-500 w-7',
    },
  }[currentStep.accent];

  return (
    <div
      id="how-to-play-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby="how-to-play-title"
    >
      {/* Modal Card Container */}
      <div
        id="how-to-play-modal-card"
        className="bg-[#0e0e12] border border-neutral-800/90 rounded-2xl max-w-xl w-full shadow-2xl shadow-black/80 relative flex flex-col overflow-hidden max-h-[92vh] animate-modal-in"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-[#09090c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black border border-neutral-800 flex items-center justify-center p-1.5 shadow-sm">
              <InvestignitoLogo size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="how-to-play-title"
                  className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display"
                >
                  How To Play
                </h2>
                <span className="hidden sm:inline-block text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-red-950/60 border border-red-800/50 text-red-400 uppercase">
                  Field Briefing
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                Bureau Investigator Protocol
              </p>
            </div>
          </div>

          {/* Close (X) button */}
          <button
            id="how-to-play-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Step Carousel */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Step Category & Counter */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${accentColors.badgeBg}`}
            >
              {currentStep.icon}
              <span>{currentStep.badge}</span>
            </span>

            <div className="text-right">
              <span className="text-[11px] font-mono font-bold text-neutral-400">
                Step <span className="text-white font-extrabold">{currentStepIndex + 1}</span> of{' '}
                {totalSteps}
              </span>
            </div>
          </div>

          {/* Media Illustration / GIF Container with Fallback */}
          <div className="relative w-full h-44 sm:h-52 rounded-xl bg-[#070709] border border-neutral-800 overflow-hidden flex items-center justify-center group shadow-inner">
            {/* Subtle background grid pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#383842 1px, transparent 1px), radial-gradient(#383842 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            />

            {!imageError[currentStep.id] ? (
              <img
                src={currentStep.mediaUrl}
                alt={currentStep.altText}
                onError={() => {
                  setImageError((prev) => ({ ...prev, [currentStep.id]: true }));
                }}
                className="w-full h-full object-contain p-2 select-none"
                loading="eager"
              />
            ) : (
              /* High-fidelity thematic fallback illustration if gif is not found */
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 flex items-center justify-center text-white shadow-lg">
                  {currentStep.id === 1 && <Search className="w-7 h-7 text-red-500" />}
                  {currentStep.id === 2 && <FileText className="w-7 h-7 text-amber-400" />}
                  {currentStep.id === 3 && <Shield className="w-7 h-7 text-blue-400" />}
                  {currentStep.id === 4 && <AlertTriangle className="w-7 h-7 text-emerald-400" />}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300 block">
                    {currentStep.title}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wide">
                    File: {currentStep.mediaUrl}
                  </span>
                </div>
              </div>
            )}

            {/* Step navigation overlay arrows for quick browsing */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer ${
                isFirstStep ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'opacity-85 hover:scale-105'
              }`}
              aria-label="Previous step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isLastStep}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer ${
                isLastStep ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'opacity-85 hover:scale-105'
              }`}
              aria-label="Next step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Step Title & Instruction Text */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{currentStep.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              {currentStep.instruction}
            </p>
          </div>

          {/* Carousel Pagination Controls: Dots & Navigation Arrows */}
          <div className="flex items-center justify-between pt-2">
            {/* Previous Step Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                isFirstStep
                  ? 'text-neutral-600 cursor-not-allowed'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Step carousel indicators">
              {HOW_TO_PLAY_STEPS.map((step, index) => {
                const isActive = index === currentStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(index)}
                    aria-label={`Go to step ${index + 1}: ${step.title}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `${accentColors.activeDot}`
                        : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Step Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={isLastStep}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                isLastStep
                  ? 'text-neutral-600 cursor-not-allowed'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Actions: Primary "Start Investigation" CTA */}
        <div className="p-5 border-t border-neutral-800/80 bg-[#09090c] flex flex-col sm:flex-row items-center gap-3">
          <button
            id="start-investigation-btn"
            type="button"
            onClick={onClose}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold uppercase text-xs font-mono tracking-widest transition-all shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer border border-red-500/30 active:scale-[0.98]"
          >
            <span>Start Investigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
