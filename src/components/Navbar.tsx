import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  UserCheck, 
  TrendingUp, 
  ClipboardList, 
  Plus, 
  BookOpen, 
  Sun, 
  Moon, 
  Monitor, 
  RotateCcw, 
  Download, 
  Upload, 
  Share2, 
  MoreHorizontal, 
  Check, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { ATOMIC_QUOTES } from '../data/quotes';
import { useDismissible } from '../hooks/useDismissible';

export type ThemePreference = 'light' | 'dark' | 'system';
export type TabKey = 'habits' | 'identities' | 'compounding' | 'scorecard';

interface NavbarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onOpenAddModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenShareModal: () => void;
  themePreference: ThemePreference;
  setThemePreference: (val: ThemePreference) => void;
  resolvedDark: boolean;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: () => void;
  totalVotes: number;
  activeStreakCount: number;
}

export const NAV_TABS: { key: TabKey; label: string; short: string; emoji: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'habits', label: 'Habit Tracker', short: 'Habits', emoji: '🃏', icon: Flame },
  { key: 'identities', label: 'Identity & Votes', short: 'Identity', emoji: '🏆', icon: UserCheck },
  { key: 'compounding', label: '1% Better Daily', short: '1% Daily', emoji: '📈', icon: TrendingUp },
  { key: 'scorecard', label: 'Habit Scorecard', short: 'Scorecard', emoji: '📋', icon: ClipboardList },
];

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Monitor },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenTemplatesModal,
  onOpenShareModal,
  themePreference,
  setThemePreference,
  resolvedDark,
  onResetData,
  onExportData,
  onImportData,
  totalVotes,
  activeStreakCount,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const themeMenu = useDismissible();
  const moreMenu = useDismissible();

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ATOMIC_QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const currentQuote = ATOMIC_QUOTES[quoteIndex];
  const ThemeIcon = themePreference === 'system' ? Monitor : resolvedDark ? Moon : Sun;

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b-2 border-line transition-colors">
      {/* Flip7 Retro Ribbon Motivational Banner */}
      <div className="bg-f7-cream text-f7-teal-dark border-b-2 border-f7-teal-dark py-1.5 px-4 text-xs font-bold shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            {/* Retro Ribbon Tag */}
            <span className="bg-f7-teal text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-f7-teal-dark flex-shrink-0 shadow-xs">
              {currentQuote.concept}
            </span>
            <span className="truncate italic text-f7-teal-dark font-medium">"{currentQuote.text}"</span>
            <span className="hidden sm:inline text-f7-teal-dark/70 font-semibold">— {currentQuote.author}</span>
          </div>

          <button
            type="button"
            onClick={() => setQuoteIndex((prev) => (prev + 1) % ATOMIC_QUOTES.length)}
            className="flex items-center gap-1 text-[11px] font-extrabold text-f7-coral-dark hover:text-f7-coral underline cursor-pointer flex-shrink-0"
          >
            <span>Next Card</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Flip7 Board Game Inspired Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Fan Cards + 3D Skew Logo Container */}
            <div className="relative flex items-center justify-center w-14 h-12 flex-shrink-0">
              {/* 5 Fanned Cards behind */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="absolute w-6 h-9 rounded-md bg-f7-coral border border-f7-coral-dark shadow-xs -rotate-24 -translate-x-3.5 opacity-90" />
                <span className="absolute w-6 h-9 rounded-md bg-f7-sky border border-f7-teal-dark shadow-xs -rotate-12 -translate-x-1.5 opacity-90" />
                <span className="absolute w-6 h-9 rounded-md bg-f7-gold border border-f7-gold-dark shadow-xs rotate-0 opacity-95" />
                <span className="absolute w-6 h-9 rounded-md bg-f7-teal border border-f7-teal-dark shadow-xs rotate-12 translate-x-1.5 opacity-90" />
                <span className="absolute w-6 h-9 rounded-md bg-f7-coral-light border border-f7-coral-dark shadow-xs rotate-24 translate-x-3.5 opacity-90" />
              </div>

              {/* Flip7 Parallelogram Badge */}
              <div className="relative z-10 -rotate-3 -skew-x-6 bg-f7-cream px-2 py-0.5 rounded-md border-2 border-f7-teal-dark shadow-md flex items-baseline">
                <span className="font-black text-sm tracking-tighter text-f7-teal-dark">FLIP</span>
                <span className="font-black text-lg text-f7-gold-dark rotate-6 ml-0.5" style={{ textShadow: '1px 1px 0 #1E8C86, -1px -1px 0 #1E8C86' }}>7</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg text-ink tracking-tight">
                  Atomic Habits
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-f7-gold/25 text-f7-teal-dark border border-f7-gold shadow-xs">
                  <Zap className="w-3 h-3 text-f7-coral fill-f7-coral" />
                  1% Better
                </span>
              </div>
              <p className="text-xs text-ink-3 font-semibold hidden sm:block">
                Systems &bull; 4 Laws &bull; Identity
              </p>
            </div>
          </div>

          {/* Quick stats badges with colored glows */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border-2 border-f7-gold shadow-accent-glow text-ink font-bold text-xs">
              <Flame className="w-4 h-4 text-f7-coral fill-f7-coral" />
              <span>{activeStreakCount} active streaks</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border-2 border-f7-teal shadow-teal-glow text-ink font-bold text-xs">
              <UserCheck className="w-4 h-4 text-f7-teal" />
              <span>{totalVotes} identity votes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTemplatesModal}
              className="hidden sm:inline-flex f7-btn f7-btn-secondary px-3.5 py-1.5 text-xs"
              title="Explore James Clear's curated habit stacks"
            >
              <BookOpen className="w-4 h-4 text-f7-teal" />
              <span>Templates</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="hidden md:inline-flex f7-btn f7-btn-gold px-4 py-1.5 text-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Habit</span>
            </button>

            {/* Theme picker (Flip7 Pill Button) */}
            <div ref={themeMenu.ref} className="relative">
              <button
                type="button"
                onClick={() => themeMenu.setOpen(!themeMenu.open)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border-2 border-line text-ink-2 hover:border-f7-teal hover:text-ink shadow-sm transition-all cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={themeMenu.open}
                aria-label={`Theme: ${themePreference}`}
                title="Change theme"
              >
                <ThemeIcon className="w-4 h-4" />
              </button>
              {themeMenu.open && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-40 bg-surface border-2 border-line rounded-2xl shadow-lg p-1.5 z-50 animate-modal-in">
                  {THEME_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={themePreference === key}
                      onClick={() => {
                        setThemePreference(key);
                        themeMenu.setOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        themePreference === key ? 'bg-f7-teal text-white shadow-xs' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{label}</span>
                      {themePreference === key && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data & settings menu */}
            <div ref={moreMenu.ref} className="relative">
              <button
                type="button"
                onClick={() => moreMenu.setOpen(!moreMenu.open)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border-2 border-line text-ink-2 hover:border-f7-teal hover:text-ink shadow-sm transition-all cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={moreMenu.open}
                aria-label="Data and sharing options"
                title="Data & settings"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {moreMenu.open && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-surface border-2 border-line rounded-2xl shadow-lg p-2 z-50 animate-modal-in">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { moreMenu.setOpen(false); onOpenShareModal(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-f7-teal-dark dark:text-f7-teal-light hover:bg-f7-teal-bg cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share & Import / Export</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { moreMenu.setOpen(false); onOpenTemplatesModal(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-ink-2 hover:bg-surface-2 sm:hidden cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Browse Templates</span>
                  </button>
                  <div className="h-px bg-line my-1.5" />
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-ink-3 px-3 py-1">Backup & Restore</p>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { moreMenu.setOpen(false); onExportData(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-ink-2 hover:bg-surface-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { moreMenu.setOpen(false); onImportData(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-ink-2 hover:bg-surface-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Restore from JSON</span>
                  </button>
                  <div className="h-px bg-line my-1.5" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { moreMenu.setOpen(false); onResetData(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-f7-coral-dark hover:bg-coral-bg cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Demo Habits</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flip7 Navigation Pill Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex gap-2 py-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Game Sections">
          {NAV_TABS.map(({ key, label, emoji }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(key)}
                className={`f7-pill px-4 py-1.5 text-xs font-extrabold ${
                  active ? 'f7-pill-gold' : ''
                }`}
                aria-pressed={active}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
