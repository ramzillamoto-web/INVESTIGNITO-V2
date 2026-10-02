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
// CONFIGURATION & UTILITIES
// ==========================================
const GATING_ENABLED = false; // Set to false when testing locally
const SHOPIFY_GUARD_URL = 'https://corexbooks.com/pages/app-gate-investignito';
const SHOPIFY_LOGIN_URL = 'https://corexbooks.com/account/login?return_to=https://corexbooks.com/pages/app-gate-investignito';
const SHOPIFY_PRODUCT_URL = 'https://corexbooks.com/products/investignito-subscription';
const STORAGE_KEY = 'investignito_access_granted';
const EXPIRY_DAYS = 14;

// Safe storage reader
function checkIsTokenValid(): boolean {
  try {
    const cached = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      const fourteenDays = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < fourteenDays) {
        return true;
      }
    }
  } catch (e) {
    // Storage access restricted in cross-origin iframe
  }
  return false;
}

// Safe storage writer
function saveAccessToken() {
  const payload = JSON.stringify({ timestamp: Date.now() });
  try { localStorage.setItem(STORAGE_KEY, payload); } catch (e) {}
  try { sessionStorage.setItem(STORAGE_KEY, payload); } catch (e) {}
}

export default function App() {
  // ==========================================
  // GATING AUTHENTICATION LOGIC
  // ==========================================
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (!GATING_ENABLED) return true;
    
    // 1. Check URL parameters on load
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === 'granted') {
      saveAccessToken();
      return true;
    }
    if (params.get('access') === 'denied') {
      return false;
    }

    // 2. Check stored token
    return checkIsTokenValid();
  });

  useEffect(() => {
    if (!GATING_ENABLED) return;

    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');

    // Clean up query parameter from browser address bar
    if (access === 'granted' || access === 'denied') {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (access === 'granted') {
        saveAccessToken();
        setIsAuthorized(true);
        return;
      }
      if (access === 'denied') {
        setIsAuthorized(false);
        return;
      }
    }

    // Check token again
    if (checkIsTokenValid()) {
      setIsAuthorized(true);
      return;
    }

    // Redirect to Guard Page if not authorized and not explicitly denied
    if (!isAuthorized && access !== 'denied') {
      if (window.top) {
        window.top.location.href = SHOPIFY_GUARD_URL;
      } else {
        window.location.href = SHOPIFY_GUARD_URL;
      }
    }
  }, [isAuthorized]);

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
              href={SHOPIFY_LOGIN_URL}
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
