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
    <aside aria-label="Install App Banner" className="bg-f7-cream dark:bg-surface-2 border-b-2 border-dashed border-f7-gold dark:border-line px-4 py-3 text-xs text-ink transition-colors shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-f7-gold text-ink border-2 border-f7-gold-dark flex items-center justify-center flex-shrink-0 shadow-accent-glow">
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-ink block truncate sm:inline text-sm">
              Install Atomic Habits App
            </span>
            <p className="text-xs text-ink-3 font-semibold">
              {isIOS 
                ? 'Tap Share below, then select "Add to Home Screen" to install.'
                : 'Enjoy instant offline access and full-screen experience on your mobile device.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="f7-btn f7-btn-gold px-4 py-1.5 text-xs shadow-accent-glow"
            >
              <Download className="w-3.5 h-3.5 stroke-[3]" />
              <span>Install</span>
            </button>
          )}

          {isIOS && (
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-surface border-2 border-line px-3 py-1.5 rounded-full text-ink-2 font-bold shadow-xs">
              <Share2 className="w-3.5 h-3.5 text-f7-teal" />
              <span>Share &rarr; Add to Home Screen</span>
            </div>
          )}

          {installed && (
            <div className="inline-flex items-center gap-1 text-f7-teal-dark dark:text-f7-teal-light font-black text-xs">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Installed!</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            title="Dismiss installation banner"
            aria-label="Dismiss installation banner"
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-ink-3 hover:text-ink cursor-pointer transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
