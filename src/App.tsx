import React, { useState, useEffect } from 'react';
import { CASE_1_DATA, CASES_DATA } from './data/cases';
import { ViewMode, CaseData, CaseProgress } from './types';
import { loadAllProgress, saveAllProgress, getInitialProgress } from './utils/storage';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { CaseDetailView } from './components/CaseDetailView';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CongratulationsModal } from './components/CongratulationsModal';
import { CooldownModal } from './components/CooldownModal';
import { DarkMistBackground } from './components/DarkMistBackground';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

export default function App() {
  // Default to landing page
  const [currentView, setCurrentView] = useState<ViewMode>('how_to_play');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [allProgress, setAllProgress] = useState<Record<string, CaseProgress>>(() => {
    return loadAllProgress();
  });

  // Always show "How to Play" onboarding modal on load / refresh (no persistent "seen it" flag)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(true);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState<boolean>(false);
  const [showCooldownModal, setShowCooldownModal] = useState<boolean>(false);
  const [unlockedCaseBanner, setUnlockedCaseBanner] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    saveAllProgress(allProgress);
  }, [allProgress]);

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
        onClose={() => setShowHelpModal(false)}
      />

      {/* PWA Mobile Install & Push Notification Banner & Full Screen Control */}
      <PwaInstallPrompt />
    </div>
  );
}
