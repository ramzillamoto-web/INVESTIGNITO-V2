import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { InvestignitoLogo } from './InvestignitoLogo';

interface InstalledAppNoticeProps {
  onOpenBackup: () => void;
}

export const InstalledAppNotice: React.FC<InstalledAppNoticeProps> = ({ onOpenBackup }) => {
  const handleOpenStore = () => {
    try {
      const targetUrl = 'https://corexbooks.com/pages/investignito';
      if (typeof window !== 'undefined') {
        if (window.top) {
          window.top.location.href = targetUrl;
        } else {
          window.location.href = targetUrl;
        }
      }
    } catch {
      window.location.href = 'https://corexbooks.com/pages/investignito';
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-[#f5f5f5] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0e0e14] border border-red-600/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-600/60 flex items-center justify-center text-red-500 shadow-lg shadow-red-950/50">
            <InvestignitoLogo size={32} />
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-500 bg-red-950/50 border border-red-800/50 px-2.5 py-1 rounded-full">
            INVESTIGATION UPDATE
          </span>
        </div>

        {/* Heading & Text */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
            Investignito has moved to the store page
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto">
            To keep your progress safe on every device, play from the store page. Your progress from this icon is still saved here, so back it up first and bring it with you.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onOpenBackup}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/60 active:scale-[0.98]"
          >
            <Copy className="w-4 h-4" />
            <span>Back up my progress</span>
          </button>

          <button
            type="button"
            onClick={handleOpenStore}
            className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs sm:text-sm font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <span>Open the store page</span>
            <ExternalLink className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Notice line */}
        <div className="pt-2 border-t border-neutral-800/80">
          <p className="text-[11px] sm:text-xs font-mono text-neutral-400">
            On the store page, choose Sync / Backup, then Restore, and paste your code.
          </p>
        </div>
      </div>
    </div>
  );
};
