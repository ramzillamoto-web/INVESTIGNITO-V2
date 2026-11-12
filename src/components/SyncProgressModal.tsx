import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Download,
  Link as LinkIcon,
  ClipboardPaste,
  Share2,
  Sparkles,
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

/**
 * Robust clipboard copy function.
 * Attempts navigator.clipboard.writeText first; if rejected by iframe permissions
 * or browser policies, seamlessly falls back to document.execCommand('copy').
 */
async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Try modern Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText rejected (likely iframe permission), using execCommand fallback:', err);
    }
  }

  // 2. Fallback: document.execCommand('copy') on temporary textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0.01';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('document.execCommand copy fallback failed:', err);
  }

  return false;
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
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [autoDetectedBackup, setAutoDetectedBackup] = useState<{
    data: Record<string, CaseProgress>;
    count: number;
    solved: number;
  } | null>(null);

  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Read clipboard to check for valid backup automatically
  const checkClipboardAutomatically = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const parsed = parseSyncCode(text.trim());
          if (parsed && Object.keys(parsed).length > 0) {
            const count = Object.keys(parsed).length;
            const solved = Object.values(parsed).filter((p) => p.status === 'solved').length;
            setRestoreInput(text.trim());
            setAutoDetectedBackup({ data: parsed, count, solved });
            return;
          }
        }
      }
    } catch {
      // Permission denied or browser blocked; user can tap manual paste button
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (incomingCode) {
        setActiveTab('restore');
        setRestoreInput(incomingCode);
        const parsed = parseSyncCode(incomingCode);
        if (parsed && Object.keys(parsed).length > 0) {
          const count = Object.keys(parsed).length;
          const solved = Object.values(parsed).filter((p) => p.status === 'solved').length;
          setAutoDetectedBackup({ data: parsed, count, solved });
        }
      } else {
        setActiveTab(initialMode);
        if (initialMode === 'restore') {
          checkClipboardAutomatically();
        }
      }
      setRestoreError(null);
      setRestoreSuccess(null);
      setShowConfirmRestore(false);
      setCopiedLink(false);
      setCopiedCode(false);
    } else {
      setAutoDetectedBackup(null);
    }
  }, [isOpen, initialMode, incomingCode]);

  if (!isOpen) return null;

  const currentCode = generateSyncCode(allProgress);
  const currentUrl = generateSyncUrl(currentCode);

  const solvedCount = Object.values(allProgress).filter((p) => p.status === 'solved').length;
  const inProgressCount = Object.values(allProgress).filter((p) => p.status === 'in_progress').length;

  // Real-time preview of parsed restore input
  const previewData = restoreInput.trim() ? parseSyncCode(restoreInput) : null;
  const previewCaseCount = previewData ? Object.keys(previewData).length : 0;
  const previewSolvedCount = previewData
    ? Object.values(previewData).filter((p) => p.status === 'solved').length
    : 0;

  const handleCopyLink = async () => {
    linkInputRef.current?.select();
    await copyTextToClipboard(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = async () => {
    codeInputRef.current?.select();
    await copyTextToClipboard(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleNativeShare = async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: 'Investignito Case Progress',
        text: 'Resume your mystery investigation on any device with this 1-click sync link:',
        url: currentUrl,
      });
    } catch {
      // User cancelled share
    }
  };

  const handlePasteFromClipboard = async () => {
    setRestoreError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setRestoreInput(text.trim());
          const parsed = parseSyncCode(text.trim());
          if (parsed && Object.keys(parsed).length > 0) {
            const count = Object.keys(parsed).length;
            const solved = Object.values(parsed).filter((p) => p.status === 'solved').length;
            setAutoDetectedBackup({ data: parsed, count, solved });
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Paste from clipboard error:', err);
    }
  };

  // Instant 1-click execution when auto-detected or confirmed
  const handleExecuteSync = (dataToRestore: Record<string, CaseProgress>) => {
    setRestoreError(null);
    setRestoreSuccess(null);

    const restoredCount = Object.keys(dataToRestore).length;
    onRestoreProgress(dataToRestore);
    setAutoDetectedBackup(null);
    setShowConfirmRestore(false);
    setRestoreSuccess(
      `Investigation synced on this device! (${restoredCount} case${restoredCount > 1 ? 's' : ''} loaded)`
    );
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleInitiateManualRestore = () => {
    setRestoreError(null);
    setRestoreSuccess(null);

    const parsed = parseSyncCode(restoreInput);
    if (!parsed || Object.keys(parsed).length === 0) {
      setRestoreError(
        'Invalid or corrupted backup. Please ensure you pasted a complete link (https://...?restore=INV-...) or code (INV-...).'
      );
      return;
    }

    setShowConfirmRestore(true);
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
              setShowConfirmRestore(false);
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
              setShowConfirmRestore(false);
              checkClipboardAutomatically();
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
                  <span className="text-neutral-400">Current Saved Progress:</span>
                  <span className="text-red-400 font-bold">
                    {solvedCount > 0 ? `${solvedCount} Solved` : ''}
                    {solvedCount > 0 && inProgressCount > 0 ? ' • ' : ''}
                    {inProgressCount > 0 ? `${inProgressCount} Active` : ''}
                    {solvedCount === 0 && inProgressCount === 0 ? 'All Cases Ready' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Moving from your phone to laptop, or switching browsers? Copy your link below. When you open it on another device, it will ask to sync automatically!
                </p>
              </div>

              {/* Action 1: 1-Click Restore Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>1-Click Restore Link</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    corexbooks.com
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={linkInputRef}
                    type="text"
                    readOnly
                    value={currentUrl}
                    onClick={() => linkInputRef.current?.select()}
                    className="flex-1 bg-black/80 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs font-mono text-neutral-300 truncate focus:outline-none select-all cursor-pointer"
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

              {/* Action 2: Share via native device sheet (AirDrop, Text, WhatsApp, etc.) */}
              {canShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Send Link to Other Device (AirDrop / Message)</span>
                </button>
              )}

              {/* Action 3: Manual Backup Code */}
              <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Manual Backup Code
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    INV-...
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={codeInputRef}
                    type="text"
                    readOnly
                    value={currentCode}
                    onClick={() => codeInputRef.current?.select()}
                    className="flex-1 bg-black/80 border border-neutral-700 rounded-xl px-3 py-2 text-[11px] font-mono text-neutral-400 truncate focus:outline-none select-all cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`py-2 px-3 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      copiedCode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono text-neutral-400 leading-relaxed flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Automatic: Opening your link on your second device will automatically pop up <strong>"Sync on this device?"</strong> with zero pasting needed!
                </span>
              </div>
            </div>
          ) : (
            /* TAB 2: RESTORE ON THIS DEVICE */
            <div className="space-y-4">
              {/* AUTOMATIC ONE-CLICK SYNC BANNER IF BACKUP DETECTED */}
              {autoDetectedBackup && !restoreSuccess && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/95 via-[#181216] to-red-950/95 border-2 border-red-500/80 shadow-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      <h3 className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-white">
                        Sync on this device?
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      Auto-Detected
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 leading-relaxed">
                    Found your saved investigation ({autoDetectedBackup.count} cases, {autoDetectedBackup.solved} solved). Tap below to sync everything automatically!
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleExecuteSync(autoDetectedBackup.data)}
                      className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 cursor-pointer active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Sync on this device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoDetectedBackup(null)}
                      className="py-3 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white font-mono text-xs cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-neutral-300 leading-relaxed">
                Paste your 1-click restore link or backup code below to load your investigation onto this device.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Paste Backup Link or Code
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-neutral-900 px-2 py-1 rounded border border-neutral-700"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Paste from Clipboard</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={restoreInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRestoreInput(val);
                    setRestoreError(null);
                    setShowConfirmRestore(false);
                    const parsed = parseSyncCode(val);
                    if (parsed && Object.keys(parsed).length > 0) {
                      const count = Object.keys(parsed).length;
                      const solved = Object.values(parsed).filter((p) => p.status === 'solved').length;
                      setAutoDetectedBackup({ data: parsed, count, solved });
                    }
                  }}
                  placeholder="Paste link (https://...?restore=INV-...) or code (INV-...)"
                  className="w-full bg-black/80 border border-neutral-700 focus:border-red-500 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Dynamic preview if valid content entered */}
              {previewData && !restoreSuccess && !autoDetectedBackup && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Valid backup recognized: <strong>{previewCaseCount} case{previewCaseCount > 1 ? 's' : ''}</strong> found ({previewSolvedCount} solved).
                  </span>
                </div>
              )}

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

              {/* Manual Confirmation view before replacing progress */}
              {showConfirmRestore ? (
                <div className="p-4 rounded-xl bg-red-950/90 border border-red-600 space-y-3 animate-fade-in text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Confirm Replacement
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
                    This replaces the progress saved on this device with the backup.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmRestore(false)}
                      className="py-2 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseSyncCode(restoreInput);
                        if (parsed) handleExecuteSync(parsed);
                      }}
                      className="py-2 px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-red-950/60"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ) : (
                !restoreSuccess &&
                !autoDetectedBackup && (
                  <button
                    type="button"
                    onClick={handleInitiateManualRestore}
                    disabled={!restoreInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/60"
                  >
                    <Download className="w-4 h-4" />
                    <span>Restore Investigation</span>
                  </button>
                )
              )}
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
