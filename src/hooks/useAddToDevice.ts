import { useState, useEffect, useCallback } from 'react';
import { isStandalonePWA } from '../utils/pwa';
import { ENABLE_ADD_TO_DEVICE } from '../config/features';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Module-level cache for beforeinstallprompt in case it fires before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function useAddToDevice() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isStandalone, setIsStandalone] = useState<boolean>(() => isStandalonePWA());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!ENABLE_ADD_TO_DEVICE) return;

    setIsStandalone(isStandalonePWA());

    if (globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const triggerAddToDevice = useCallback(async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;

    // If the browser provides a native automated prompt (e.g. Chrome on Android or Desktop)
    if (promptEvent && !isStandalone) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsStandalone(true);
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Native prompt failed, falling back to visual instructions:', err);
      }
    }

    // If native prompt is unavailable (like on iOS Safari) or was dismissed, open the clear step-by-step instructions
    setIsModalOpen(true);
  }, [deferredPrompt, isStandalone]);

  const installApp = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;

    if (promptEvent && !isStandalone) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsStandalone(true);
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Native install prompt error:', err);
      }
    }

    setIsModalOpen(true);
    return 'manual';
  }, [deferredPrompt, isStandalone]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return {
    deferredPrompt: deferredPrompt || globalDeferredPrompt,
    isStandalone,
    isModalOpen,
    triggerAddToDevice,
    installApp,
    openModal,
    closeModal,
  };
}
