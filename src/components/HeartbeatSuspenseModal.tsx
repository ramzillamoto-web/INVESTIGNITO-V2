import React, { useEffect, useState, useRef } from 'react';
import { Heart, Activity } from 'lucide-react';

interface HeartbeatSuspenseModalProps {
  isOpen: boolean;
  suspectName: string;
  pageNumber: number;
  isMatch: boolean;
  onComplete: (match: boolean) => void;
}

export const HeartbeatSuspenseModal: React.FC<HeartbeatSuspenseModalProps> = ({
  isOpen,
  suspectName,
  pageNumber,
  isMatch,
  onComplete,
}) => {
  const [fillPercent, setFillPercent] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const isMatchRef = useRef(isMatch);
  isMatchRef.current = isMatch;
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFillPercent(0);
      setSecondsRemaining(3);
      return;
    }

    // Start filling bar smoothly from 0 to 100% over exact 3.0 seconds
    const startTimer = setTimeout(() => {
      setFillPercent(100);
    }, 20);

    // Audio setup for fast heartbeat
    let ctx: AudioContext | null = null;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        audioCtxRef.current = ctx;
      }
    } catch {
      // Audio fallback
    }

    // Schedule accelerating heartbeat thumps on audio timeline
    const scheduleHeartThump = (timeOffsetSec: number) => {
      if (!ctx || ctx.state === 'closed') return;
      try {
        const t1 = ctx.currentTime + timeOffsetSec;
        const t2 = t1 + 0.09;

        // First thump (lub)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(60, t1);
        osc1.frequency.exponentialRampToValueAtTime(28, t1 + 0.08);
        gain1.gain.setValueAtTime(0.001, t1);
        gain1.gain.linearRampToValueAtTime(0.7, t1 + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, t1 + 0.09);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t1);
        osc1.stop(t1 + 0.1);

        // Second thump (DUB)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(75, t2);
        osc2.frequency.exponentialRampToValueAtTime(32, t2 + 0.11);
        gain2.gain.setValueAtTime(0.001, t2);
        gain2.gain.linearRampToValueAtTime(0.9, t2 + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.13);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.14);
      } catch {
        // Safe fallback
      }
    };

    // Play reveal sound right when 3-second timer expires
    const playRevealSound = (victory: boolean) => {
      if (!ctx || ctx.state === 'closed') return;
      try {
        const t = ctx.currentTime;
        if (!victory) {
          const oscA = ctx.createOscillator();
          const oscB = ctx.createOscillator();
          const gain = ctx.createGain();
          oscA.type = 'sawtooth';
          oscA.frequency.setValueAtTime(140, t);
          oscA.frequency.exponentialRampToValueAtTime(45, t + 0.4);
          oscB.type = 'square';
          oscB.frequency.setValueAtTime(70, t);
          oscB.frequency.exponentialRampToValueAtTime(30, t + 0.4);
          gain.gain.setValueAtTime(0.85, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          oscA.connect(gain);
          oscB.connect(gain);
          gain.connect(ctx.destination);
          oscA.start(t);
          oscB.start(t);
          oscA.stop(t + 0.45);
          oscB.stop(t + 0.45);
        } else {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.03);
            g.gain.setValueAtTime(0.35, t + i * 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(t + i * 0.03);
            osc.stop(t + 0.7);
          });
        }
      } catch {
        // Safe fallback
      }
    };

    // Fast accelerating heartbeat thumps across 3 seconds
    const beatOffsets = [0.0, 0.42, 0.82, 1.20, 1.56, 1.90, 2.22, 2.52, 2.80];
    beatOffsets.forEach((sec) => scheduleHeartThump(sec));

    // Countdown second tickers (3 -> 2 -> 1)
    const t1 = setTimeout(() => setSecondsRemaining(2), 1000);
    const t2 = setTimeout(() => setSecondsRemaining(1), 2000);

    // EXACT 3-SECOND COMPLETE: Immediately trigger reveal sound and result!
    const completeTimer = setTimeout(() => {
      playRevealSound(isMatchRef.current);
      onCompleteRef.current(isMatchRef.current);
    }, 3000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(completeTimer);
      if (ctx && ctx.state !== 'closed') {
        try {
          ctx.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="heartbeat-suspense-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in select-none"
    >
      {/* Red Ambient Pulsing Vignette */}
      <div className="absolute inset-0 pointer-events-none animate-heartbeat-vignette" />

      {/* Main Suspense Container */}
      <div className="relative z-10 max-w-lg w-full rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-neutral-950/95 border-2 border-red-600 shadow-2xl shadow-red-950/80 ring-2 ring-red-600/40">
        {/* Top Header Tag */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/90 border border-red-600/80 text-red-400 font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 shadow-md">
          <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>VERIFYING ACCUSATION WARRANT</span>
        </div>

        {/* Central Heartbeat Visual with Fast Heartbeat */}
        <div className="relative my-4 sm:my-6 flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40">
          {/* Shockwave Rings */}
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-red-600/60 animate-pulse-ring" />
          <div
            className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-red-500/40 animate-pulse-ring"
            style={{ animationDelay: '0.45s' }}
          />

          {/* Beating Heart Icon */}
          <div className="relative z-10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 border-2 border-red-400 shadow-2xl shadow-red-600/70 animate-fast-heartbeat">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white fill-current drop-shadow-lg" />
          </div>
        </div>

        {/* Fast Pulse Rate & Countdown */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-red-500">
            {secondsRemaining}s
          </span>
          <span className="text-xs font-mono font-bold uppercase text-neutral-300 tracking-widest">
            VERIFYING • FAST HEARTBEAT
          </span>
        </div>

        {/* Accused Suspect Identity Details */}
        <div className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3 sm:p-4 mb-4 text-center">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider block mb-1">
            TARGET OF ACCUSATION WARRANT:
          </span>
          <h2 className="text-lg sm:text-2xl font-black font-display uppercase tracking-tight text-white truncate">
            {suspectName || 'Unknown Suspect'}
          </h2>
          <span className="text-[10px] sm:text-xs font-mono text-red-400 font-bold uppercase tracking-wide">
            Registry Ledger Page #{pageNumber}
          </span>
        </div>

        {/* 3-Second Loading Bar with Smooth CSS Linear Transition */}
        <div className="w-full bg-neutral-900 border border-neutral-700 rounded-full h-3 sm:h-3.5 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500"
            style={{
              width: `${fillPercent}%`,
              transition: 'width 3000ms linear',
            }}
          />
        </div>

        <p className="text-[10px] sm:text-xs font-mono text-neutral-400 mt-2.5 uppercase font-bold tracking-wider">
          Forensic verification completing in {secondsRemaining}s...
        </p>
      </div>
    </div>
  );
};
