import React from 'react';
import { FolderSync, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface SyncCalloutToastProps {
  isOpen: boolean;
  onOpenSync: () => void;
  onDismiss: () => void;
}

export const SyncCalloutToast: React.FC<SyncCalloutToastProps> = ({
  isOpen,
  onOpenSync,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Device Sync and Backup notification"
      className="fixed bottom-4 left-3 right-3 sm:left-4 sm:right-auto z-40 sm:max-w-sm bg-[#0e0e14]/98 border border-amber-600/70 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md text-white animate-fade-in transition-all duration-300"
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(217, 119, 6, 0.25)',
      }}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/90 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm shadow-emerald-950/60">
            <FolderSync className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-emerald-400 block">
              DETECTIVE DOSSIER TIP
            </span>
            <h4 className="text-xs font-black uppercase tracking-tight text-white font-display">
              Playing on Another Device?
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-neutral-300 leading-relaxed mb-3">
        Switching between phone, tablet, or laptop? Use our free <strong className="text-white">Sync / Backup</strong> feature to generate a 1-click restore link anytime!
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onOpenSync();
            onDismiss();
          }}
          className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <span>Check Out Sync & Backup</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
        >
          Got it
        </button>
      </div>
    </aside>
  );
};
