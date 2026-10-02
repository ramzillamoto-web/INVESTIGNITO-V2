import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { InvestignitoLogo } from './InvestignitoLogo';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUpdatePayment = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      triggerToast('Secure billing portal synced: Payment method verified.');
    }, 800);
  };

  const handleRestore = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      triggerToast('Subscription purchases successfully restored and verified.');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        id="manage-subscription-modal"
        className="bg-[#0f0f13] border-2 border-amber-500/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-black/90 relative text-neutral-100 overflow-hidden"
      >
        {/* Ambient Amber Glow Accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          aria-label="Close Subscription Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-600/80 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/80">
                ACTIVE SUBSCRIBER
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ALL-ACCESS PASS
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-display uppercase tracking-tight text-white mt-1">
              Manage Subscription
            </h2>
          </div>
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono font-bold flex items-center gap-2 animate-slide-up shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="bg-[#17171d] rounded-xl border border-neutral-800 p-4 mb-4">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-3">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-neutral-400 block">
                CURRENT TIER
              </span>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>Master Detective Membership</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-black text-amber-400 block">
                $4.99 <span className="text-xs text-neutral-400 font-normal">/ mo</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block">Renews Oct 14, 2026</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-white font-bold text-[10px]">
                VISA
              </div>
              <span>Ending in •••• 4242</span>
            </div>
            <button
              onClick={handleUpdatePayment}
              disabled={isUpdating}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer hover:opacity-80 transition-opacity"
            >
              {isUpdating ? 'Updating...' : 'Update Card'}
            </button>
          </div>
        </div>

        {/* Membership Perks */}
        <div className="space-y-2 mb-5">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-neutral-400 block">
            SUBSCRIBER CLEARANCE INCLUDED:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141419] border border-neutral-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">All 4 Unsolved Mystery Cases</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141419] border border-neutral-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Case 4 Clocktower Spire Access</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141419] border border-neutral-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Offline PWA & Full Screen Mode</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141419] border border-neutral-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Weekly New Case Archives</span>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Prompt */}
        {showCancelPrompt ? (
          <div className="bg-red-950/80 border border-red-700/80 p-3.5 rounded-xl mb-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-red-300 font-bold mb-1.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Are you sure you want to pause your subscription?</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed mb-3 font-medium">
              You will retain full detective clearance through October 14, 2026. Upcoming Case #4 and weekly drops will be restricted thereafter.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowCancelPrompt(false);
                  triggerToast('Subscription set to end on October 14, 2026.');
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] uppercase cursor-pointer"
              >
                Confirm Pause
              </button>
              <button
                onClick={() => setShowCancelPrompt(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[11px] uppercase cursor-pointer"
              >
                Keep Active
              </button>
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestore}
              disabled={isUpdating}
              className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Restore Purchases</span>
            </button>
            <span className="text-neutral-700">•</span>
            <button
              onClick={() => setShowCancelPrompt(true)}
              className="text-[11px] font-mono text-neutral-500 hover:text-red-400 cursor-pointer transition-colors"
            >
              Cancel Subscription
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
