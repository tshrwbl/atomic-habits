import React, { useState } from 'react';
import { ClipboardList, Plus, Trash2, ArrowRight, Check, Sparkles, Filter } from 'lucide-react';
import { ScorecardItem, ScorecardRating } from '../types';

interface HabitScorecardProps {
  items: ScorecardItem[];
  onAddItem: (item: Omit<ScorecardItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateRating: (id: string, rating: ScorecardRating) => void;
  onConvertToHabit: (name: string) => void;
}

export const HabitScorecard: React.FC<HabitScorecardProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onUpdateRating,
  onConvertToHabit,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemRating, setNewItemRating] = useState<ScorecardRating>('positive');
  const [newItemTime, setNewItemTime] = useState<'morning' | 'day' | 'evening'>('morning');
  const [filterTime, setFilterTime] = useState<'all' | 'morning' | 'day' | 'evening'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem({
      name: newItemName.trim(),
      rating: newItemRating,
      timeOfDay: newItemTime,
    });
    setNewItemName('');
  };

  const filteredItems = items.filter((i) => {
    if (filterTime !== 'all' && i.timeOfDay !== filterTime) return false;
    return true;
  });

  const positiveCount = items.filter((i) => i.rating === 'positive').length;
  const negativeCount = items.filter((i) => i.rating === 'negative').length;
  const neutralCount = items.filter((i) => i.rating === 'neutral').length;

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-emerald-500/10 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0 shadow-md">
            <ClipboardList className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              The Habit Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
              "Until you make the unconscious conscious, it will direct your life and you will call it fate." — C.G. Jung.
              Score your daily automatic behaviors to build awareness before trying to change them.
            </p>
          </div>
        </div>

        {/* Score Tally */}
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {positiveCount}
            </span>
            <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              Positive (+)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-500/10 border border-stone-500/20">
            <span className="text-xl font-extrabold text-stone-700 dark:text-stone-300">
              {neutralCount}
            </span>
            <div className="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
              Neutral (=)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400">
              {negativeCount}
            </span>
            <div className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
              Negative (-)
            </div>
          </div>
        </div>
      </div>

      {/* Add New Scorecard Item Form */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Log a daily automatic behavior (e.g. check phone in bed)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={newItemTime}
            onChange={(e) => setNewItemTime(e.target.value as any)}
            className="text-xs bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
          >
            <option value="morning">Morning</option>
            <option value="day">Day / Afternoon</option>
            <option value="evening">Evening</option>
          </select>

          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setNewItemRating('positive')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                newItemRating === 'positive'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setNewItemRating('neutral')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                newItemRating === 'neutral'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              =
            </button>
            <button
              type="button"
              onClick={() => setNewItemRating('negative')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                newItemRating === 'negative'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              -
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Filter by time */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold">Filter Routine:</span>
        {(['all', 'morning', 'day', 'evening'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterTime(t)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
              filterTime === t
                ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden shadow-sm">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-600 dark:text-stone-400 w-14">
                {item.timeOfDay}
              </span>
              <span className="text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Rating toggle pills */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => onUpdateRating(item.id, 'positive')}
                  title="Marks this as an effective behavior that reinforces your desired identity"
                  className={`w-6 h-6 rounded-md font-bold transition-all cursor-pointer ${
                    item.rating === 'positive'
                      ? 'bg-emerald-600 text-white'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  +
                </button>
                <button
                  onClick={() => onUpdateRating(item.id, 'neutral')}
                  title="Neutral routine behavior"
                  className={`w-6 h-6 rounded-md font-bold transition-all cursor-pointer ${
                    item.rating === 'neutral'
                      ? 'bg-stone-700 text-white'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  =
                </button>
                <button
                  onClick={() => onUpdateRating(item.id, 'negative')}
                  title="Marks this as an ineffective behavior that hinders your desired identity"
                  className={`w-6 h-6 rounded-md font-bold transition-all cursor-pointer ${
                    item.rating === 'negative'
                      ? 'bg-rose-600 text-white'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  -
                </button>
              </div>

              {/* Turn into atomic habit button */}
              {item.rating === 'positive' && (
                <button
                  onClick={() => onConvertToHabit(item.name)}
                  title="Track this positive behavior as an Atomic Habit"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Track</span>
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={() => onDeleteItem(item.id)}
                title="Remove item"
                className="p-1.5 text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-600 dark:text-stone-400">
            No scorecard entries for this filter. Add your daily behaviors above!
          </div>
        )}
      </div>
    </div>
  );
};
