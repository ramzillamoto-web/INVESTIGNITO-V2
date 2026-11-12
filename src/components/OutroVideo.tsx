import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface OutroVideoProps {
  src: string;
  poster: string;
  onFinish: () => void;
}

export const OutroVideo: React.FC<OutroVideoProps> = ({ src, poster, onFinish }) => {
  const [opacity, setOpacity] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [needTapForSound, setNeedTapForSound] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isClosingRef = useRef(false);
  const hasStartedPlayingRef = useRef(false);

  // Safe close handler with 300ms fade-out, guaranteed to call onFinish only once
  const handleFinish = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setOpacity(0);
    setTimeout(() => {
      onFinish();
    }, 300);
  }, [onFinish]);

  // Fade in overlay on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOpacity(1);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Lock page scroll while open and restore afterwards
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Escape key skips
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  // Playback initialization, 3.5s fallback, and 1.5s skip appearance
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 3.5s timeout: fallback straight to popup if video has not started playing
    const fallbackTimer = setTimeout(() => {
      if (!hasStartedPlayingRef.current) {
        handleFinish();
      }
    }, 3500);

    // Skip button appears after 1.5s
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1500);

    // Try unmuted autoplay first
    video.muted = false;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsMuted(false);
          setNeedTapForSound(false);
        })
        .catch(() => {
          // Unmuted autoplay rejected by browser; retry muted and prompt user
          if (videoRef.current && !isClosingRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            setNeedTapForSound(true);
            videoRef.current.play().catch(() => {
              // Muted play also failed
              handleFinish();
            });
          }
        });
    }

    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(skipTimer);
    };
  }, [handleFinish]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setNeedTapForSound(false);
    }
  };

  const handleTapForSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    setIsMuted(false);
    setNeedTapForSound(false);
  };

  return (
    <div
      id="case-outro-overlay"
      className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-300 select-none"
      style={{ opacity }}
    >
      {/* Top Controls Bar with safe-area insets */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between pointer-events-none z-30 pt-[calc(1rem+env(safe-area-inset-top,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))]">
        {/* Mute/Unmute button top-left (>=44px touch target) */}
        <button
          type="button"
          onClick={toggleMute}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-black/75 backdrop-blur-md border border-neutral-700/80 text-white hover:bg-neutral-800 flex items-center justify-center transition-all cursor-pointer pointer-events-auto shadow-2xl active:scale-95"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          title={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Skip button top-right (>=44px touch target, appears after 1.5s) */}
        {showSkip ? (
          <button
            type="button"
            onClick={handleFinish}
            className="min-w-[44px] min-h-[44px] px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-neutral-700/80 text-neutral-200 font-mono text-xs font-black tracking-widest hover:text-white hover:bg-neutral-800 hover:border-neutral-500 flex items-center justify-center transition-all cursor-pointer pointer-events-auto shadow-2xl active:scale-95 animate-fade-in"
            aria-label="Skip video"
          >
            SKIP
          </button>
        ) : (
          <div className="min-w-[44px] min-h-[44px]" />
        )}
      </div>

      {/* Video Container (contained, centered, max height 100dvh) */}
      <div className="relative w-full h-full flex items-center justify-center max-h-[100dvh]">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="auto"
          onPlaying={() => {
            hasStartedPlayingRef.current = true;
          }}
          onEnded={handleFinish}
          onError={handleFinish}
          className="max-h-[100dvh] max-w-full object-contain pointer-events-auto cursor-pointer"
          onClick={needTapForSound ? handleTapForSound : toggleMute}
        />
      </div>

      {/* "Tap for sound" Prompt when muted by browser policy */}
      {needTapForSound && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pb-[env(safe-area-inset-bottom,0px)] z-30 pointer-events-auto animate-fade-in">
          <button
            type="button"
            onClick={handleTapForSound}
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold tracking-wider flex items-center gap-2 shadow-2xl cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-red-400"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Tap for sound</span>
          </button>
        </div>
      )}
    </div>
  );
};
