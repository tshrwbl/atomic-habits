import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isInStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true);
    setIsStandalone(isInStandalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || dismissed || installed) {
    return null;
  }

  // If there's an install prompt or it's iOS
  const canInstall = !!deferredPrompt || isIOS;
  if (!canInstall) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-900 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Smartphone className="w-4 h-4 text-stone-950" />
          </div>
          <div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Install Atomic Habits as a Mobile App
            </span>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
              {isIOS 
                ? 'Tap Share icon below, then select "Add to Home Screen" to install.'
                : 'Fast access, offline tracking, and home screen launch icon.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-stone-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install App</span>
            </button>
          )}

          {isIOS && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] bg-stone-200/90 dark:bg-stone-800 px-2.5 py-1 rounded-md text-stone-800 dark:text-stone-200 font-medium">
              <Share2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Share &rarr; Add to Home Screen</span>
            </div>
          )}

          {installed && (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Installed</span>
            </div>
          )}

          <button
            onClick={() => setDismissed(true)}
            title="Dismiss"
            className="p-1 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
