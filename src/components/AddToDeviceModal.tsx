import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Share2,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { InvestignitoLogo } from './InvestignitoLogo';
import { isIos, isAndroid, isStandalonePWA } from '../utils/pwa';

interface AddToDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onPromptSuccess?: () => void;
}

export const AddToDeviceModal: React.FC<AddToDeviceModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onPromptSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Detect standalone mode
    setIsStandalone(isStandalonePWA());

    // Auto-detect current operating platform
    if (isIos()) {
      setActiveTab('ios');
    } else if (isAndroid()) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsStandalone(true);
        if (onPromptSuccess) onPromptSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.warn('Native install prompt error:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#111115] border-2 border-neutral-700 rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative text-neutral-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-2 shadow-inner shrink-0">
            <InvestignitoLogo size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-500">
                APPLICATION LAUNCHER
              </span>
              {isStandalone && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  INSTALLED
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white leading-tight">
              Add to Device
            </h2>
          </div>
        </div>

        {/* Benefits banner */}
        <div className="mb-5 bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-3.5 text-xs text-neutral-300 space-y-1.5 font-medium">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Why Add to Your Home Screen?</span>
          </div>
          <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed">
            Get an immersive full-screen detective experience with zero browser address bars, instant offline case loading, and quick-launch access from your home screen.
          </p>
        </div>

        {/* If native install prompt is directly supported by the browser */}
        {deferredPrompt && !isStandalone && (
          <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-red-950/70 via-neutral-900 to-red-950/70 border border-red-600/70 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />
              <div>
                <div className="text-xs font-black text-white uppercase font-mono">
                  1-Tap Automated Install Ready
                </div>
                <div className="text-[11px] text-neutral-300">
                  Your browser supports automatic installation right now.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTriggerNativeInstall}
              disabled={installing}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{installing ? 'Installing...' : 'Add Now'}</span>
            </button>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Instructions Content */}
        <div className="space-y-3 mb-6">
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-sky-950/80 border border-sky-600 flex items-center justify-center text-sky-400 shrink-0 font-mono font-black text-xs">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>Tap the Safari Share button</span>
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Open this page in <strong>Safari</strong> on your iPhone or iPad, then tap the <strong>Share</strong> button (the box with an arrow pointing up) at the bottom (or top on iPad).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-xs">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>Select "Add to Home Screen"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Scroll down through the share options menu and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-600 flex items-center justify-center text-red-400 shrink-0 font-mono font-black text-xs">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">
                    Confirm by tapping "Add"
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Tap <strong>Add</strong> in the top-right corner. The INVESTIGNITO icon will appear directly on your home screen!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-600 flex items-center justify-center text-amber-400 shrink-0 font-mono font-black text-xs">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>Tap Chrome's Menu</span>
                    <MoreVertical className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Open Chrome or Samsung Internet, and tap the <strong>three vertical dots (⋮)</strong> menu in the upper-right corner of the browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-xs">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>Tap "Install app" or "Add to Home screen"</span>
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Select <strong>Install app</strong> (or <strong>Add to Home screen</strong>) from the browser drop-down list.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-600 flex items-center justify-center text-red-400 shrink-0 font-mono font-black text-xs">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">
                    Confirm "Install"
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Tap <strong>Install</strong>. INVESTIGNITO will be added to your phone's app drawer and home screen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-sky-950/80 border border-sky-600 flex items-center justify-center text-sky-400 shrink-0 font-mono font-black text-xs">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">
                    Look at the Address Bar (URL Bar)
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    In Chrome, Edge, or Brave, look at the right end of the address bar at the top for an <strong>Install icon</strong> (computer screen with a down arrow or ⊕ symbol).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-xs">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">
                    Click "Install"
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    Click the install icon and confirm by clicking <strong>Install</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-600 flex items-center justify-center text-red-400 shrink-0 font-mono font-black text-xs">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">
                    Alternative: Browser Menu
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    If you don't see the icon, click the three dots (⋮) in the browser toolbar, choose <strong>Save and share</strong> (or <strong>More tools</strong>), and click <strong>Install INVESTIGNITO...</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-800">
          <div className="text-[11px] text-neutral-500 font-mono">
            {isStandalone ? 'Status: App mode active' : 'Runs natively with zero app store download'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-700 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
