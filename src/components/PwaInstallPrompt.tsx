import React, { useState, useEffect } from 'react';
import {
  Download,
  Bell,
  X,
  Smartphone,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import {
  isMobileDevice,
  isIos,
  isStandalonePWA,
  requestPushNotificationPermission,
  sendLocalNotification
} from '../utils/pwa';
import { ManageSubscriptionModal } from './ManageSubscriptionModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIosDevice, setIsIosDevice] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('default');
  const [hasTestedPush, setHasTestedPush] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    const mobile = isMobileDevice();
    const ios = isIos();
    const standalone = isStandalonePWA();

    setIsMobile(mobile);
    setIsIosDevice(ios);
    setIsStandalone(standalone);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('investignito_pwa_dismissed');
    if (!standalone && mobile && dismissed !== 'true') {
      // Auto display prompt after 1.5 seconds on mobile
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isStandalone) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIosDevice) {
      setShowIosGuide(true);
    } else {
      // On desktop or other browsers without direct prompt
      setShowIosGuide(true);
    }
  };

  const handleEnablePush = async () => {
    const res = await requestPushNotificationPermission();
    setNotificationStatus(res);
    if (res === 'granted') {
      setHasTestedPush(true);
      await sendLocalNotification(
        'INVESTIGNITO Bureau Alert',
        'Push notifications enabled! You will be alerted when new weekly mystery cases drop.'
      );
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('investignito_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Floating Quick Action Widget for Mobile/Desktop */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {/* Manage Subscription Button */}
        <button
          id="btn-manage-subscription-floating"
          onClick={() => setShowSubscriptionModal(true)}
          className="px-3 sm:px-3.5 py-2.5 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-amber-500/70 hover:border-amber-400 shadow-xl shadow-black/80 flex items-center gap-1.5 sm:gap-2 text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer backdrop-blur"
          title="Manage Detective Subscription"
        >
          <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Manage Subscription</span>
        </button>

        {/* Install / Push Alert Trigger Button if banner is minimized */}
        {!showBanner && !isStandalone && (
          <button
            id="btn-install-app-floating"
            onClick={() => setShowBanner(true)}
            className="px-3 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-950/80 border border-red-400/50 flex items-center gap-2 text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-95 animate-bounce-subtle"
            title="Install App & Push Alerts"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
        )}
      </div>

      {/* Main Install & Push Notification Banner for Mobile */}
      {showBanner && !isStandalone && (
        <div
          id="pwa-install-banner"
          className="fixed bottom-3 sm:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-50 animate-slide-up"
        >
          <div className="bg-[#0f0f12] border-2 border-red-600/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/90 backdrop-blur-md relative overflow-hidden">
            {/* Ambient Red Glow Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* Dismiss Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Dismiss Install Prompt"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              {/* App Icon (Matching uploaded logo) */}
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-red-500 shadow-lg shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/icon-192.png"
                  alt="Investignito Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                    MOBILE PWA
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> FULL SCREEN
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black font-display uppercase tracking-tight text-white leading-tight">
                  Install Investignito
                </h3>
                <p className="text-xs text-neutral-300 font-medium leading-snug mt-1">
                  Add to your home screen for pure <strong>Full Screen</strong> immersion (no browser address bar) and push case alerts!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                id="btn-pwa-install-action"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Add To Phone</span>
              </button>

              {notificationStatus === 'granted' ? (
                <button
                  onClick={handleEnablePush}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Push Active</span>
                </button>
              ) : (
                <button
                  id="btn-pwa-push-action"
                  onClick={handleEnablePush}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Push Alerts</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Add to Home Screen Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f0f12] border-2 border-red-600 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-red-500 flex items-center justify-center shrink-0">
                <img src="/icon-192.png" alt="Investignito Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-black font-display uppercase tracking-tight text-white">
                  Add To Home Screen
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Enjoy Fullscreen Investigation Mode
                </span>
              </div>
            </div>

            <div className="space-y-3.5 my-4 text-xs text-neutral-200 font-mono">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Tap the Share Icon</p>
                  <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                    At the bottom or top of Safari: <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Select "Add to Home Screen"</p>
                  <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                    Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-white inline" /> Add to Home Screen.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Launch Full Screen</p>
                  <p className="text-[11px] text-neutral-300">
                    Open Investignito from your home screen for zero address bar pure full screen!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* Installation Success Toast */}
      {installedSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-emerald-950 border-2 border-emerald-500 text-white shadow-2xl flex items-center gap-3 animate-slide-down">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black font-mono uppercase tracking-wider">
              Investignito Installed Successfully!
            </h4>
            <p className="text-[11px] text-emerald-200">
              You can now launch the app directly from your home screen in Full Screen.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
