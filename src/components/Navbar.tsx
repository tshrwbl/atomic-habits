import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  UserCheck, 
  TrendingUp, 
  ClipboardList, 
  Plus, 
  BookOpen, 
  Sun, 
  Moon, 
  RotateCcw,
  Download,
  Upload,
  Share2,
  Bot
} from 'lucide-react';
import { ATOMIC_QUOTES } from '../data/quotes';

interface NavbarProps {
  activeTab: 'habits' | 'identities' | 'compounding' | 'scorecard';
  setActiveTab: (tab: 'habits' | 'identities' | 'compounding' | 'scorecard') => void;
  onOpenAddModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenShareModal: (tab?: 'export' | 'import' | 'prompt') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: () => void;
  totalVotes: number;
  activeStreakCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenTemplatesModal,
  onOpenShareModal,
  darkMode,
  setDarkMode,
  onResetData,
  onExportData,
  onImportData,
  totalVotes,
  activeStreakCount,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ATOMIC_QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const currentQuote = ATOMIC_QUOTES[quoteIndex];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Top motivational banner */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-900 dark:text-amber-300">
              {currentQuote.concept}
            </span>
            <span className="italic truncate text-stone-800 dark:text-stone-200">"{currentQuote.text}"</span>
            <span className="text-stone-600 dark:text-stone-400 hidden sm:inline">— {currentQuote.author}</span>
          </div>
          <button
            onClick={() => setQuoteIndex((prev) => (prev + 1) % ATOMIC_QUOTES.length)}
            title="Next quote"
            className="text-[11px] underline font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white flex-shrink-0 cursor-pointer"
          >
            Next idea
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-stone-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-stone-900 dark:text-white tracking-tight">
                  Atomic Habits
                </h1>
                <span className="hidden md:inline-flex items-center text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  1% Better Daily
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 hidden sm:block">
                Systems &bull; 4 Laws &bull; Identity
              </p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{activeStreakCount} active streaks</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>{totalVotes} identity votes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTemplatesModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              title="Explore James Clear's curated habit stacks"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => onOpenShareModal('export')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-lg transition-colors cursor-pointer"
              title="Share routines with others or import/export JSON"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden xs:inline">Share / JSON</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-lg shadow-sm shadow-amber-500/25 transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Habit</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Settings dropdown / actions */}
            <div className="relative group">
              <button 
                className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title="Data & settings"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block group-focus-within:block bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl p-2 w-52 text-xs z-50">
                <button
                  onClick={() => onOpenShareModal('export')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Share & Import / Export</span>
                </button>
                <button
                  onClick={() => onOpenShareModal('prompt')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Prompt (Copy Prompt)</span>
                </button>
                <div className="h-px bg-stone-200 dark:bg-stone-700 my-1" />
                <button
                  onClick={onExportData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Quick Download JSON</span>
                </button>
                <button
                  onClick={onImportData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Quick Upload JSON</span>
                </button>
                <div className="h-px bg-stone-200 dark:bg-stone-700 my-1" />
                <button
                  onClick={onResetData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Habits</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-stone-100 dark:border-stone-800/80 pt-1 -mb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'habits'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Habit Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('identities')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'identities'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Identity & Votes</span>
          </button>

          <button
            onClick={() => setActiveTab('compounding')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'compounding'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1% Better Daily</span>
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'scorecard'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Habit Scorecard</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
