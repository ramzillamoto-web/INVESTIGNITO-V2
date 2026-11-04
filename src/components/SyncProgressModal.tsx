import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react';
import { CaseProgress } from '../types';
import { generateSyncCode, generateSyncUrl, parseSyncCode } from '../utils/storage';

interface SyncProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProgress: Record<string, CaseProgress>;
  onRestoreProgress: (restoredData: Record<string, CaseProgress>) => void;
  initialMode?: 'backup' | 'restore';
  incomingCode?: string | null;
}

export const SyncProgressModal: React.FC<SyncProgressModalProps> = ({
  isOpen,
  onClose,
  allProgress,
  onRestoreProgress,
  initialMode = 'backup',
  incomingCode = null,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>(initialMode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [showRawCode, setShowRawCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (incomingCode) {
        setActiveTab('restore');
        setRestoreInput(incomingCode);
      } else {
        setActiveTab(initialMode);
      }
      setRestoreError(null);
      setRestoreSuccess(null);
      setCopiedLink(false);
      setCopiedCode(false);
    }
  }, [isOpen, initialMode, incomingCode]);

  if (!isOpen) return null;

  const currentCode = generateSyncCode(allProgress);
  const currentUrl = generateSyncUrl(currentCode);

  const activeCasesCount = Object.keys(allProgress).length;
  const solvedCount = Object.values(allProgress).filter((p) => p.status === 'solved').length;
  const inProgressCount = Object.values(allProgress).filter((p) => p.status === 'in_progress').length;

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setRestoreError('Could not auto-copy. Please copy the link manually.');
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      setRestoreError('Could not auto-copy. Please copy the code manually.');
    }
  };

  const handleEmailLink = () => {
    const subject = encodeURIComponent('My Investignito Case Progress Backup');
    const body = encodeURIComponent(
      `Here is your 1-click restore link to continue your investigation on any phone, tablet, or computer:\n\n${currentUrl}\n\nSimply tap the link to load all your saved clues, eliminated suspects, and timer progress automatically!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handlePerformRestore = () => {
    setRestoreError(null);
    setRestoreSuccess(null);

    const parsed = parseSyncCode(restoreInput);
    if (!parsed || Object.keys(parsed).length === 0) {
      setRestoreError('Invalid or corrupted backup code/link. Please check that you copied the complete link or code.');
      return;
    }

    const restoredCount = Object.keys(parsed).length;
    onRestoreProgress(parsed);
    setRestoreSuccess(`Investigation restored successfully! (${restoredCount} case${restoredCount > 1 ? 's' : ''} loaded)`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div className="relative w-full max-w-lg bg-[#0e0e12] border-2 border-red-600/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-[#14141a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-500 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-500 block">
                DOSSIER TRANSFER & BACKUP
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display">
                Sync Between Devices
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-neutral-950/90 border-b border-neutral-800 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('backup');
              setRestoreError(null);
            }}
            className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Share / Backup Case
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('restore');
              setRestoreError(null);
            }}
            className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'restore'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Restore on This Device
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'backup' ? (
            /* TAB 1: BACKUP & SHARE */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Current Progress:</span>
                  <span className="text-red-400 font-bold">
                    {solvedCount > 0 ? `${solvedCount} Solved` : ''}
                    {solvedCount > 0 && inProgressCount > 0 ? ' • ' : ''}
                    {inProgressCount > 0 ? `${inProgressCount} Active` : ''}
                    {solvedCount === 0 && inProgressCount === 0 ? 'New Detective' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Moving from your phone to laptop, or switching browsers? Save this link so you never lose your eliminated suspects or notes.
                </p>
              </div>

              {/* Primary Action: 1-Click Restore Link */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 block">
                  1-Click Restore Link
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-black/80 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs font-mono text-neutral-300 truncate focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Email Link to Self */}
              <button
                type="button"
                onClick={handleEmailLink}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-red-400" />
                <span>Email Progress Link to Myself</span>
              </button>

              {/* Collapsible raw backup code */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowRawCode(!showRawCode)}
                  className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 underline transition-colors cursor-pointer"
                >
                  {showRawCode ? 'Hide raw backup code' : 'Prefer a manual backup code? Click here'}
                </button>

                {showRawCode && (
                  <div className="mt-2 p-3 bg-black/80 border border-neutral-800 rounded-xl space-y-2 animate-fade-in">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      Copy this backup code and paste it on any other device:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentCode}
                        className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-400 truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="py-1.5 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: RESTORE ON THIS DEVICE */
            <div className="space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Paste the 1-click restore link or backup code you copied from your other device to load your saved investigation here.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 block">
                  Paste Backup Link or Code
                </label>
                <textarea
                  rows={3}
                  value={restoreInput}
                  onChange={(e) => {
                    setRestoreInput(e.target.value);
                    setRestoreError(null);
                  }}
                  placeholder="Paste link (https://...?restore=INV-...) or code (INV-...)"
                  className="w-full bg-black/80 border border-neutral-700 focus:border-red-500 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              {restoreError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-700/80 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {restoreSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/80 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{restoreSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePerformRestore}
                disabled={!restoreInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/60"
              >
                <Download className="w-4 h-4" />
                <span>Restore Investigation</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Help Note */}
        <div className="p-3 border-t border-neutral-800 bg-[#0c0c10] text-center">
          <span className="text-[10px] font-mono text-neutral-500">
            Works across all phones, tablets, and computers • Zero setup required
          </span>
        </div>
      </div>
    </div>
  );
};
