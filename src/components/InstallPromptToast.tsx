import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { InvestignitoLogo } from './InvestignitoLogo';
import { isIos, isAndroid } from '../utils/pwa';

interface InstallPromptToastProps {
  deferredPrompt?: any;
  isStandalone: boolean;
  onOpenGuide: () => void;
  onInstallSuccess?: () => void;
}

export const InstallPromptToast: React.FC<InstallPromptToastProps> = ({
  deferredPrompt,
  isStandalone,
  onOpenGuide,
  onInstallSuccess,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOSDevice, setIsIOSDevice] = useState<boolean>(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState<boolean>(false);
  const [showSteps, setShowSteps] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [justInstalled, setJustInstalled] = useState<boolean>(false);

  useEffect(() => {
    // If running in standalone mode (already installed), never show the prompt
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    if (typeof window === 'undefined') return;

    // Check if dismissed in this session
    try {
      const dismissed = sessionStorage.getItem('investignito_install_toast_dismissed');
      if (dismissed === 'true') return;
    } catch {
      // non-fatal
    }

    setIsIOSDevice(isIos());
    setIsAndroidDevice(isAndroid());

    // Delay prompt appearance by 2 seconds for a seamless experience
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isStandalone]);

  if (!isVisible || isStandalone) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('investignito_install_toast_dismissed', 'true');
    } catch {
      // non-fatal
    }
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setJustInstalled(true);
          if (onInstallSuccess) onInstallSuccess();
          setTimeout(() => {
            setIsVisible(false);
            try {
              sessionStorage.setItem('investignito_install_toast_dismissed', 'true');
            } catch {
              // ignore
            }
          }, 2000);
          return;
        }
      } catch (err) {
        console.warn('Native install prompt encountered error:', err);
      } finally {
        setInstalling(false);
      }
    }

    // Fall back to opening instructions modal
    onOpenGuide();
  };

  return (
    <aside
      aria-label="Install Investignito App"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 z-40 sm:max-w-md bg-[#0e0e14]/98 border-2 border-red-600/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white animate-fade-in transition-all duration-300"
      style={{
        boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.9), 0 0 20px rgba(220, 38, 38, 0.35)',
      }}
    >
      {justInstalled ? (
        <div className="flex items-center gap-3 py-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
          <div>
            <div className="text-sm font-black font-display uppercase tracking-tight text-white">
              Installation Complete!
            </div>
            <div className="text-xs text-neutral-300">
              INVESTIGNITO has been added to your device.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1.5 shadow-inner shrink-0">
                <InvestignitoLogo size={26} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-red-500">
                    APP INSTALLATION
                  </span>
                  <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-950/80 border border-red-700 text-red-300">
                    <Sparkles className="w-2 h-2 text-red-400" />
                    PWA READY
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white font-display">
                  Install Investignito
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss installation prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtitle text */}
          <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed mb-3">
            {isIOSDevice
              ? 'Add INVESTIGNITO to your iPhone/iPad Home Screen for full-screen cases with zero browser bars.'
              : isAndroidDevice
              ? 'Add INVESTIGNITO to your Android Home Screen for 1-tap quick play and full-screen cases.'
              : 'Install the web app to your computer or home screen for full-screen detective cases.'}
          </p>

          {/* Android Quick Steps Accordion */}
          {isAndroidDevice && showSteps && (
            <div className="mb-3 p-3 rounded-xl bg-neutral-900/90 border border-neutral-700 space-y-2 text-xs animate-fade-in">
              <div className="flex items-start gap-2.5 text-neutral-200">
                <div className="w-5 h-5 rounded bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400 shrink-0 font-mono font-black text-[10px]">
                  1
                </div>
                <div className="leading-snug">
                  Tap Chrome's <strong className="text-white">three dots (⋮)</strong> menu in the top-right corner.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-neutral-200">
                <div className="w-5 h-5 rounded bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-[10px]">
                  2
                </div>
                <div className="leading-snug">
                  Tap <strong className="text-white">"Add to Home screen"</strong> or <strong className="text-white">"Install app"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-neutral-200">
                <div className="w-5 h-5 rounded bg-red-950 border border-red-600 flex items-center justify-center text-red-400 shrink-0 font-mono font-black text-[10px]">
                  3
                </div>
                <div className="leading-snug">
                  In the pop-up, tap <strong className="text-white">"Create shortcut"</strong> (below the disabled Install line) and tap <strong className="text-white">Add</strong>!
                </div>
              </div>

              <div className="pt-1 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>The INVESTIGNITO icon will appear on your Home Screen!</span>
              </div>
            </div>
          )}

          {/* iOS Quick Steps Accordion */}
          {isIOSDevice && showSteps && (
            <div className="mb-3 p-3 rounded-xl bg-neutral-900/90 border border-neutral-700 space-y-2 text-xs animate-fade-in">
              <div className="flex items-start gap-2.5 text-neutral-200">
                <div className="w-5 h-5 rounded bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400 shrink-0 font-mono font-black text-[10px]">
                  1
                </div>
                <div className="leading-snug">
                  Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar:
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-1 rounded bg-neutral-800 border border-neutral-700 text-sky-400 font-mono text-[10px]">
                    <Share2 className="w-3 h-3" /> Share
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-neutral-200">
                <div className="w-5 h-5 rounded bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-[10px]">
                  2
                </div>
                <div className="leading-snug">
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>:
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-1 rounded bg-neutral-800 border border-neutral-700 text-emerald-400 font-mono text-[10px]">
                    <PlusSquare className="w-3 h-3" /> Add to Home Screen
                  </span>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-amber-300 font-mono">
                Then tap <strong>Add</strong> in the top-right corner to finish.
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isIOSDevice ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSteps((prev) => !prev)}
                  className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{showSteps ? 'Hide Steps' : 'Install on iPhone'}</span>
                  {showSteps ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Full Guide
                </button>
              </>
            ) : deferredPrompt ? (
              <>
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  disabled={installing}
                  className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Installing...' : 'Install Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Maybe Later
                </button>
              </>
            ) : isAndroidDevice ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSteps((prev) => !prev)}
                  className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{showSteps ? 'Hide Steps' : 'Add to Android'}</span>
                  {showSteps ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Full Guide
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>How to Install</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Later
                </button>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
};
