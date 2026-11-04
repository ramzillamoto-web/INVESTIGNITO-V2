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
import { SyncProgressModal } from './components/SyncProgressModal';
import { useAddToDevice } from './hooks/useAddToDevice';
import { CASE_OUTROS } from './data/outros';
import { hasSeenOutro, markOutroSeen, shouldSkipAutomaticOutro } from './utils/outro';
import { OutroVideo } from './components/OutroVideo';

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
  const [showOutro, setShowOutro] = useState<boolean>(false);
  const [isReplayingOutro, setIsReplayingOutro] = useState<boolean>(false);
  const [showCooldownModal, setShowCooldownModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [syncModalMode, setSyncModalMode] = useState<'backup' | 'restore'>('backup');
  const [incomingSyncCode, setIncomingSyncCode] = useState<string | null>(null);
  const [unlockedCaseBanner, setUnlockedCaseBanner] = useState<string | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState<boolean>(false);

  // Auto-detect 1-click restore link in URL (?restore=... or ?sync=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('restore') || params.get('sync');
      if (code) {
        setIncomingSyncCode(code);
        setSyncModalMode('restore');
        setShowSyncModal(true);
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.warn('URL restore check error:', e);
    }
  }, []);

  const handleRestoreProgress = (restored: Record<string, CaseProgress>) => {
    setAllProgress(restored);
    saveAllProgress(restored, true);
    setShowSavedIndicator(true);
  };

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
    setShowOutro(false);
  };

  const handleSolveCase = () => {
    const hasOutro = Boolean(CASE_OUTROS[selectedCase.id]);
    const alreadySeen = hasSeenOutro(selectedCase.id);
    const skipAuto = shouldSkipAutomaticOutro();

    if (hasOutro && !alreadySeen && !skipAuto) {
      setIsReplayingOutro(false);
      setShowOutro(true);
    } else {
      setShowCongratulationsModal(true);
    }

    if (selectedCase.id === 'case-2') {
      setUnlockedCaseBanner('case-3');
    } else if (selectedCase.id === 'case-3') {
      setUnlockedCaseBanner('case-4');
    }
  };

  const handleOutroFinish = () => {
    if (!isReplayingOutro) {
      markOutroSeen(selectedCase.id);
    }
    setIsReplayingOutro(false);
    setShowOutro(false);
    setShowCongratulationsModal(true);
  };

  const handleWatchEnding = () => {
    setIsReplayingOutro(true);
    setShowCongratulationsModal(false);
    setShowOutro(true);
  };

  const handleFailedSubmission = () => {
    setShowCooldownModal(true);
  };

  const isCase3Locked = selectedCase.id === 'case-3' && allProgress['case-2']?.status !== 'solved';
  const isCase4Locked = selectedCase.id === 'case-4' && allProgress['case-3']?.status !== 'solved';
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
        onOpenSync={() => {
          setSyncModalMode('backup');
          setShowSyncModal(true);
        }}
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
            onOpenSync={() => {
              setSyncModalMode('backup');
              setShowSyncModal(true);
            }}
            isStandalone={isStandalone}
          />
        )}

        {currentView === 'case_detail' && (
          <CaseDetailView
            key={selectedCase.id}
            caseItem={selectedCase}
            progress={currentCaseProgress}
            isLocked={isCurrentCaseLocked}
            onUpdateProgress={handleUpdateCaseProgress}
            onSolveCase={handleSolveCase}
            onFailedSubmission={handleFailedSubmission}
            onOpenHelp={() => setShowHelpModal(true)}
            onResetCase={handleResetCase}
            onSwitchToCase={(caseId) => {
              if (caseId === 'how_to_play') {
                setCurrentView('how_to_play');
              } else {
                setSelectedCaseId(caseId);
                setCurrentView('case_detail');
              }
            }}
          />
        )}
      </main>

      {/* End-of-Case Outro Video Overlay */}
      {showOutro && CASE_OUTROS[selectedCase.id] && (
        <OutroVideo
          src={CASE_OUTROS[selectedCase.id].src}
          poster={CASE_OUTROS[selectedCase.id].poster}
          onFinish={handleOutroFinish}
        />
      )}

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
        onWatchEnding={handleWatchEnding}
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
        onOpenSync={() => {
          setShowHelpModal(false);
          setSyncModalMode('backup');
          setShowSyncModal(true);
        }}
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

      {/* Case Progress Transfer & Backup Modal */}
      <SyncProgressModal
        isOpen={showSyncModal}
        onClose={() => {
          setShowSyncModal(false);
          setIncomingSyncCode(null);
        }}
        allProgress={allProgress}
        onRestoreProgress={handleRestoreProgress}
        initialMode={syncModalMode}
        incomingCode={incomingSyncCode}
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
