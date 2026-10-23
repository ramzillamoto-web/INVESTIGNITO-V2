import { useState, useEffect, useCallback } from 'react';
import { isStandalonePWA } from '../utils/pwa';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useAddToDevice() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsStandalone(isStandalonePWA());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setIsModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerAddToDevice = useCallback(async () => {
    // If the browser provides a native automated prompt (e.g. Chrome on Android or Desktop)
    if (deferredPrompt && !isStandalone) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsStandalone(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Native prompt failed, falling back to visual instructions:', err);
      }
    }

    // If native prompt is unavailable (like on iOS Safari) or was cancelled, open the clear step-by-step instructions
    setIsModalOpen(true);
  }, [deferredPrompt, isStandalone]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return {
    deferredPrompt,
    isStandalone,
    isModalOpen,
    triggerAddToDevice,
    openModal,
    closeModal,
  };
}
