import { useEffect, useState } from 'react';

export function useServiceWorkerUpdate() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkUpdate = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      registration.addEventListener('updatefound', () => {
        newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setNeedsUpdate(true);
          }
        });
      });
    };

    checkUpdate();

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const dismiss = () => setNeedsUpdate(false);

  return { needsUpdate, applyUpdate, dismiss };
}
