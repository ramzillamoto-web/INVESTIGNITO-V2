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

// ==========================================
// SHOPIFY GATING & PRODUCT CONFIGURATION
// ==========================================
const GATING_ENABLED = true; // Set to false when testing locally
const SHOPIFY_GUARD_URL = 'https://corexbooks.com/pages/app-gate-investignito';
const SHOPIFY_PRODUCT_URL = 'https://corexbooks.com/products/investignito-subscription'; // UPDATE THIS WITH YOUR ACTUAL PRODUCT LINK
const STORAGE_KEY = 'investignito_access_granted';
const EXPIRY_DAYS = 14;

export default function App() {
  // ==========================================
  // GATING AUTHENTICATION LOGIC
  // ==========================================
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!GATING_ENABLED) {
      setIsAuthorized(true);
      return;
    }

    // 1. Check local cache for 14-day token
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        const fourteenDays = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < fourteenDays) {
          setIsAuthorized(true);
          return;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // 2. Read query parameter passed back from Shopify Guard Page
    const urlParams = new URLSearchParams(window.location.search);
    const access = urlParams.get('access');

    if (access === 'granted') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthorized(true);
      return;
    }

    if (access === 'denied') {
      // Clean up the URL parameter so it doesn't trigger redirects
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthorized(false);
      return; // STOP execution so it doesn't bounce to login automatically
    }

    // 3. No token present and no explicit access state: Bounce to Guard Page
    if (window.top) {
      window.top.location.href = SHOPIFY_GUARD_URL;
    } else {
      window.location.href = SHOPIFY_GUARD_URL;
    }
  }, []);

  // Default to landing page
  const [currentView, setCurrentView] = useState<ViewMode>('how_to_play');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [allProgress, setAllProgress] = useState<Record<string, CaseProgress>>(() => {
    return loadAllProgress();
  });

  // Always show "How to Play" onboarding modal on load / refresh
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
  };

  const handleFailedSubmission = () => {
    setShowCooldownModal(true);
  };

  const isCase3Locked = selectedCase.id === 'case-3' && allProgress['case-2']?.status !== 'solved';
  const isCase4Locked = selectedCase.id === 'case-4';
  const isCurrentCaseLocked = isCase3Locked || isCase4Locked;

  // ==========================================
  // UNAUTHORIZED PAYWALL SCREEN
  // ==========================================
  if (GATING_ENABLED && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#070709] text-[#f5f5f5] flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <DarkMistBackground />
        <div className="relative z-10 max-w-md w-full bg-[#121217] border border-[#23232d] rounded-xl p-8 shadow-2xl">
          <div className="w-12 h-12 bg-[#16161c] border border-[#282832] rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#e50914] uppercase tracking-widest mb-2">ACCESS DENIED</h1>
          <p className="text-sm text-[#8e8e9d] mb-6 leading-relaxed">
            An active <span className="text-white font-semibold">Investignito Subscriber</span> membership is required to access these case files.
          </p>
          
          <div className="flex flex-col gap-3">
            {/* Primary Action: Subscribe / Buy Product */}
            <a
              href={SHOPIFY_PRODUCT_URL}
              target="_top"
              className="inline-block w-full bg-[#e50914] hover:bg-[#c10711] text-white font-bold py-3 px-6 rounded-lg text-sm tracking-wider uppercase transition-colors shadow-lg"
            >
              SUBSCRIBE TO PLAY
            </a>

            {/* Secondary Action: Log In */}
            <a
              href={SHOPIFY_GUARD_URL}
              target="_top"
              className="inline-block w-full bg-[#16161c] hover:bg-[#202028] text-[#c0c0d0] border border-[#282832] font-semibold py-3 px-6 rounded-lg text-xs tracking-wider uppercase transition-colors"
            >
              LOG IN TO PLAY
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN APP RENDER
  // ==========================================
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
