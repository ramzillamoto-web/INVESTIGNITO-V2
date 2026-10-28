import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { CASE_1_DATA, CASES_DATA } from './data/cases';
import { ViewMode, CaseData, CaseProgress } from './types';
import {
  loadAllProgress,
  saveAllProgress,
  getInitialProgress,
  loadSession,
  saveSession,
  hasSeenHowTo,
  markSeenHowTo,
  onProgressSaved,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { CaseDetailView } from './components/CaseDetailView';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CongratulationsModal } from './components/CongratulationsModal';
import { CooldownModal } from './components/CooldownModal';
import { DarkMistBackground } from './components/DarkMistBackground';
import { ManageSubscriptionModal } from './components/ManageSubscriptionModal';
import { AddToDeviceModal } from './components/AddToDeviceModal';
import { useAddToDevice } from './hooks/useAddToDevice';

export default function App() {
  // Add to Device state and prompt handling
  const {
    deferredPrompt,
    isStandalone,
    isModalOpen: showAddToDeviceModal,
    triggerAddToDevice,
    closeModal: handleCloseAddToDeviceModal,
  } = useAddToDevice();

  // Restore where player left off, falling back to defaults
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const session = loadSession();
    return session ? session.view : 'how_to_play';
  });
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    const session = loadSession();
    return session ? session.selectedCaseId : 'case-1';
  });

  const [allProgress, setAllProgress] = useState<Record<string, CaseProgress>>(() => {
    return loadAllProgress();
  });

  // Save session when view or selected case changes
  useEffect(() => {
    saveSession({ view: currentView, selectedCaseId });
  }, [currentView, selectedCaseId]);

  // Show "How to Play" modal only on first visit
  const [showHelpModal, setShowHelpModal] = useState<boolean>(() => {
    return !hasSeenHowTo();
  });
  const [showCongratulationsModal, setShowCongratulationsModal] = useState<boolean>(false);
  const [showCooldownModal, setShowCooldownModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [unlockedCaseBanner, setUnlockedCaseBanner] = useState<string | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    saveAllProgress(allProgress);
  }, [allProgress]);

  // Save immediately when page is hidden or closed (visibilitychange and pagehide)
  const allProgressRef = useRef(allProgress);
  allProgressRef.current = allProgress;

  useEffect(() => {
    const handleSaveImmediately = () => {
      saveAllProgress(allProgressRef.current, true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSaveImmediately();
      }
    };

    window.addEventListener('pagehide', handleSaveImmediately);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handleSaveImmediately);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Brief "Progress saved" indicator on saves
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = onProgressSaved(() => {
      setShowSavedIndicator(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setShowSavedIndicator(false);
      }, 1800);
    });
    return () => {
      unsubscribe();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const handleCloseHelpModal = () => {
    setShowHelpModal(false);
    markSeenHowTo();
  };

  const selectedCase = CASES_DATA.find((c) => c.id === selectedCaseId) || CASE_1_DATA;
  const currentCaseProgress = allProgress[selectedCase.id] || getInitialProgress(selectedCase.id);

  const handleUpdateCaseProgress = (updater: (prev: CaseProgress) => CaseProgress) => {
    setAllProgress((prevAll) => {
      const current = prevAll[selectedCase.id] || getInitialProgress(selectedCase.id);
      const updated = updater(current);
      return {
        ...prevAll,
        [selectedCase.id]: updated,
      };
    });
  };

  const handleResetCase = () => {
    const fresh = getInitialProgress(selectedCase.id);
    setAllProgress((prevAll) => ({
      ...prevAll,
      [selectedCase.id]: fresh,
    }));
    setShowCongratulationsModal(false);
    setShowCooldownModal(false);
  };

  const handleSolveCase = () => {
    setShowCongratulationsModal(true);
    if (selectedCase.id === 'case-2') {
      setUnlockedCaseBanner('case-3');
    }
    // Case 4 is locked even if Case 3 is solved; players are informed it will come soon
  };

  const handleFailedSubmission = () => {
    setShowCooldownModal(true);
  };

  const isCase3Locked = selectedCase.id === 'case-3' && allProgress['case-2']?.status !== 'solved';
  // Case #4 is locked even if Case #3 is finished; players are told it will come soon
  const isCase4Locked = selectedCase.id === 'case-4';
  const isCurrentCaseLocked = isCase3Locked || isCase4Locked;

  const handleOpenSubscription = () => {
    window.open('https://account.trycorex.store/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#f5f5f5] flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Creepy Drifting Dark Mist & Blizzard Background */}
      <DarkMistBackground />

      {/* Global Header */}
      <Navbar
        currentView={currentView}
        selectedCase={selectedCase}
        caseProgress={currentCaseProgress}
        onNavigate={(view) => setCurrentView(view)}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenSubscription={handleOpenSubscription}
        onAddToDevice={triggerAddToDevice}
        isStandalone={isStandalone}
      />

      {/* Main Content View */}
      <main className="flex-1 w-full relative z-10">
        {currentView === 'how_to_play' && (
          <LandingView
            cases={CASES_DATA}
            allProgress={allProgress}
            unlockedCaseBanner={unlockedCaseBanner}
            onDismissUnlockBanner={() => setUnlockedCaseBanner(null)}
            onSelectCase={(caseItem) => {
              setSelectedCaseId(caseItem.id);
              setCurrentView('case_detail');
            }}
            onOpenSubscription={handleOpenSubscription}
            onAddToDevice={triggerAddToDevice}
            isStandalone={isStandalone}
          />
        )}

        {currentView === 'case_detail' && (
          <CaseDetailView
            caseItem={selectedCase}
            progress={currentCaseProgress}
            isLocked={isCurrentCaseLocked}
            onUpdateProgress={handleUpdateCaseProgress}
            onSolveCase={handleSolveCase}
            onFailedSubmission={handleFailedSubmission}
            onOpenHelp={() => setShowHelpModal(true)}
            onResetCase={handleResetCase}
            onSwitchToCase={(caseId) => {
              setSelectedCaseId(caseId);
              setCurrentView('case_detail');
            }}
          />
        )}
      </main>

      {/* Victory Congratulations Modal */}
      <CongratulationsModal
        isOpen={showCongratulationsModal}
        caseItem={selectedCase}
        progress={currentCaseProgress}
        onClose={() => setShowCongratulationsModal(false)}
        onGoToNextCase={(nextCaseId) => {
          setShowCongratulationsModal(false);
          setSelectedCaseId(nextCaseId);
          setCurrentView('case_detail');
        }}
        onReturnToArchive={() => {
          setShowCongratulationsModal(false);
          setCurrentView('how_to_play');
        }}
        onRestartCase={() => {
          setShowCongratulationsModal(false);
          handleResetCase();
        }}
      />

      {/* False Accusation 5-Minute Penalty Cooldown Modal */}
      <CooldownModal
        isOpen={showCooldownModal}
        cooldownUntil={currentCaseProgress.cooldownUntil}
        onClose={() => setShowCooldownModal(false)}
      />

      {/* Detective Rules / Manual Modal */}
      <HowToPlayModal
        isOpen={showHelpModal}
        onClose={handleCloseHelpModal}
      />

      {/* Detective Membership & Billing Modal */}
      <ManageSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* Add to Device / Home Screen Instructions Modal */}
      <AddToDeviceModal
        isOpen={showAddToDeviceModal}
        onClose={handleCloseAddToDeviceModal}
        deferredPrompt={deferredPrompt}
      />

      {/* Unobtrusive "Progress saved" indicator */}
      {showSavedIndicator && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/95 border border-emerald-500/60 text-emerald-400 text-xs font-mono shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-300 animate-fade-in"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-neutral-200 font-bold tracking-wide">Progress saved</span>
        </div>
      )}
    </div>
  );
}
