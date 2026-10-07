import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  BookOpen, 
  Calendar,
  Sun,
  Sunset,
  Moon,
  Clock,
  Share2,
  Zap,
  Target
} from 'lucide-react';
import { Habit, TimeOfDay } from '../types';
import { HabitCard } from './HabitCard';
import { getTodayDateString } from '../utils/dateUtils';

interface HabitListProps {
  habits: Habit[];
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenAddModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenBetterment?: (habit: Habit) => void;
  onShareHabit?: (habit: Habit) => void;
  onOpenShareModal?: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onOpenAddModal,
  onOpenTemplatesModal,
  onOpenBetterment,
  onShareHabit,
  onOpenShareModal,
}) => {
  const [selectedTime, setSelectedTime] = useState<'all' | TimeOfDay>('all');
  const [selectedIdentity, setSelectedIdentity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = getTodayDateString();

  // Unique identities
  const identities = useMemo(() => {
    const set = new Set<string>();
    habits.forEach((h) => {
      if (h.identity) set.add(h.identity);
    });
    return Array.from(set);
  }, [habits]);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      if (selectedTime !== 'all' && h.timeOfDay !== selectedTime && h.timeOfDay !== 'anytime') {
        return false;
      }
      if (selectedIdentity !== 'all' && h.identity !== selectedIdentity) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = h.title.toLowerCase().includes(q);
        const matchIdentity = h.identity.toLowerCase().includes(q);
        const matchStack = h.habitStack?.after.toLowerCase().includes(q);
        return matchTitle || matchIdentity || matchStack;
      }
      return true;
    });
  }, [habits, selectedTime, selectedIdentity, searchQuery]);

  // Today's summary progress
  const completedTodayCount = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const totalCount = habits.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedTodayCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Flip7 Leaderboard / Mission Control Banner */}
      <div className="relative rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-gold p-6 sm:p-7 shadow-card overflow-hidden">
        {/* Decorative corner fan cards background */}
        <div className="absolute right-3 -bottom-8 opacity-10 pointer-events-none hidden sm:block">
          <div className="w-32 h-32 rounded-3xl border-4 border-f7-teal rotate-12" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black text-f7-teal-dark dark:text-f7-teal-light uppercase tracking-wider mb-1.5">
              <span className="w-6 h-6 rounded-lg bg-f7-gold/25 border border-f7-gold flex items-center justify-center text-f7-coral">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <span>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Today's System Execution
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 font-semibold mt-1 max-w-xl">
              "You do not rise to the level of your goals, you fall to the level of your systems."
            </p>
          </div>

          {/* Game Score Box */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3.5 sm:p-4 rounded-2xl bg-f7-cream border-2 border-f7-gold shadow-accent-glow flex-shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-f7-teal-dark leading-none">
                {completedTodayCount}
              </span>
              <span className="text-ink-2 text-sm font-bold">/ {totalCount} done</span>
            </div>
            <div className="text-xs font-black text-f7-coral-dark mt-1">
              {percentCompleted}% complete today
            </div>
          </div>
        </div>

        {/* Flip7 Progress Bar with glow */}
        <div className="mt-5 w-full bg-surface-2 h-3.5 rounded-full p-0.5 border border-line-strong overflow-hidden">
          <div
            className="bg-gradient-to-r from-f7-teal via-f7-gold to-f7-coral h-full rounded-full transition-all duration-500 shadow-teal-glow"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Filter Toolbar (Flip7 Pills & Cream Search Bar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Time of day pill buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedTime('all')}
            className={`f7-pill ${selectedTime === 'all' ? 'f7-pill-gold' : ''}`}
            aria-pressed={selectedTime === 'all'}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>All Times</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTime('morning')}
            className={`f7-pill ${selectedTime === 'morning' ? 'f7-pill-gold' : ''}`}
            aria-pressed={selectedTime === 'morning'}
          >
            <Sun className="w-3.5 h-3.5 text-f7-gold-dark" />
            <span>Morning</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTime('afternoon')}
            className={`f7-pill ${selectedTime === 'afternoon' ? 'f7-pill-gold' : ''}`}
            aria-pressed={selectedTime === 'afternoon'}
          >
            <Sunset className="w-3.5 h-3.5 text-f7-coral" />
            <span>Afternoon</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTime('evening')}
            className={`f7-pill ${selectedTime === 'evening' ? 'f7-pill-gold' : ''}`}
            aria-pressed={selectedTime === 'evening'}
          >
            <Moon className="w-3.5 h-3.5 text-f7-sky" />
            <span>Evening</span>
          </button>
        </div>

        {/* Search & Identity selector */}
        <div className="flex items-center gap-2.5">
          {/* Identity filter */}
          {identities.length > 0 && (
            <select
              value={selectedIdentity}
              onChange={(e) => setSelectedIdentity(e.target.value)}
              aria-label="Filter by Identity"
              className="f7-input !w-auto text-xs py-2 px-3.5 font-bold cursor-pointer"
            >
              <option value="all">All Identities ({identities.length})</option>
              {identities.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          )}

          {/* Search bar */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search habits"
              className="f7-input text-xs pl-9 pr-3.5 py-2 font-bold"
            >
            </input>
          </div>
        </div>
      </div>

      {/* Habits Grid / List */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleDate={onToggleDate}
              onEditHabit={onEditHabit}
              onDeleteHabit={onDeleteHabit}
              onOpenBetterment={onOpenBetterment}
              onShareHabit={onShareHabit}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-14 px-6 rounded-3xl border-3 border-dashed border-line bg-surface/60 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-f7-gold/25 border-2 border-f7-gold flex items-center justify-center text-f7-gold-dark mb-3 shadow-accent-glow">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-black text-ink text-lg">
            No habits match your filters
          </h3>
          <p className="text-xs text-ink-3 font-semibold max-w-sm mx-auto mt-1 mb-5">
            Adjust your time of day or search filter, or deal yourself a new atomic habit to start compounding.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="f7-btn f7-btn-gold text-xs px-5 py-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Deal New Habit</span>
            </button>
            <button
              type="button"
              onClick={onOpenTemplatesModal}
              className="f7-btn f7-btn-secondary text-xs px-5 py-2"
            >
              <BookOpen className="w-4 h-4 text-f7-teal" />
              <span>Browse Templates</span>
            </button>
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="f7-btn f7-btn-teal text-xs px-5 py-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Import JSON</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="f7-btn f7-btn-gold px-6 py-2.5 text-xs shadow-accent-glow"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Another Atomic Habit</span>
        </button>

        {onOpenShareModal && (
          <button
            type="button"
            onClick={onOpenShareModal}
            className="f7-btn f7-btn-secondary px-6 py-2.5 text-xs"
          >
            <Share2 className="w-4 h-4 text-f7-teal" />
            <span>Share & Import / Export JSON</span>
          </button>
        )}
      </div>
    </div>
  );
};
