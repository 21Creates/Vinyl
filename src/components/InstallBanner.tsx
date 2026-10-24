import { useEffect, useState, useCallback } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'vinyl-install-dismissed';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShowPrompt(false);
  }, []);

  return { showPrompt, handleInstall, handleDismiss };
}

export function InstallBanner() {
  const { showPrompt, handleInstall, handleDismiss } = useInstallPrompt();

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-groove-charcoal rounded-xl p-4 shadow-2xl border border-white-label-acid/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white-label-acid/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white-label-acid" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-sleeve-cream">Install Vinyl</p>
          <p className="text-xs text-groove-gray">Listen offline, full-screen, like a native app.</p>
        </div>
        <button onClick={handleInstall} className="px-4 py-2 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold whitespace-nowrap">
          Install
        </button>
        <button onClick={handleDismiss} className="p-1.5 rounded-lg text-groove-gray hover:text-sleeve-cream transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
