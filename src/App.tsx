import { useState, useEffect } from 'react';
import { 
  Habit, 
  ScorecardItem, 
  ScorecardRating, 
  HabitTemplate,
} from './types';
import { INITIAL_HABITS, INITIAL_SCORECARD } from './data/initialHabits';
import { Navbar } from './components/Navbar';
import { HabitList } from './components/HabitList';
import { IdentitySection } from './components/IdentitySection';
import { CompoundingStats } from './components/CompoundingStats';
import { HabitScorecard } from './components/HabitScorecard';
import { AddHabitModal } from './components/AddHabitModal';
import { TemplatesModal } from './components/TemplatesModal';
import { BettermentModal } from './components/BettermentModal';
import { ShareModal } from './components/ShareModal';
import { InstallPrompt } from './components/InstallPrompt';
import { getTodayDateString, calculateStreak } from './utils/dateUtils';
import { Flame, UserCheck, TrendingUp, ClipboardList, Plus } from 'lucide-react';

const STORAGE_KEY_HABITS = 'atomic_habits_data_v2';
const STORAGE_KEY_SCORECARD = 'atomic_scorecard_data_v2';
const STORAGE_KEY_THEME = 'atomic_theme_mode';

export function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<'habits' | 'identities' | 'compounding' | 'scorecard'>('habits');

  // Habits state with localStorage
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse habits from storage', e);
    }
    return INITIAL_HABITS;
  });

  // Scorecard state with localStorage
  const [scorecard, setScorecard] = useState<ScorecardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCORECARD);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse scorecard from storage', e);
    }
    return INITIAL_SCORECARD;
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // 1% Betterment Engine modal state
  const [bettermentHabit, setBettermentHabit] = useState<Habit | null>(null);
  const [isBettermentOpen, setIsBettermentOpen] = useState(false);

  // Share & Import/Export modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePreselectedHabitId, setSharePreselectedHabitId] = useState<string | null>(null);

  // Sync dark mode class on <html> and meta theme-color
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#0c0a09');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#fafaf9');
    }
  }, [darkMode]);

  // Sync habits to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  }, [habits]);

  // Sync scorecard to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCORECARD, JSON.stringify(scorecard));
  }, [scorecard]);

  // Toggle date completion for habit
  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        const newDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];

        // If toggled on and habit has betterment but no actual logged for this date, default log current baseline/target
        let newLogs = h.bettermentLogs;
        if (!exists && h.betterment?.enabled && (!newLogs || newLogs[dateStr] === undefined)) {
          newLogs = {
            ...(newLogs || {}),
            [dateStr]: h.betterment.baselineValue,
          };
        }

        return { ...h, completedDates: newDates, bettermentLogs: newLogs };
      })
    );
  };

  // Add or update habit
  const handleSaveHabit = (
    data: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setHabits((prev) =>
        prev.map((h) => (h.id === existingId ? { ...h, ...data } : h))
      );
    } else {
      const newHabit: Habit = {
        ...data,
        id: `habit-${Date.now()}`,
        completedDates: [],
        createdAt: getTodayDateString(),
      };
      setHabits((prev) => [newHabit, ...prev]);
    }
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    }
  };

  // 1% Betterment Engine modal opener
  const handleOpenBetterment = (habit: Habit) => {
    setBettermentHabit(habit);
    setIsBettermentOpen(true);
  };

  // Share modal opener
  const handleOpenShareModal = (habitId?: string) => {
    setSharePreselectedHabitId(habitId || null);
    setIsShareModalOpen(true);
  };

  // Import habits handler
  const handleImportHabits = (importedHabits: Habit[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setHabits(importedHabits);
    } else {
      // Merge: generate unique IDs for incoming habits that already exist
      const existingIds = new Set(habits.map((h) => h.id));
      const sanitized = importedHabits.map((h, idx) => ({
        ...h,
        id: existingIds.has(h.id) ? `imported-${Date.now()}-${idx}` : h.id,
      }));
      setHabits((prev) => [...sanitized, ...prev]);
    }
  };

  // Update habit's 1% Betterment Engine configuration or logged metric
  const handleUpdateHabitBetterment = (
    habitId: string,
    bettermentConfig: Habit['betterment'],
    loggedValue?: number,
    logDate?: string
  ) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const updatedHabit = { ...h, betterment: bettermentConfig };

        if (loggedValue !== undefined && logDate) {
          const updatedLogs = {
            ...(h.bettermentLogs || {}),
            [logDate]: loggedValue,
          };
          const updatedCompleted = h.completedDates.includes(logDate)
            ? h.completedDates
            : [...h.completedDates, logDate];

          updatedHabit.bettermentLogs = updatedLogs;
          updatedHabit.completedDates = updatedCompleted;
        }

        return updatedHabit;
      })
    );
  };

  // Add from template
  const handleSelectTemplate = (template: HabitTemplate) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: template.title,
      identity: template.identity,
      timeOfDay: template.timeOfDay,
      habitStack: {
        after: template.stackAfter,
        then: template.title,
      },
      twoMinuteVersion: template.twoMinuteVersion,
      attractiveReward: template.attractiveReward,
      completedDates: [],
      createdAt: getTodayDateString(),
      betterment: template.betterment,
    };
    setHabits((prev) => [newHabit, ...prev]);
  };

  // Scorecard item handlers
  const handleAddScorecardItem = (item: Omit<ScorecardItem, 'id'>) => {
    const newItem: ScorecardItem = {
      ...item,
      id: `sc-${Date.now()}`,
    };
    setScorecard((prev) => [newItem, ...prev]);
  };

  const handleDeleteScorecardItem = (id: string) => {
    setScorecard((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateScorecardRating = (id: string, rating: ScorecardRating) => {
    setScorecard((prev) =>
      prev.map((i) => (i.id === id ? { ...i, rating } : i))
    );
  };

  const handleConvertToHabit = (name: string) => {
    setEditingHabit({
      id: '',
      title: name,
      identity: 'Better Self',
      timeOfDay: 'morning',
      habitStack: { after: 'my morning routine', then: name },
      twoMinuteVersion: 'Do 2 minutes',
      completedDates: [],
      createdAt: getTodayDateString(),
    });
    setIsAddModalOpen(true);
  };

  // Reset to initial demo habits
  const handleResetData = () => {
    if (window.confirm('Reset all habits and scorecard data back to default demo data?')) {
      setHabits(INITIAL_HABITS);
      setScorecard(INITIAL_SCORECARD);
    }
  };

  // Direct quick backup data
  const handleExportData = () => {
    const payload = { habits, scorecard, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atomic-habits-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct quick restore data
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
          else if (Array.isArray(parsed)) setHabits(parsed);
          if (Array.isArray(parsed.scorecard)) setScorecard(parsed.scorecard);
          alert('Data restored successfully!');
        } catch {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Stats calculation
  const totalVotes = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const activeStreakCount = habits.filter((h) => calculateStreak(h.completedDates).currentStreak > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-20 md:pb-8">
      {/* PWA Mobile Installation Prompt */}
      <InstallPrompt />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingHabit(null);
          setIsAddModalOpen(true);
        }}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        onOpenShareModal={() => handleOpenShareModal()}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        totalVotes={totalVotes}
        activeStreakCount={activeStreakCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'habits' && (
          <HabitList
            habits={habits}
            onToggleDate={handleToggleHabitDate}
            onEditHabit={(h) => {
              setEditingHabit(h);
              setIsAddModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onOpenAddModal={() => {
              setEditingHabit(null);
              setIsAddModalOpen(true);
            }}
            onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
            onOpenBetterment={handleOpenBetterment}
            onShareHabit={(h) => handleOpenShareModal(h.id)}
            onOpenShareModal={() => handleOpenShareModal()}
          />
        )}

        {activeTab === 'identities' && (
          <IdentitySection
            habits={habits}
            onOpenAddModal={() => {
              setEditingHabit(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'compounding' && (
          <CompoundingStats 
            habits={habits} 
            onOpenBetterment={handleOpenBetterment}
          />
        )}

        {activeTab === 'scorecard' && (
          <HabitScorecard
            items={scorecard}
            onAddItem={handleAddScorecardItem}
            onDeleteItem={handleDeleteScorecardItem}
            onUpdateRating={handleUpdateScorecardRating}
            onConvertToHabit={handleConvertToHabit}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (app-like feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-3 py-1 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'habits' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span>Habits</span>
        </button>

        <button
          onClick={() => setActiveTab('identities')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'identities' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span>Identity</span>
        </button>

        {/* Center Mobile + Button */}
        <button
          onClick={() => {
            setEditingHabit(null);
            setIsAddModalOpen(true);
          }}
          className="-mt-5 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95"
          title="Add New Habit"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('compounding')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'compounding' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>1% Daily</span>
        </button>

        <button
          onClick={() => setActiveTab('scorecard')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'scorecard' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span>Scorecard</span>
        </button>
      </div>

      {/* Add / Edit Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        editingHabit={editingHabit}
      />

      {/* Curated Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* 1% Betterment Engine Modal */}
      <BettermentModal
        habit={bettermentHabit}
        isOpen={isBettermentOpen}
        onClose={() => {
          setIsBettermentOpen(false);
          setBettermentHabit(null);
        }}
        onUpdateHabitBetterment={handleUpdateHabitBetterment}
      />

      {/* Share & Import / Export JSON Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharePreselectedHabitId(null);
        }}
        habits={habits}
        onImportHabits={handleImportHabits}
        preSelectedHabitId={sharePreselectedHabitId}
      />
    </div>
  );
}
export default App;
