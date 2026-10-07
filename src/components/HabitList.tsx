import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Calendar,
  Sun,
  Sunset,
  Moon,
  Clock,
  Share2,
  Archive,
  Layers
} from 'lucide-react';
import { Habit, TimeOfDay } from '../types';
import { HabitCard } from './HabitCard';
import { RoutineCard } from './RoutineCard';
import { 
  getTodayDateString, 
  getCurrentTimeOfDayFilter, 
  getTimeOfDayDescription 
} from '../utils/dateUtils';

interface HabitListProps {
  habits: Habit[];
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleArchiveHabit: (habitId: string) => void;
  onOpenAddModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenBetterment?: (habit: Habit) => void;
  onShareHabit?: (habit: Habit) => void;
  onOpenShareModal?: () => void;
  onAddStepToRoutine?: (parentHabit: Habit) => void;
  onUnlinkStep?: (habitId: string) => void;
  onRenameRoutine?: (routineId: string, newName: string) => void;
  onLinkToRoutine?: (habit: Habit) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onToggleArchiveHabit,
  onOpenAddModal,
  onOpenTemplatesModal,
  onOpenBetterment,
  onShareHabit,
  onOpenShareModal,
  onAddStepToRoutine,
  onUnlinkStep,
  onRenameRoutine,
  onLinkToRoutine,
}) => {
  // Auto-detect current time of day filter (<12pm morning, 12-6pm afternoon, >6pm evening)
  const currentTimeSlot = getCurrentTimeOfDayFilter();
  const [selectedTime, setSelectedTime] = useState<'all' | TimeOfDay>(() => currentTimeSlot);
  const [selectedIdentity, setSelectedIdentity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const todayStr = getTodayDateString();

  // Unique identities
  const identities = useMemo(() => {
    const set = new Set<string>();
    habits.forEach((h) => {
      if (h.identity) set.add(h.identity);
    });
    return Array.from(set);
  }, [habits]);

  // Group habits into Routines (2+ linked habits) and Standalone habits
  const { matchingRoutines, standaloneHabits } = useMemo(() => {
    // 1. Group active/archived habits by routineId
    const routineMap = new Map<string, { id: string; name: string; steps: Habit[] }>();
    const singleCandidateHabits: Habit[] = [];

    // Helper to test if a single habit matches search and identity filters
    const matchesFilter = (h: Habit) => {
      if (showArchived ? !h.archived : h.archived) return false;
      if (selectedIdentity !== 'all' && h.identity !== selectedIdentity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = h.title.toLowerCase().includes(q);
        const matchIdentity = h.identity.toLowerCase().includes(q);
        const matchStack = h.habitStack?.after.toLowerCase().includes(q);
        const matchRoutine = h.routineName?.toLowerCase().includes(q);
        return matchTitle || matchIdentity || matchStack || matchRoutine;
      }
      return true;
    };

    // Separate habits into routine groups or singles
    const allMatchingArchive = habits.filter((h) => (showArchived ? h.archived : !h.archived));
    
    // Collect potential routines
    allMatchingArchive.forEach((h) => {
      if (h.routineId) {
        if (!routineMap.has(h.routineId)) {
          routineMap.set(h.routineId, {
            id: h.routineId,
            name: h.routineName || 'Daily Routine',
            steps: [],
          });
        }
        routineMap.get(h.routineId)!.steps.push(h);
      } else {
        singleCandidateHabits.push(h);
      }
    });

    const routinesResult: { id: string; name: string; steps: Habit[] }[] = [];
    
    // Process routine groups
    routineMap.forEach((routine) => {
      if (routine.steps.length >= 2) {
        // Sort steps by orderInRoutine
        routine.steps.sort((a, b) => (a.orderInRoutine || 1) - (b.orderInRoutine || 1));

        // Check if routine satisfies selectedTime
        const matchesTime =
          selectedTime === 'all' ||
          routine.steps.some(
            (s) => s.timeOfDay === selectedTime || s.timeOfDay === 'anytime'
          );

        // Check if any step satisfies search and identity
        const matchesQuery = routine.steps.some((s) => matchesFilter(s));

        if (matchesTime && matchesQuery) {
          routinesResult.push(routine);
        }
      } else {
        // Routine with only 1 step is treated as a standalone habit
        routine.steps.forEach((s) => singleCandidateHabits.push(s));
      }
    });

    // Filter standalone habits
    const singlesResult = singleCandidateHabits.filter((h) => {
      if (!matchesFilter(h)) return false;
      if (selectedTime !== 'all' && h.timeOfDay !== selectedTime && h.timeOfDay !== 'anytime') {
        return false;
      }
      return true;
    });

    return {
      matchingRoutines: routinesResult,
      standaloneHabits: singlesResult,
    };
  }, [habits, selectedTime, selectedIdentity, searchQuery, showArchived]);

  // Today's summary progress
  const completedTodayCount = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const totalCount = habits.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedTodayCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Today's Overview & Progress Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-emerald-500/10 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              Today's System Execution
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              "You do not rise to the level of your goals, you fall to the level of your systems."
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-stone-900 dark:text-white">
                {completedTodayCount}
              </span>
              <span className="text-stone-600 dark:text-stone-400 text-sm font-medium">/ {totalCount} completed</span>
            </div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {percentCompleted}% for today
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Time of day pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedTime('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTime === 'all'
                ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>All Times</span>
          </button>

          <button
            onClick={() => setSelectedTime('morning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTime === 'morning'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Morning</span>
          </button>

          <button
            onClick={() => setSelectedTime('afternoon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTime === 'afternoon'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-amber-500" />
            <span>Afternoon</span>
          </button>

          <button
            onClick={() => setSelectedTime('evening')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTime === 'evening'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-500" />
            <span>Evening</span>
          </button>
        </div>

        {/* Search & Identity selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showArchived
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
            title={showArchived ? "Hide archived habits" : "Show archived habits"}
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archived</span>
          </button>
          {/* Identity filter */}
          {identities.length > 0 && (
            <select
              value={selectedIdentity}
              onChange={(e) => setSelectedIdentity(e.target.value)}
              title={selectedIdentity === 'all' ? `All Identities (${identities.length})` : selectedIdentity}
              className="w-40 sm:w-44 shrink-0 truncate text-xs bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-3 py-2 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
            >
              <option value="all">All Identities ({identities.length})</option>
              {identities.map((id) => (
                <option key={id} value={id} title={id}>
                  {id}
                </option>
              ))}
            </select>
          )}

          {/* Search bar */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400" />
            <input
              type="text"
              placeholder="Filter habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border-none text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Habits & Routines Section */}
      {matchingRoutines.length > 0 || standaloneHabits.length > 0 ? (
        <div className="space-y-6">
          {/* Routines Block */}
          {matchingRoutines.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>Habit Routines & Stacks ({matchingRoutines.length})</span>
                </div>
              </div>

              <div className="space-y-4">
                {matchingRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routineId={routine.id}
                    routineName={routine.name}
                    steps={routine.steps}
                    onToggleDate={onToggleDate}
                    onEditHabit={onEditHabit}
                    onDeleteHabit={onDeleteHabit}
                    onToggleArchiveHabit={onToggleArchiveHabit}
                    onOpenBetterment={onOpenBetterment}
                    onShareHabit={onShareHabit}
                    onAddStepToRoutine={onAddStepToRoutine}
                    onUnlinkStep={onUnlinkStep}
                    onRenameRoutine={onRenameRoutine}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Standalone Habits Block */}
          {standaloneHabits.length > 0 && (
            <div className="space-y-3">
              {matchingRoutines.length > 0 && (
                <div className="flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Individual Atomic Habits ({standaloneHabits.length})</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standaloneHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggleDate={onToggleDate}
                    onEditHabit={onEditHabit}
                    onDeleteHabit={onDeleteHabit}
                    onToggleArchiveHabit={onToggleArchiveHabit}
                    onOpenBetterment={onOpenBetterment}
                    onShareHabit={onShareHabit}
                    onLinkToRoutine={onLinkToRoutine}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-base">
            No habits match your filters
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your time of day or search filters, or create a new atomic habit to anchor your routine.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Habit</span>
            </button>
            <button
              onClick={onOpenTemplatesModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Use Template</span>
            </button>
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Import JSON</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Actions Card */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
        >
          <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Add Another Atomic Habit</span>
        </button>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Share & Import / Export JSON</span>
          </button>
        )}
      </div>
    </div>
  );
};
