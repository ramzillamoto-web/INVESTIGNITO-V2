// PWA, Push Notification, and Fullscreen Utilities

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua);
  return isMobileUA || (isTouch && window.innerWidth <= 820);
}

export function isIos(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isIosStandalone = (window.navigator as any).standalone === true;
  return isStandalone || isFullscreen || isIosStandalone;
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  // Safety check: in dev/preview environments, always unregister to prevent white screens
  const isDevOrPreview =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('run.app') ||
    window.location.hostname.includes('webcontainer') ||
    window.location.port !== '';

  if (isDevOrPreview) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('[PWA] Service Worker registered with scope:', registration.scope);
      return registration;
    })
    .catch((error) => {
      console.warn('[PWA] Service Worker registration failed:', error);
      return null;
    });
}

export async function requestPushNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await sendLocalNotification(
        'INVESTIGNITO • Case Alert Enabled!',
        'Push notifications are active. You will receive notifications when new weekly murder puzzles are released!'
      );
    }
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

export async function sendLocalNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-32.png',
          vibrate: [200, 100, 200],
          data: { url: '/' },
          tag: 'investignito-local-alert',
          renotify: true
        } as any);
        return true;
      }
    }

    // Fallback to standard browser notification
    new Notification(title, {
      body,
      icon: '/icon-192.png'
    });
    return true;
  } catch (err) {
    console.error('Error triggering local notification:', err);
    return false;
  }
}

export function toggleFullScreen(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const doc = document as any;
  const docEl = document.documentElement as any;

  const isFs =
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement;

  if (!isFs) {
    if (docEl.requestFullscreen) {
      return docEl.requestFullscreen().catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
      return docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      return docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      return docEl.msRequestFullscreen();
    }
  } else {
    if (doc.exitFullscreen) {
      return doc.exitFullscreen().catch(() => {});
    } else if (doc.webkitExitFullscreen) {
      return doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      return doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      return doc.msExitFullscreen();
    }
  }
  return Promise.resolve();
}

export function isCurrentlyFullScreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}
