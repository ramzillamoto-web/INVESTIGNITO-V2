import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertTriangle, ExternalLink, X } from 'lucide-react';
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
import {
  initPersistentStorage,
  checkAndRecoverFromIndexedDB,
  initCrossTabSync,
  isInAppBrowser,
} from './utils/persistence';
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
import { SyncCalloutToast } from './components/SyncCalloutToast';
import { useAddToDevice } from './hooks/useAddToDevice';
import { CASE_OUTROS } from './data/outros';
import { hasSeenOutro, markOutroSeen, shouldSkipAutomaticOutro } from './utils/outro';
import { OutroVideo } from './components/OutroVideo';
import { applyCaseVersionResets } from './utils/caseVersions';
import { ENABLE_ADD_TO_DEVICE } from './config/features';
import { InstalledAppNotice } from './components/InstalledAppNotice';

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
    const raw = loadAllProgress();
    const { updated, changed } = applyCaseVersionResets(raw);
    if (changed) {
      saveAllProgress(updated, true);
    }
    return updated;
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

  // In-App browser banner state (Instagram, TikTok, Facebook, etc.)
  const [showInAppBanner, setShowInAppBanner] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const dismissed = sessionStorage.getItem('investignito_inapp_dismissed');
      return isInAppBrowser() && dismissed !== '1';
    } catch {
      return false;
    }
  });

  const handleDismissInAppBanner = () => {
    setShowInAppBanner(false);
    try {
      sessionStorage.setItem('investignito_inapp_dismissed', '1');
    } catch {
      // ignore
    }
  };

  // Corner popping callout message to discover the Sync / Backup feature
  const [showSyncCallout, setShowSyncCallout] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dismissed = localStorage.getItem('investignito_sync_tip_dismissed_v1');
      if (dismissed === 'true') return;

      // Pop up after 4.5 seconds to introduce the feature to the user
      const timer = setTimeout(() => {
        setShowSyncCallout(true);
      }, 4500);

      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, []);

  const handleDismissSyncCallout = () => {
    setShowSyncCallout(false);
    try {
      localStorage.setItem('investignito_sync_tip_dismissed_v1', 'true');
    } catch {
      // ignore
    }
  };

  // 1. Initialize Persistent Storage API (prohibits iOS/Android overnight eviction)
  // 2. Disaster Recovery: Check if IndexedDB has backup if localStorage was cleared
  // 3. Multi-Tab / Cross-Window Synchronization (BroadcastChannel + storage events)
  useEffect(() => {
    initPersistentStorage();

    // Check if current in-memory progress is empty, and attempt recovery from IndexedDB
    const hasMeaningfulData = Object.values(allProgress).some(
      (p) => p.status !== 'unsolved' || (p.markings && Object.keys(p.markings).length > 0)
    );

    if (!hasMeaningfulData) {
      checkAndRecoverFromIndexedDB().then((backupCases) => {
        if (backupCases && Object.keys(backupCases).length > 0) {
          setAllProgress(backupCases);
          saveAllProgress(backupCases, true);
          setShowSavedIndicator(true);
        }
      });
    }

    // Subscribe to cross-tab updates so other open tabs never overwrite with stale state
    const unsubscribeSync = initCrossTabSync((remoteCases) => {
      setAllProgress(remoteCases);
    });

    return () => {
      unsubscribeSync();
    };
  }, []);

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

  // Save immediately when page is hidden, closed, or frozen (visibilitychange, pagehide, beforeunload, freeze)
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
    window.addEventListener('beforeunload', handleSaveImmediately);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('freeze', handleSaveImmediately);

    return () => {
      window.removeEventListener('pagehide', handleSaveImmediately);
      window.removeEventListener('beforeunload', handleSaveImmediately);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('freeze', handleSaveImmediately);
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

  // Check if running as an installed home-screen app outside of an iframe
  const isInstalledStandalone =
    typeof window !== 'undefined' &&
    window.self === window.top &&
    ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  if (isInstalledStandalone) {
    return (
      <div className="min-h-screen bg-[#060608] text-[#f5f5f5]">
        <InstalledAppNotice
          onOpenBackup={() => {
            setSyncModalMode('backup');
            setShowSyncModal(true);
          }}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-[#f5f5f5] flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Creepy Drifting Dark Mist & Blizzard Background */}
      <DarkMistBackground />

      {/* In-App Browser Warning Banner for Instagram, Facebook, TikTok, Line, etc. */}
      {showInAppBanner && (
        <div
          role="alert"
          className="relative z-50 bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border-b border-amber-600/70 text-amber-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 text-xs font-mono shadow-xl animate-fade-in"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <p className="truncate sm:whitespace-normal text-[11px] sm:text-xs">
              <span className="font-bold text-white">In-App Browser:</span> Progress may reset when closed. Tap <span className="text-white font-bold">•••</span> &gt; <span className="underline decoration-amber-400 font-bold text-white">Open in Safari / Chrome</span> to save permanently.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSyncModalMode('backup');
                setShowSyncModal(true);
              }}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold uppercase text-[10px] sm:text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Backup</span>
            </button>
            <button
              type="button"
              onClick={handleDismissInAppBanner}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Navbar
        currentView={currentView}
        selectedCase={selectedCase}
        caseProgress={currentCaseProgress}
        onNavigate={(view) => setCurrentView(view)}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenSubscription={handleOpenSubscription}
        onAddToDevice={ENABLE_ADD_TO_DEVICE ? triggerAddToDevice : undefined}
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
            onAddToDevice={ENABLE_ADD_TO_DEVICE ? triggerAddToDevice : undefined}
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
      {ENABLE_ADD_TO_DEVICE && (
        <AddToDeviceModal
          isOpen={showAddToDeviceModal}
          onClose={handleCloseAddToDeviceModal}
          deferredPrompt={deferredPrompt}
        />
      )}

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

      {/* Corner Popping Message to discover Sync / Backup feature */}
      <SyncCalloutToast
        isOpen={showSyncCallout}
        onOpenSync={() => {
          setSyncModalMode('backup');
          setShowSyncModal(true);
        }}
        onDismiss={handleDismissSyncCallout}
      />
    </div>
  );
}
