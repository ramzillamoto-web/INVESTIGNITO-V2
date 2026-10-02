import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, X, ShieldAlert } from 'lucide-react';
import { formatTime } from '../utils/storage';

interface CooldownModalProps {
  isOpen: boolean;
  cooldownUntil: number | null;
  onClose: () => void;
}

export const CooldownModal: React.FC<CooldownModalProps> = ({
  isOpen,
  cooldownUntil,
  onClose,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    if (!cooldownUntil) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const remainingMs = cooldownUntil - Date.now();
      if (remainingMs <= 0) {
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(Math.ceil(remainingMs / 1000));
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [cooldownUntil, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="failed-submission-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cooldown-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-neutral-900 border-2 border-red-600 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-600 text-white mx-auto flex items-center justify-center mb-4 shadow-xl shadow-red-950/80">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500 block mb-1">
            FALSE ACCUSATION PENALTY
          </span>
          <h3 className="text-2xl font-black font-display uppercase tracking-tight text-white">
            Accusation Rejected
          </h3>
        </div>

        {/* Required Message Notice */}
        <div className="bg-[#0a0a0a] border-2 border-red-600/80 rounded-xl p-5 mb-6 text-center">
          <p className="text-base font-black text-red-500 uppercase tracking-tight mb-2">
            "the name did not match, try again in 5 minutes"
          </p>
          <p className="text-xs text-neutral-400 font-medium leading-relaxed">
            The evidence does not substantiate this suspect or page number. Forensic protocols mandate a 5-minute review period before filing another warrant.
          </p>
        </div>

        {/* Cooldown Timer Box */}
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800 flex items-center justify-between mb-6 font-mono">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-red-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>COOLDOWN REMAINING:</span>
          </div>
          <span
            id="modal-cooldown-timer"
            className="text-xl font-black text-red-500 tracking-widest"
          >
            {formatTime(remainingSeconds)}
          </span>
        </div>

        <button
          id="modal-continue-investigating-btn"
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono uppercase tracking-widest font-black transition-colors border border-neutral-700"
        >
          Return to Evidence & Clues
        </button>
      </div>
    </div>
  );
};
